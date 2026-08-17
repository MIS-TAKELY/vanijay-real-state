import { prisma, UserRole } from "@repo/db";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import "dotenv/config";
import { emailOtpVerificationOtp } from "./utils/mail-templates/email-otp-verification";
import {
  changeEmailConfirmation,
  changeEmailVerification,
} from "./utils/mail-templates/change-email";
import { sendEmail } from "./utils/send-mail";
import { sendWhatsAppMessage } from "./utils/send-watsapp";

/**
 * Cookie Domain for sharing the session between the public site (malpoth.com)
 * and the API (api.malpoth.com).
 *
 * Better Auth's own fallback is `new URL(BETTER_AUTH_URL).hostname`, which
 * becomes `api.malpoth.com` in production. Browsers never send that cookie to
 * the parent host, so `/dashboard` (served on malpoth.com) always looks signed
 * out. Prefer CLIENT_URL's host (`malpoth.com`) and ignore an accidental
 * `api.` prefix / localhost.
 */
function resolveCookieDomain(): string | undefined {
  const hostFromUrl = (value: string | undefined) => {
    if (!value) return undefined;
    try {
      return new URL(value).hostname;
    } catch {
      return undefined;
    }
  };

  const raw = process.env.COOKIE_DOMAIN?.trim().replace(/^\./, "");
  const host = raw || hostFromUrl(process.env.CLIENT_URL);
  if (!host) return undefined;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  ) {
    return undefined;
  }
  if (host.startsWith("api.")) return host.slice("api.".length);
  return host;
}

const cookieDomain = resolveCookieDomain();

/** Normalize a URL to its origin (scheme + host + port), or null if invalid. */
function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const clientOrigin = originOf(process.env.CLIENT_URL);
const adminOrigin = originOf(process.env.ADMIN_URL);

// Google OAuth. The customer app is the only app that offers Google sign-in,
// so this allowlist effectively gates the client: accounts whose email domain
// is not listed are rejected. The provider callback runs server-side without
// an Origin header, so per-app discrimination isn't possible here — the admin
// console simply exposes no Google button. Leave GOOGLE_CLIENT_ALLOWED_DOMAINS
// empty to allow any domain.
const googleAllowedDomains = (process.env.GOOGLE_CLIENT_ALLOWED_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

/** Base64url-decode a JWT payload (Google id_token) without external deps. */
function decodeGoogleIdToken(idToken: string): Record<string, unknown> | null {
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;
    return JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    crossSubDomainCookies: {
      enabled: !!cookieDomain,
      domain: cookieDomain,
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
      },
      role: {
        type: "string[]",
        required: false,
        defaultValue: ["BUYER"],
      },
      isVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      agreedToTerms: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      agencyId: {
        type: "string",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      // Two-step flow: confirm at the current address, then verify the new one.
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail(
          user.email,
          "Approve your email change",
          changeEmailConfirmation(url, newEmail),
        );
      },
    },
  },

  emailVerification: {
    // Keep sign-up verification on the existing email-OTP flow.
    sendOnSignUp: false,
    // Used by the change-email flow to verify the new address.
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Verify your new email",
        changeEmailVerification(url),
      );
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Role policy enforced here, at the auth layer, so no session is ever
  // created for the wrong role. The request's Origin header tells us which app
  // the user is signing in from (client vs admin console). OAuth callbacks run
  // server-side without an Origin header, so those are covered by the per-app
  // route middleware (apps/client/proxy.ts, apps/admin/proxy.ts) and the API
  // guards instead.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;

      const email = (ctx.body as { email?: string } | undefined)?.email;
      if (!email) return;

      const originHeader =
        ctx.headers?.get("origin") ?? ctx.headers?.get("referer") ?? undefined;
      const requestOrigin = originOf(originHeader);
      if (!requestOrigin) return; // non-browser callers -> middleware/API guards
      const isClientApp =
        clientOrigin !== null && requestOrigin === clientOrigin;
      const isAdminApp = adminOrigin !== null && requestOrigin === adminOrigin;
      if (!isClientApp && !isAdminApp) return;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
      const roles = user?.role ?? [];
      const isAdmin = roles.includes(UserRole.ADMIN);

      if (isAdminApp && !isAdmin) {
        throw new APIError("FORBIDDEN", {
          message:
            "This account doesn't have admin access. Please sign in with an admin account.",
        });
      }
      if (isClientApp && isAdmin) {
        throw new APIError("FORBIDDEN", {
          message: "Invalid email or password.",
        });
      }
    }),
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmail(
            email,
            "Verify your MALPOTH account",
            emailOtpVerificationOtp(otp),
          );
        }
      },
      // OTP is valid for 5 minutes
      expiresIn: 300,
    }),
    phoneNumber({
      async sendOTP({ phoneNumber, code }) {
        await sendWhatsAppMessage(
          phoneNumber,
          `Your MALPOTH code is: ${code}`,
        );
      },
      expiresIn: 300, // 5 min, like your email OTP
      otpLength: 6,
      allowedAttempts: 3, // defaults
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Mirrors the built-in Google getUserInfo (decodes the id_token Google
      // returns for the "openid" scope in both the authorization-code and
      // id-token flows) and rejects accounts whose email domain isn't on the
      // customer-app allowlist. Returning null fails the sign-in.
      getUserInfo: async (token) => {
        if (!token.idToken) return null;
        const claims = decodeGoogleIdToken(token.idToken);
        if (!claims) return null;
        const email = typeof claims.email === "string" ? claims.email : "";
        if (email) {
          const domain = email.split("@")[1]?.toLowerCase() ?? "";
          if (
            googleAllowedDomains.length > 0 &&
            !googleAllowedDomains.includes(domain)
          ) {
            return null;
          }
        }
        return {
          user: {
            id: String(claims.sub ?? ""),
            name: typeof claims.name === "string" ? claims.name : undefined,
            email: email || null,
            image:
              typeof claims.picture === "string" ? claims.picture : undefined,
            emailVerified: Boolean(claims.email_verified),
          },
          data: claims,
        };
      },
    },
  },

  trustedOrigins: [
    process.env.CLIENT_URL ?? "http://localhost:3000",
    ...(process.env.ADMIN_URL ? [process.env.ADMIN_URL] : []),
  ],
});

export type Auth = typeof auth;
