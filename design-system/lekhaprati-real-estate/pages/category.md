# Category Archive Page (`/category/[slug]`) — Page Override

> This file **overrides** `MASTER.md` for the category archive pages only, per the
> Master file's LOGIC. `MASTER.md` is untouched. Scope: the 5 verified archive
> categories — `residential`, `commercial`, `industrial`, `land`, `institutional`.
> Slugs match the API `MAIN_CATEGORY_GROUPS` keys so the feed filter is exact.

**Score:** Editorial · Archival · Premium (a land-office register, not a feed).
**Density dial:** 3 (spacious, 24–96px) · **Motion dial:** 2 (subtle — hover only).

## Concept: "opening the register"

A category page is not a feed — it is the cover page of one bound volume of the
archive. The header reads like a registry cover: category identity in Fraunces,
a navy **register card** (mono data rows + gold `Verified` seal) as the signature,
then a hairline **index** of the sub-categories, then the inventory grid.

## Do This

### Register card = the one bold element (signature)
- One dark navy card (`bg-navy-deep`, `rounded-2xl`, `border-gold/25`), `topo-bg`
  speckle at `opacity-[0.05]`. Inside, `font-data-table` (IBM Plex Mono) rows:
  **Register / Category / Indexed types / Status**, separated by `border-white/10`
  hairline rules. Status reads `text-gold` "Field-verified".
- Gold seal bottom-right — hand-rolled (`rounded border-2 border-gold/60 bg-gold/10
  text-gold`, `-rotate-6`, uppercase mono) with a `verified` icon. NOT the navy
  `.verification-stamp` class.
- One line under the seal: "Cross-checked against the Malpot land ledger" (white/40).
- No photos inside this card — the header is typographic; the hammer is the seal.

### Category identity
- Breadcrumb row in mono: `Home / <CATEGORY>` (gold-deep on the current segment).
- Section-header recipe on the H1: gold hairline (`h-px w-7 bg-gold`) + uppercase
  gold eyebrow (the category's register descriptor), then
  `font-display-lg text-4xl md:text-[56px] font-bold tracking-tight text-navy`.
- One-line description in `text-on-surface-variant`, `max-w-xl`.
- A compact row of the category's **indexed types** as mono chips
  (`border-outline-variant bg-surface`), so the buyer sees scope at a glance.

### Index strip (sub-categories → search)
- Hairline band (`border-y border-outline-variant`). Label: "Within this register".
- One `Link` per sub-category → `/search?type=<SUB_CATEGORY_KEY>` (the API supports
  subCategory filtering via the `type` param). Each row: mono index number
  (`text-gold-deep`, 01/02/…) + label + `arrow_outward` reveal on hover.
- Layout: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3`.

### Results grid
- Below, server-fetched first page via `propertiesFeed(type: slug)`; "Load more"
  reuses the existing cursor `Pagination`. Grid mirrors search:
  `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md`.
- Result eyebrow: gold hairline + `<N> verified listings` (N = loaded count).
- Empty state: `blueprint-grid` card, `verified` icon in a navy circle w/ gold icon,
  "No verified {category} listings yet", CTA `Browse all properties` → `/search`.

### Meta & navigation
- `generateMetadata`: title `{title} | MALPOTH`, `alternates.canonical`, openGraph.
- BreadcrumbList JSON-LD (Home → Category).
- "Continue browsing" band at the end: sibling categories as mono links.
- Unknown slug → `notFound()`.

## Anti-Patterns (this page only)
- ❌ Gold floods — gold is the seal + eyebrows + mono accents only; navy is the volume.
- ❌ Fake aggregate counts (no total-count API) — never invent "1,248 listings".
  Count only what is loaded.
- ❌ Photos inside the register card (keeps the header typographic).
- ❌ The navy `.verification-stamp` class here — use the gold seal variant.
- ❌ Decorative numbering outside the index strip (numbers only encode register rows).
