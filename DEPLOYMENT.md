# Deploying Lekhaprati on Dockploy — Multi-Domain Guide

This guide walks you through deploying the **real-state** (Lekhaprati) Turborepo
monorepo on a Dockploy server so that every app gets its own custom domain:

| App   | Domain (edit to match yours)       | Container Port |
|-------|------------------------------------|----------------|
| API   | `realstate-api.vanijay.com`        | 5000           |
| Client| `realstate.vanijay.com`            | 3000           |
| Admin | `admin.vanijay.com`                | 3000           |

---

## 0. Prerequisites

- **Dockploy** installed and running on a Linux server (Ubuntu 22.04+ recommended).
  See the [official install guide](https://docs.dokploy.com/docs/installation).
- **Docker + Docker Compose v2** (bundled with Dockploy).
- **Ports 80 and 443** open on the server firewall (Traefik needs them).
- **DNS**: A/CNAME records for the three domains above pointing to your server's
  public IP.  You can verify with `dig +short realstate-api.vanijay.com`.

> **Tip** — Use Dockploy's free `traefik.me` domains for a quick test before
> buying real domains.  You still need to create a certificate in the
> Certificates tab (traefik.me domains are HTTP-only by default).

---

## 1. Create the Docker Compose Project in Dockploy

1. Log in to the **Dokploy dashboard** (usually `https://your-server-ip:3000`
   or your custom URL).
2. Go to **Applications → Docker Compose** → **Create Project**.
3. Give it a name, e.g. `real-state`.
4. Choose **"Git Repository"** if your code lives on GitHub/GitLab (push
   triggers an auto-deploy), or **"Local"** / **"Upload"** for a one-off deploy.
5. Set the **Compose Path** to `docker-compose.yml` and the **Build Server**
   to the same server where Dockploy is installed (the default "Deploy Server").
6. Click **Create Project**.

Dockploy automatically creates an external network called `dokploy-network`
that your containers attach to. Traefik (also managed by Dockploy) listens on
this network and routes traffic to your containers based on the Traefik labels
in `docker-compose.yml`.

---

## 2. Configure Environment Variables

In the Dockploy project dashboard, go to the **Environment** tab and paste the
contents of `.env.example` (or copy `.env` if you have it locally).  Every
variable is written to a `.env` file in the deployment directory and
interpolated into `docker-compose.yml` via `${VAR}`.

### Key variables you MUST customise

| Variable              | Example value                                      | Notes |
|-----------------------|----------------------------------------------------|-------|
| `DATABASE_URL`        | `postgresql://user:pass@db-host:5432/postgres`      | **Required.** Connection string to an existing database (see below) |
| `API_DOMAIN`          | `realstate-api.your-domain.com`                    | Hostname Traefik routes to the API |
| `CLIENT_DOMAIN`       | `realstate.your-domain.com`                        | Hostname Traefik routes to the client |
| `ADMIN_DOMAIN`        | `admin.your-domain.com`                            | Hostname Traefik routes to the admin |
| `CLIENT_URL`          | `https://realstate.your-domain.com`                | Public client origin (CORS + Better Auth) |
| `ADMIN_URL`           | `https://admin.your-domain.com`                    | Public admin origin (CORS + Better Auth) |
| `NEXT_PUBLIC_API_URL` | `https://realstate-api.your-domain.com`            | Public API URL baked into Next.js at build |
| `BETTER_AUTH_SECRET`  | *(run `openssl rand -base64 32`)*                  | Secret for signing auth tokens |
| `BETTER_AUTH_URL`     | `https://realstate-api.your-domain.com`            | Public API URL (cookie domain + redirects) |
| `GOOGLE_CLIENT_ID`    | *(from Google Cloud Console)*                      | OAuth |
| `GOOGLE_CLIENT_SECRET`| *(from Google Cloud Console)*                      | OAuth |

> **PostgreSQL is external to this compose.** Use an existing database — for
> example a **Dockploy-managed Database** (Databases tab) or any hosted
> Postgres — and set its connection string as `DATABASE_URL`. Inside
> Dockploy's network prefer the database's **internal Docker DNS name** over
> the host IP, e.g.
> `postgresql://user:pass@<db-app-name>:5432/postgres`.
> The host-published URL (`postgresql://user:pass@<server-ip>:<port>/postgres`)
> is only needed from outside the server (local dev, DB tools).

---

## 3. Set Up TLS Certificates (HTTPS)

1. In the Dokploy dashboard, go to **Certificates** → **Create Certificate**.
2. Choose **Let's Encrypt** and enter all three domain names so they're
   covered by one certificate:
   - `realstate-api.vanijay.com`
   - `realstate.vanijay.com`
   - `admin.vanijay.com`
3. **Save**.  Dockploy / Traefik will request the certificate from Let's
   Encrypt.  This usually takes a few seconds to a minute.  You'll see a check
   mark when ready.

> **Behind a proxy / firewall?** Use a **Cloudflare API token** (DNS-01
> challenge) instead of HTTP-01 to avoid port-80 reachability issues.

The `certresolver` referenced in every service's Traefik labels is `le`,
which is Dockploy's default Let's Encrypt resolver.

---

## 4. How Each App Gets Its Own Domain (Traefik Labels)

Each service in `docker-compose.yml` has a block of Traefik labels.  Here's
what they do for the **API** (port 5000):


```yaml
labels:
  - "traefik.enable=true"                        # Let Traefik manage this container
  - "traefik.docker.network=dokploy-network"   # Connect via the shared network
  - "traefik.http.middlewares.realstate-redirect-to-https.redirectscheme.scheme=https"
  - "traefik.http.routers.api.entrypoints=web"   # HTTP  (:80) — redirect to HTTPS
  - "traefik.http.routers.api.rule=Host(`realstate-api.vanijay.com`)"
  - "traefik.http.routers.api.middlewares=realstate-redirect-to-https"
  - "traefik.http.routers.api-secure.entrypoints=websecure"  # HTTPS (:443)
  - "traefik.http.routers.api-secure.rule=Host(`realstate-api.vanijay.com`)"
  - "traefik.http.routers.api-secure.tls=true"
  - "traefik.http.routers.api-secure.tls.certresolver=le"    # Let's Encrypt
  - "traefik.http.services.api.loadbalancer.server.port=5000"
```

The same three-router pattern repeats for `client` (port 3000, domain
`realstate.vanijay.com`) and `admin` (port 3000, domain `admin.vanijay.com`).

### Key points

- **`Host(`<domain>`)`** — Traefik matches the incoming `Host` header against
  these domain names, so each container only receives traffic for its domain.
- **`server.port`** — Tells Traefik which container port to forward to.  Even
  though both `client` and `admin` listen on port 3000, they are separate
  containers, so there is no conflict.
- **`web` entrypoint (port 80)** — Handles HTTP and redirects to HTTPS.
- **`websecure` entrypoint (port 443)** — Handles HTTPS with TLS via
  Let's Encrypt.
- **`realstate-redirect-to-https`** — A shared middleware (defined once on the
  `api` service) that redirects HTTP → HTTPS.  It is available to `client`
  and `admin` because Traefik middleware names are global within the Docker
  provider.

---

## 5. How Inter-Service Communication Works

The compose defines two Docker networks:

| Network             | Type     | Purpose |
|---------------------|----------|---------|
| `dokploy-network`   | external | Shared with Dockploy's Traefik AND the Dockploy-managed database.  All public-facing services attach to it so Traefik can route domains, and the API reaches the database through it. |
| `internal`          | bridge   | Private network for inter-service communication (client/admin → API auth rewrites). |

The `next.config.js` rewrites in `client` and `admin` point to
`AUTH_API_URL` (set to `http://api:5000` in the compose environment).  This is
the **internal** Docker service name, so auth requests (`/api/auth/*`) travel
over the private `internal` network — no public internet hop.

Meanwhile, the `NEXT_PUBLIC_API_URL` build arg (set to the public API URL) is
baked into the Next.js bundle and used by the Better Auth client for direct
API calls (GraphQL, REST, session checks) over the public internet via Traefik.


---

## 6. Build & Deploy

1. In the Dockploy dashboard for your `real-state` project, go to the
   **General** tab.
2. Click **Deploy**.
3. Dockploy will:
   - Read your repository and the `.env` file from step 2.
   - Build Docker images for `api`, `client`, `admin` (the `api` build uses
     the `runner` target of `apps/api/Dockerfile` — never the `migrator` stage).
   - Start **api**, then **client** and **admin**.
   - Register all Traefik labels so the three domains are routed correctly.

   > The compose no longer ships a `postgres` or `migrate` service — the
   > database is external (see step 2) and migrations are applied separately
   > (see below).
4. Watch the **Deployments** tab for real-time build logs.  If any step fails,
   the error will be visible there.

---

### Applying schema migrations

Since there is no `migrate` service anymore, apply migrations against your
`DATABASE_URL` manually when the schema changes:

```bash
# From the repo root, with DATABASE_URL exported (or set in .env)
export DATABASE_URL=postgresql://user:pass@db-host:5432/postgres
pnpm --filter @repo/db exec prisma migrate deploy
```

Or build the `migrator` target of `apps/api/Dockerfile` and run it once:

```bash
docker build --target migrator -t lekha-migrator .
docker run --rm -e DATABASE_URL=$DATABASE_URL lekha-migrator
```

---

## 7. Verify & Test

After deployment completes, test each domain:

```bash
# API health
curl -I https://realstate-api.vanijay.com/

# API GraphQL
curl -X POST https://realstate-api.vanijay.com/api/v1/vanijay-real-state \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'

# Client
curl -I https://realstate.vanijay.com/

# Admin
curl -I https://admin.vanijay.com/
```

You should get `200 OK` and, for HTTPS URLs, valid TLS certificates
(Dockploy provisions these automatically via Let's Encrypt).

---

## 8. Environment Variable Reference

### `.env` → `docker-compose.yml` mapping

| Variable             | Used by (compose service)    | Purpose |
|----------------------|------------------------------|---------|
| `DATABASE_URL`       | `api`                        | Connection string to the existing database (required) |
| `CLIENT_URL`         | `api`                        | CORS origin + Better Auth trustedOrigins |
| `ADMIN_URL`          | `api`                        | CORS origin + Better Auth trustedOrigins |
| `BETTER_AUTH_URL`    | `api`                        | Public API URL for cookies & redirects |
| `BETTER_AUTH_SECRET` | `api`                        | JWT signing key |
| `NEXT_PUBLIC_API_URL`| `client`, `admin` (build arg)| Public API URL baked into Next.js |
| `API_DOMAIN`         | `api` (Traefik label)        | Hostname for API domain routing |
| `CLIENT_DOMAIN`      | `client` (Traefik label)     | Hostname for client domain routing |
| `ADMIN_DOMAIN`       | `admin` (Traefik label)      | Hostname for admin domain routing |
| `AUTH_API_URL`       | `client`, `admin` (runtime)  | Internal Docker URL for `/api/auth/*` rewrites |
| `GOOGLE_CLIENT_ID`   | `api`                        | OAuth client |
| `GOOGLE_CLIENT_SECRET`| `api`                       | OAuth secret |
| `SMTP_*`             | `api`                        | Email delivery |
| `CLOUDINARY_*`       | `api`                        | File uploads |
| `WHATSAPP_API_URL`   | `api`                        | OTP delivery |

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| API crash-loops with `Cannot find module 'prisma/config'` | API image built from the wrong Dockerfile stage | The `api` build must use `target: runner` in Dockploy; `migrator` must never be the last stage |
| `connection refused` / `role does not exist` on the database | Wrong `DATABASE_URL` | Set `DATABASE_URL` to the real DB (user/db may differ from the compose defaults) and redeploy |
| 403/401 from API on admin domain | `ADMIN_URL` missing from CORS | Add `ADMIN_URL=https://admin.vanijay.com` to `.env`, redeploy |
| Blank page on client/admin | `NEXT_PUBLIC_API_URL` not set at build time | Ensure the build arg is set in `.env` |
| Auth cookies not persisting | `BETTER_AUTH_URL` set to wrong domain | Must be the **public** API URL (`https://realstate-api.your-domain.com`) |
| `/api/auth/*` returns 500 | `AUTH_API_URL` doesn't resolve | Set the `AUTH_API_URL` build arg to the API's internal Docker DNS name or its public URL |
| HTTPS not working | Certificate not issued or port 443 blocked | Check **Certificates** tab; ensure ports 80 & 443 are open |
| 404 from Traefik | Domain doesn't match any `Host()` rule | Verify `API_DOMAIN`, `CLIENT_DOMAIN`, `ADMIN_DOMAIN` in `.env` |
| Migrations failed | Schema drift or dirty migration history | Run `prisma migrate resolve` manually inside the `migrate` container |
| `.env` changes not picked up | Compose not redeployed | Click **Redeploy** in Dockploy after changing env vars |

---

## 10. Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │              Internet              │
                    │  (port 80/443 → Dockploy server IP) │
                    └──────────────┬────────┬───────────┘
                                   │        │
                    ┌──────────────▼──┐    ┌──▼──────────────┐
                    │   Traefik       │    │  Let's Encrypt   │
                    │  (reverse proxy)│    │  cert resolver  │
                    └────────┬────────┘    └────────┬────────┘
                             │                      │
                    ┌────────▼────────┬─────────────┴──────┐
                    │  Host() routing │  (TLS termination)  │
                    └────────┬────────┴─────────┬────────┘
                             │                  │
          ┌──────────────────┼────────┬─────────┼──────────────────┐
          │                  │        │         │                  │
          ▼                  ▼        │         ▼                  ▼
   ┌────────────┐    ┌────────────┐   │   ┌────────────┐    ┌────────────────┐
   │  api:5000  │    │client:3000 │   │   │admin:3000 │    │  PostgreSQL    │
   │  (NestJS)  │◄───┤(Next.js)  │   │   │(Next.js)  │◄───┤ (external — via │
   └────────────┘    └────────────┘   │   └───────────┘    │  DATABASE_URL)  │
          │               │           │         │               └────────────────┘
          │  http://api:5000 ─────────┴─────────┘  (internal DNS)
          │  (auth + API rewrites)
          │
          └───────────── internal network ─────────────┘
                (shared with dokploy-network for Traefik + DB)
```

### Service dependency graph

```
PostgreSQL (external — Dockploy Database / hosted)  ◄──  api (NestJS, port 8000)
                                                              ↗        ↖
                                                         client         admin
                                                       (port 3000)    (port 3000)
```
