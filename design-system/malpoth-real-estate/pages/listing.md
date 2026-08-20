# Listing Detail Page (`/[slug]`) — Page Override

> This file **overrides** `MASTER.md` for the listing detail page only, per the
> Master file's LOGIC (check `design-system/pages/[page-name].md` first).
> `MASTER.md` is untouched.

**Score:** Simple · Light · Easy to use — Minimalism / Swiss styling.
**Density dial:** 3 (spacious, 24–96px) · **Motion dial:** 2 (subtle).
**Scope:** `apps/client/app/(real-state)/[slug]/page.tsx` + its components
(`ListingGallery`, `ListingDecisionCard`, `ListingDescription`,
`ListingSidebarMap`, `RichTextContent`, `MobilePriceBar`).

## Do This

### Gold is a single accent, not chrome
- ✅ **Only three gold moments on this page:** the asking price figure
  (`text-gold-deep`, mono), the primary **Call Seller** CTA (`bg-gold`), and
  the active map pin (MASTER dark-map rule).
- ❌ No gold section bars, no gold top borders on cards, no gold thumbnail
  rings, no gold breadcrumb separators.

### Uniform quiet navy headings
All section headings are one voice:
```
text-lg font-semibold tracking-tight text-navy (Fraunces)
```
No gold hairline/eyebrow bars here — the page stays editorial and light.

### Key Facts strip (must-do)
Under the title/location: 4 compact mono chips pulled from the spec rows —
**Land Area · Road Access · Facing · Property Type** (render only present
values). Chip = `border-outline-variant bg-surface`, tiny uppercase label +
`mono-stat` value. Gives buyers the essentials without reading the table.

### Light spec grid (no ledger box)
Specifications & Location: a `<dl>` with soft `divide-y divide-outline-variant`
rows, `grid gap-1 sm:grid-cols-[200px_1fr] sm:gap-6`, labels
`text-on-surface-variant`, values `text-on-surface font-medium`.
No enclosing box, no border-t-gold.

### Touch & layout
- Mobile sticky bottom bar (`MobilePriceBar`, `z-40`): price + Call Seller +
  Save heart. **Raises itself above `CompareBar`** (`bottom-[72px]`) when the
  compare tray is active (2+ items), else `bottom-0`. Add `h-28 lg:hidden`
  clearance before the footer.
- Decision card CTAs: Call Seller full-width `min-h-11`, then `grid-cols-2
  gap-2` (8px) for Add to Cart + Save. Per-unit price select `min-h-10`.
- Gallery tabs `h-9`, full-width on mobile; thumbnails `w-24 sm:w-28`, active
  indicator `ring-primary` (navy), not gold.

### A11y
- Gallery header = real `role="tablist"` → `role="tab"` (with `aria-selected`,
  `aria-controls`, roving `tabIndex`) + `role="tabpanel"` + arrow-key nav.
- Lightbox: focus trap, focus restore to opener on close, body scroll lock,
  Escape closes.
- Description body uses `text-on-surface` (readability), not muted.

## Anti-Patterns (this page only)
- ❌ Gold anywhere except price + primary CTA + map pin.
- ❌ `/#listings` breadcrumb — "Listings" links to `/search`.
- ❌ Taking Add-to-Cart / Save off-screen on mobile — keep them in the bottom
  bar and the decision card.
- ❌ Ledger/bordered spec box — use the light divide grid.
