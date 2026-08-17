# Design System Master File — Lekhaprati Real Estate

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Lekhaprati Real Estate
**Generated:** 2026-08-17
**Category:** Luxury/Premium Brand
**Source:** Brand palette extracted from `apps/client/public/logo.webp` — a
deep-navy roundel (`#103050`–`#104070`) crowned in brass gold (`#c0a040`–`#c0a050`)
on warm white. The previous green theme (`#244530`) clashed with the logo and was
replaced.

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary (navy) | `#103050` | `--color-primary` / `--color-navy` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Primary Container | `#D3E1F5` | `--color-primary-container` |
| On Primary Container | `#B7CFF0` | `--color-on-primary-container` |
| Secondary | `#55637A` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent / CTA (brass gold) | `#C9A227` | `--color-gold` |
| On Gold (navy text on gold) | `#10283F` | `--color-on-gold` |
| Gold — text on light | `#8A6D1D` | `--color-gold-deep` |
| Gold — soft tint | `#E8D9A8` | `--color-gold-soft` |
| Navy — deep (footer, overlays) | `#0A2540` | `--color-navy-deep` |
| Background (warm paper) | `#FBFAF7` | `--color-background` |
| Surface | `#FFFFFF` | `--color-surface` |
| Foreground | `#171A1F` | `--color-foreground` |
| Muted | `#E5E8EC` | `--color-muted` |
| Muted Foreground | `#6E7886` | `--color-muted-foreground` |
| Border / Outline variant | `#C7CFD8` | `--color-border` / `--color-outline-variant` |
| Destructive / Error | `#BA1A1A` | `--color-destructive` / `--color-error` |
| Ring (focus) | `#103050` | `--color-ring` |

**Color Notes:** Navy = trust, authority, cadastral records. Gold = the crown in
the logo — used *sparingly* for premium detail only: CTAs, section eyebrows,
price figures, verified stamps, hairlines, active map pins. Never flood a screen
with gold.

### Typography

- **Heading Font:** Fraunces (display serif) — `--font-display-lg`, `--font-headline-md`
- **Body Font:** Public Sans — `--font-body-md`, `--font-body-lg`
- **Data Font:** IBM Plex Mono — `--font-data-table`, `--font-data-price`
- **Mood:** editorial, archival, premium
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&display=swap`

**CSS Import:**
```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&display=swap");
```

### Section-Header Recipe (premium eyebrow)

Eyebrows are uppercase, letter-spaced gold text preceded by a 28px gold hairline:

```
<p class="mb-2 flex items-center gap-2.5 font-label-sm text-[11px] uppercase tracking-[0.18em] text-gold-deep font-bold">
  <span class="h-px w-7 bg-gold" aria-hidden />
  {Eyebrow}
</p>
<h2 class="font-headline-md text-headline-md text-navy font-bold tracking-tight">{Title}</h2>
```

### Verified / Trust Marks

- Verified stamp on listing cards: navy chip (`bg-navy/95`) + gold text + gold
  border + blur, uppercase 10px.
- Price figures: `text-gold-deep` in IBM Plex Mono (4.9:1 contrast on white).

### Dark Map UI (Google + Leaflet)

Dark navy canvas (`#0A2540` / `#0B1424`) with gold active states (`#C9A227`),
steel-blue secondary labels (`#A8BFD9`), soft-gold tints (`rgba(232,217,168,…)`)
for muted text. Success/error semantics stay green/red.

---

## Component Specs

### Primary Button (CTA)

Gold fill + navy text — reserved for the money CTA ("List a Property", hero CTA):

```
<Button className="bg-gold text-on-gold shadow-sm hover:bg-gold/90">…</Button>
```

### Default Button

Navy fill + white text via `bg-primary text-on-primary` (shadcn `default` variant).

### Property Card

- `rounded-2xl`, `border-outline-variant`, hover `-translate-y-1` + `shadow-lg`.
- Title: Fraunces semibold navy; Price: mono `text-gold-deep`; Listing code chip: mono.
- Verified stamp: navy + gold (see above).

### Footer

Deep navy (`bg-navy-deep`), white/70 body text, gold uppercase headings,
gold hairlines (`border-gold/20`), logo roundel with gold ring,
gold "Systems Nominal" pulse indicator.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Any green from the old theme** — `#244530`, `#3b5d46`, `#44664e`, `#4ade80`,
  `#22c55e`, `#0d1a14` (replaced by navy/gold)
- ❌ Emojis as icons — use Lucide / Material Symbols
- ❌ Missing `cursor-pointer` on clickable elements
- ❌ Gold floods — gold is an accent, navy is the volume color
- ❌ Low-contrast gold text on white — use `text-gold-deep` (`#8A6D1D`), not `#C9A227`
- ❌ Instant state changes — keep 150–300ms transitions
- ❌ Invisible focus states (keep `focus-visible` rings)

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (use SVG / Lucide / Material Symbols)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast 4.5:1 minimum (`text-gold-deep` for gold-on-white)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
