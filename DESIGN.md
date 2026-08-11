# Lekhaprati — Complete UI Design System

> **Product**: Lekhaprati (लेखाप्रति — "a true copy of the record") — Nepal's verified land & property archive.
> **Apps**: `apps/client` (public marketplace + user dashboard) · `apps/admin` (operations console)
> **Stack**: Next.js 16 · Tailwind CSS 4 · React 19 · Leaflet (maps) · Zustand · Better Auth · NestJS/GraphQL API
> **Last updated**: Aug 2026

---

## Table of Contents

1. [Design Foundations](#1-design-foundations)
2. [Shared Component Library](#2-shared-component-library)
3. [Client App — Public Pages](#3-client-app--public-pages)
4. [Client App — Authentication](#4-client-app--authentication)
5. [Client App — User Dashboard](#5-client-app--user-dashboard)
6. [Admin App — Operations Console](#6-admin-app--operations-console)
7. [Responsive Behavior](#7-responsive-behavior)
8. [Accessibility & States](#8-accessibility--states)
9. [User Flows](#9-user-flows)

---

# 1. Design Foundations

## 1.1 Design Philosophy

Lekhaprati is an **archive**, not a listing feed. The visual language borrows from land revenue offices, cadastral survey maps, and legal ledgers — then strips away the bureaucracy. Three principles govern every screen:

1. **Trust is the product** — verification states, document status, and government valuations are always visible, never buried.
2. **Data density without clutter** — prices, areas, and plot IDs are rendered in monospace; prose stays in a warm serif/sans pair.
3. **Terracotta means action, green means verified** — color is semantic, never decorative.

## 1.2 Color System

Semantic tokens (Tailwind theme tokens, defined in `globals.css`):

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#244530` | Deep forest green. Primary buttons, active nav, verified accents |
| `primary-container` | `#3b5d46` | Hover fills, selected states |
| `on-primary` | `#ffffff` | Text on primary |
| `secondary` | `#54615a` | Muted green-grey. Secondary text, subtle icons |
| `secondary-container` | `#d8e6dc` | Soft green fills — info banners, badges, selected rows |
| `tertiary` | `#7d1118` | Deep vermillion. Verification stamps, urgent badges, price drops |
| `tertiary-container` | `#9e2b2c` | Hover state for tertiary elements |
| `error` | `#ba1a1a` | Form errors, destructive confirmations |
| `error-container` | `#ffdad6` | Error banners, rejected document chips |
| `surface` | `#fbf9f4` | Main background — warm paper white |
| `surface-container-low` | `#f5f3ee` | Alternate sections |
| `surface-container` | `#f0eee9` | Cards, chips, input fills |
| `surface-container-high` | `#eae8e3` | Hover states on list rows |
| `surface-container-highest` | `#e4e2dd` | Dividers on dark, pressed states |
| `on-surface` | `#1b1c19` | Primary text |
| `on-surface-variant` | `#424842` | Secondary text, captions |
| `outline` | `#727972` | Input borders (resting) |
| `outline-variant` | `#c2c8c0` | Card borders, dividers |
| `background` | `#fbf9f4` | Page background |
| `inverse-surface` | `#30312e` | Tooltips, toast backgrounds |
| `inverse-on-surface` | `#f2f1ec` | Text on inverse surfaces |

**Semantic color rules:**
- 🟢 Green (`primary` family): verified, live, success, "go" actions
- 🔴 Vermillion (`tertiary` family): verification stamps, price-drop flags, heritage signatures — *never* used for errors
- 🔴 Red (`error` family): failures, rejections, destructive actions only
- Amber `#b45309` (utility): pending states, expiring documents, draft status

## 1.3 Typography

Three font families, loaded via Google Fonts + local Geist fallbacks:

| Role | Font | Size / Weight | Usage |
|---|---|---|---|
| **Display** | Fraunces (serif) | 48px/700, tight tracking | Hero headlines, page titles |
| **Headline** | Fraunces (serif) | 28px/500–600 | Section headers, card titles, property titles |
| **Body Large** | Public Sans | 18px/400 | Intro paragraphs, feature descriptions |
| **Body** | Public Sans | 15px/400 | Default UI text, descriptions |
| **Label** | Public Sans | 13px/600 | Buttons, chips, form labels, uppercase tracking `0.6px` |
| **Data/Price** | IBM Plex Mono | 16–32px/500 | Prices (`NPR 2,45,00,000`), plot IDs, areas, listing codes, table cells |

**Type rules:**
- All prices, listing codes (`LOT-442-BHA`), land areas (`0-4-0-0 Ropani`), and phone numbers render in **IBM Plex Mono** — data must feel copied from a ledger.
- Headlines in **Fraunces** with `font-feature-settings: "ss01"` for editorial character.
- Never center body copy; headlines may center only in hero sections.

## 1.4 Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Icon gaps, inline badges |
| `sm` | 12px | Chip padding, tight stack |
| `base` | 8px | Base grid unit |
| `md` | 24px | Card padding, section gaps |
| `lg` | 48px | Section vertical rhythm |
| `xl` | 80px | Page section separators |
| `gutter` | 24px | Horizontal page padding |
| `container-max` | 1280px | Max content width, centered |

**Grid**: 12-column on desktop (`≥1024px`), 8-column on tablet, 4-column on mobile. Card grids: 3-col → 2-col → 1-col.

## 1.5 Elevation & Shape

- **No drop shadows on resting cards** — borders (`1px outline-variant`) define boundaries, like ledger lines.
- Shadows appear only on: hover-lifted cards (`0 8px 24px rgba(0,0,0,0.08)`), dropdowns, modals, sticky bars.
- **Radius scale**: `4px` (chips, small buttons) → `8px` (inputs, buttons) → `12px` (dropdowns) → `16px` (cards) → `full` (avatars, pills).
- Signature textures:
  - `.topo-bg` — radial dot grid (survey-map contour dots), 6% opacity, hero/section backgrounds
  - `.blueprint-grid` — 40px line grid, used in empty states and map-adjacent panels
  - `.verification-stamp` — rotated `-6deg`, 2px vermillion border, uppercase — the brand's trust mark

## 1.6 Iconography

- **Material Symbols Outlined** (`@repo/ui` `<Icon>`), weight 300, optical size 24, `FILL 0`. Filled variant only for verified badges (`verified` icon) and active nav.
- **Lucide React** for auth/user affordances (`User`, `LogOut`, `ChevronDown`).
- Icons at `16px` inline with 13px labels; `24px` standalone; `48px` in empty states.

---

# 2. Shared Component Library

Components live in `packages/ui` and app-level `components/`. Each entry: anatomy, states, and variants.

## 2.1 Buttons

| Variant | Style | Usage |
|---|---|---|
| **Primary** | `bg-primary text-on-primary rounded-md`, hover `bg-primary/90`, h-11 | Main CTAs: "View Details", "Submit", "Save" |
| **Secondary** | `border border-outline-variant text-on-surface`, hover `border-primary text-primary` | Alternative actions: "Add to Cart", "Cancel" |
| **Tertiary/Stamp** | `.verification-stamp` style | Verification badges — not clickable by default |
| **Ghost** | `text-on-surface-variant hover:text-primary hover:bg-surface-container` | Nav items, quiet actions |
| **Destructive** | `bg-error text-on-error` | Delete, reject — always paired with confirm dialog |
| **Icon button** | `h-10 w-10 rounded-lg`, icon centered | Hamburger, close, map controls |

States: `hover` (color shift ≤200ms), `focus-visible` (`ring-2 ring-primary/40`), `disabled` (`opacity-50 cursor-not-allowed`), `loading` (spinner replaces label, width locked).

## 2.2 Badges & Chips

| Badge | Style | Meaning |
|---|---|---|
| **Verified Archive** | `bg-surface/95 text-tertiary`, `verified` filled icon, uppercase 10px | Level 2+ doc-verified listing |
| **Field Verified** | `bg-primary text-on-primary` | Level 3 — surveyor visited |
| **Pending** | `bg-[#b45309]/10 text-[#b45309]` | Under verification |
| **Price Drop** | `bg-tertiary text-on-tertiary`, `trending_down` icon | askingPrice < originalAskingPrice |
| **Draft** | `bg-surface-container-high text-on-surface-variant` | Unpublished |
| **Status chips** | Colored dot + 13px label | Inquiry/document/appointment statuses (see §8.3) |
| **Filter chip** | `rounded-full border px-3 py-1.5`, `×` when active | Search filter tags |

## 2.3 Form Inputs

- **Text input**: `h-11 rounded-md border border-outline bg-surface px-3`, focus `border-primary ring-2 ring-primary/20`, label 13px/600 above, error text 13px `text-error` below with `error` icon.
- **Select / Combobox**: same chrome; district/municipality selects are cascaded (province → district → municipality → ward).
- **Land area input group**: three inline numeric inputs (Ropani / Aana / Paisa) *or* (Bigha / Katha / Dhur) with a system toggle; auto-computed `totalSqFt` shown read-only in mono.
- **File upload**: dashed `outline-variant` dropzone, `upload_file` icon 48px, accepted types + 10MB cap noted; after upload → file row with name, size (mono), progress bar, `delete` icon button.
- **OTP input**: 6 individual cells, `w-11 h-12`, mono font, auto-advance, paste splits across cells.
- **Toggle**: pill 44×24, `bg-primary` when on — used for alert frequencies, `notifyOnPriceChange`.

## 2.4 Cards

**Property Card** (exists — `PropertyCard.tsx`):
```
┌────────────────────────────┐
│ [cover img 192px, hover zoom]│
│ [Verified Archive badge]    │
├────────────────────────────┤
│ Title (Fraunces 18px)      │
│ ID: LOT-442-BHA (chip)     │
│ NPR 2,45,00,000 (mono, green)│
│ Bhaisepati, Lalitpur        │
│ ─────────────               │
│ · 0-4-0-0 Ropani · South    │
│ · 20ft Pitched Road         │
│ [Add to Cart] [View Details]│
└────────────────────────────┘
```
Hover: `-translate-y-1`, border → `primary/40`, shadow-lg. Radius `rounded-2xl`.

**Stat card** (dashboards): label 13px uppercase, value IBM Plex Mono 32px, delta chip (`+12%` green / `-3%` tertiary), sparkline optional.

**Document card**: file icon by type, name, type chip (`Lalpurja`, `Tax Clearance`…), status chip, expiry warning row if `expiryDate < 90d`.

## 2.5 Navigation

**Client Navbar** (exists — `Navbar.tsx`): sticky, `h-16 sm:h-20`, `bg-surface/90 backdrop-blur-md`, bottom border. Left: logo (domain icon in rounded primary square + "Lekhaprati" Fraunces). Center: nav links with animated underline (`scale-x` transition). Right: "List a Property" primary button, auth avatar dropdown / "Sign in", mobile hamburger → full-height panel. Nav items: Home, Listings, Area Guide, NRN Concierge, About.

**Footer**: 4-col grid (brand + tagline / Explore / Services / Contact), newsletter input, bottom bar with © + privacy/terms links in 13px variant text. `bg-surface-container-low` with top border.

**Admin sidebar** (see §6.1) — distinct from client: dark `inverse-surface` rail, 240px, collapsible to 64px icon rail.

## 2.6 Modals & Overlays

- **Modal**: centered, max-w-md (auth) to max-w-3xl (property preview), `rounded-2xl bg-surface`, scrim `black/40 backdrop-blur-sm`, close `×` top-right, `Escape` to close, focus trapped.
- **Slide-over panel** (filters, cart, notifications): right-anchored, `w-[400px] max-w-full`, full height, slides in 300ms.
- **Toast**: bottom-right stack, `bg-inverse-surface text-inverse-on-surface rounded-lg px-4 py-3`, icon by severity, auto-dismiss 5s, action link optional.
- **Confirm dialog**: max-w-sm, destructive icon in `error-container` circle, title + consequence copy, [Cancel] [Confirm destructive].

## 2.7 Data Display

- **Table**: header 13px uppercase `text-on-surface-variant`, row `h-14`, cells mono for IDs/prices/dates, row hover `bg-surface-container-high`, sticky header, row actions revealed on hover (`...` menu).
- **Pagination**: « 1 2 3 … 12 » with current page `bg-primary text-on-primary rounded-md`; page-size select [10/25/50]; "Showing 1–25 of 312" in mono 13px.
- **Empty state**: `blueprint-grid` background panel, 48px outline icon, Fraunces headline ("No listings match your filters"), body copy, one primary action.
- **Skeleton**: shimmer blocks matching card/table geometry — never spinners for initial page loads.
- **Timeline** (verification/appointment history): vertical rail, `2px outline-variant` line, dots colored by event type, mono timestamps.

## 2.8 Map Components (Leaflet)

- **Price pin** (`.lp-pin`): pill `bg-primary text-on-primary px-2 py-1 rounded-md`, mono 11px price (lakhs/crores shorthand: `₨ 2.45 Cr`), hover scales 1.1, active pin turns `tertiary`.
- **Tooltip** (`.lp-tooltip`): `bg-primary`, 11px bold — district name + listing count.
- **Map controls**: top-right stacked, 40px square buttons — zoom ±, layers (satellite/street), fullscreen, "draw area" polygon tool.
- **Mode switcher**: segmented control [Map | Satellite | Cadastral].
- **Legend**: bottom-left card — pin colors, verification heatmap scale.
- **Detail card**: on pin click, right-side floating card (320px) with cover thumb, title, price mono, area, [View Listing].

---

# 3. Client App — Public Pages

Route group `(public)`. All pages share Navbar + Footer, `max-w-container-max` centered, `px-gutter`.

## 3.1 Home `/`

**Section 1 — Hero**
- Layout: full-width, min-h-[560px], `.topo-bg` over `surface`; 2-col on desktop (copy left 55% / map preview right 45%), stacked mobile.
- Eyebrow: mono 13px uppercase `text-tertiary` — "NEPAL'S VERIFIED LAND ARCHIVE".
- H1 (Fraunces 48–64px): "Buy land with the paperwork already done."
- Sub (18px, on-surface-variant, max-w-prose): "Every listing carries its Lalpurja, tax clearance, and cadastral map — verified before it goes live."
- **Search bar** (hero centerpiece): elevated card `rounded-2xl shadow-lg p-2`, segmented tabs [Buy Land | Buy House | Commercial], fields: Location combobox (district/municipality), Property type select, Budget range (min–max mono inputs), primary button "Search the Archive" (`search` icon).
- Trust strip below: three mono stats — `2,847 verified parcels` · `77 districts covered` · `Rs 0 hidden fees`.

**Section 2 — Map Explorer** (`MapExplorer.tsx` / `NepalmapWrapper`)
- Full-bleed section `h-[640px]`: Leaflet map left (65%), sidebar right (35%).
- Sidebar: "Explore by District" headline, search input, scrollable district list — each row: district name, listings count (mono), avg price/aana (mono), hover reveals `→`.
- Map shows province polygons (geojson), price pins on live listings, hover tooltip.
- Bottom-left of map: mode switcher + legend.

**Section 3 — Browse by Intent** (`BrowseByIntent`)
- 4-card grid: Residential Land / Heritage Homes / Commercial / Agricultural — each card: `.blueprint-grid` thumb with line icon, Fraunces title, count chip, short descriptor, arrow link. Hover lifts.

**Section 4 — Verified Property Carousel** (`PropertyCarousel`)
- Headline row: "Fresh to the Archive" + [View all →].
- Horizontal scroll-snap row of PropertyCards (4 visible), edge-fade masks, prev/next round buttons, `animate-scroll` auto-drift pausing on hover.

**Section 5 — Verification Steps** (`VerificationSteps`)
- 3-step horizontal process (numbered mono `01 02 03`): Document Submission → Desk Verification → Field Survey & Stamp. Each: icon in `secondary-container` circle, Fraunces title, 2-line copy. Connected by dashed line. Right side: `.verification-stamp` large decorative mark.

**Section 6 — Trust Stack** (`TrustStack`)
- Dark section `bg-inverse-surface text-inverse-on-surface` (contrast break): 3 stat blocks (mono 48px: listings verified %, avg days-to-verify, disputes resolved), plus partner/office row (Land Revenue Office logos as outline text badges).

**Section 7 — Ask the Archive** (`AskArchive`)
- Q&A teaser: left — Fraunces headline "Ask the Broker", select category chips (Legal, Financing, NRN, Area); right — 3 recent question cards (category chip, question excerpt, answer count mono, area tag). CTA: "Browse all questions →" + [Ask a question] primary (opens auth modal if logged out).

**Section 8 — NRN Concierge banner** (`NRNConcierge`) — split card: left copy targeting Non-Resident Nepalis ("Buy from abroad. We verify on the ground."), right —booking-card mock with video-call icon. CTA: "Book a concierge call".

**Section 9 — Activity Ticker** (`ActivityTicker`): thin marquee strip, mono 13px: "LOT-512-KTM marked SOLD · New listing in Pokhara Ward 6 · Price drop −8% in Bhaktapur…" `animate-scroll`.

## 3.2 Listings / Search `/listings`

**Layout**: filter sidebar left (280px, sticky, collapsible on mobile into slide-over) + results grid right.

**Results Header** (`ResultsHeader.tsx`):
- Row 1: Breadcrumb (Home / Listings / {District}), result count mono ("247 parcels"), sort select [Newest | Price ↑ | Price ↓ | Area | Verified first].
- Row 2: active filter chips with `×`, "Clear all" ghost, "Save search & alert" button (bell icon — opens frequency popover: Instant / Daily digest / Off → creates `SavedSearch`).
- View toggle: [Grid | List | Map-split].

**Search Filters** (`SearchFilters.tsx`) — accordion groups:
1. **Location**: Province → District → Municipality → Ward cascaded selects; area-name text field.
2. **Price**: min–max mono inputs + histogram slider (listing counts per bracket).
3. **Land Area**: unit system toggle (Ropani/Bigha), min–max Aana (or Katha) sliders.
4. **Property Type**: checkbox list (6 enum values with icons).
5. **Verification**: radio — Any / Doc Verified (L2) / Field Verified (L3) — with stamp icons.
6. **Road & Facing**: road type multi-select (Pitched/Gravel/Soil/Block-paved/Footpath), min road width (ft), facing direction 8-way compass picker, "Corner plot only" toggle.
7. **Status extras**: "Price drops only", "Has video walkthrough", "Sold records (comps)".

Apply is instant (no Apply button); filter count badge on mobile filter button.

**Property Card** — as §2.4.

**Pagination** — as §2.7.

**Map-split view**: results list left 45%, live Leaflet map right 55% with price pins synced to scroll/hover (card hover → pin highlight tertiary).

## 3.3 Property Detail `/listings/[slug]`

**Above the fold**:
- Breadcrumb + listing code chip (`LOT-442-BHA`) + status badge + `.verification-stamp` (if L2+, rotated, absolute over gallery corner).
- Title (Fraunces 32px), location line with `location_on` icon: "Bhaisepati, Lalitpur — Ward 10" +Province.
- **Gallery**: main image 16:9 (rounded-2xl), thumbnail strip below (5 visible, scroll), count badge "1/12", badges on main: [Video walkthrough ▶] [Cadastral map] toggles overlay the corresponding media type. Lightbox on click with keyboard nav.

**Two-column body** (content 65% / sticky sidebar 35%):

*Left column*:
1. **Key specs strip** — 6-cell grid, each: icon + label 11px uppercase + mono value: Area `0-4-0-0 Ropani (2,196 sqft)` · Facing `South` · Road `20 ft Pitched` · Type `Residential Land` · Corner `Yes` · Price/Aana `NPR 61,25,000`.
2. **Description** — prose, 18px leading relaxed.
3. **Location & Map** — embedded Leaflet (300px), parcel boundary polygon if `parcelBoundary` exists; address text; ward/district chips; "Street-view style photos" opens StreetViewModal.
4. **Documents & Verification** — the trust centerpiece:
   - Verification level banner: L3 field-verified → green banner with surveyor name + date; L2 → `secondary-container` banner "Documents verified by Lekhaprati desk — field visit pending".
   - Document checklist table (public-safe docs only): Type chip, status chip (VERIFIED green / PENDING amber), verified date mono. Private docs (`isPrivate`) shown as "On file — available during due diligence" lock row.
   - Verification audit timeline (public entries): level transitions with mono dates.
5. **Government valuation** — lookup from `GovValuationRate`: info card "Govt. minimum rate for Ward 10 pitched-road plots: NPR 41,00,000/aana (LRO Lalitpur, FY 2081/82)" with comparison bar: asking vs govt rate.
6. **Sold-price comps** — if sale records exist nearby: mini table of 3–5 comparable sales (area, sold price/aana mono, sold date), powering a small trend sparkline.
7. **Q&A on this listing** — questions scoped to property; ask box (auth-gated); answers show author badge (Owner / Agent / Verified Broker).

*Right sidebar (sticky, top-24)*:
- **Price card**: asking price mono 32px primary, price/aana beneath, price-drop chip if applicable (original struck through), updated date.
- CTAs stacked: [Request Video Walkthrough] primary · [WhatsApp Seller] `secondary` with brand icon · [EMI Calculator] ghost with `calculate` icon → expands inline calculator (loan amount, rate %, years → monthly EMI mono).
- **Agent/Owner card**: avatar, name, role badge ("Verified Agent" / "Owner" / agency name with seat count), response-time mono stat, [Call] [Message] icon buttons revealing contact after auth.
- **Book Officer Appointment** card: "Want an official record check?" — date picker + [Request Appointment] (creates `OfficerAppointment`).
- Favorite heart-toggle (top of card) + share dropdown (copy link / WhatsApp / Viber).
- Safety note, 12px variant text: "Always verify the Lalpurja at the Land Revenue Office before payment."

## 3.4 Area Guide `/area-guid`

- **Hero**: dark, Fraunces headline "Every district, on the record.", district search combobox.
- **Architecture of Trust** (`ArchitectureOfTrust`): explainer strip — how verification levels work, stamp legend.
- **District Ledgers** (`DistrictLedgers`): interactive district table — columns: District, Live listings, Avg NPR/aana, 12-mo trend sparkline, Avg days-to-sell, Verified %. Row click → district detail drawer: price heat strip by municipality, top wards table, recent sold records (mono), gov rate changes log.
- **NRN Banner** (`NRNBanner`): cross-link to concierge.

## 3.5 NRN Concierge `/nrn-concierge`

- **Hero**: split — left copy "Own land back home, without the risk of distance", right appointment-card mock; mono stat row (NRN buyers served, countries, avg completion days).
- **Remote Window** (`RemoteWindow`): how remote buying works — 4 steps with device/video icons (Video walkthrough → Digital doc review → Officer appointment → Remote closing via PoA).
- **Eligibility & Docs** (`EligibilityAndDocs`): two-col checklist — NRN eligibility criteria; required documents (passport, NRN ID, PoA format) each with `description` icon and sample-download link.
- **Verified Stamp** (`VerifiedStamp`): oversized `.verification-stamp` gallery — examples of stamped listings with mono case numbers.
- **Process & Booking** (`ProcessAndBooking`): embedded booking form — name, country, WhatsApp number, preferred window (timezone-aware select), [Book free call] → creates inquiry of type `VIDEO_WALKTHROUGH_REQUEST`.

## 3.6 About `/about`

- **Hero**: Fraunces statement headline, team photo duotone green.
- **Story** / **Timeline**: vertical timeline (2019 founded → 2024 field-verification launch → 2026…), mono years.
- **Values**: 4 cards (Verification first / Open data / No hidden fees / Local expertise).
- **Stats**: mono counters row. **Leadership**: avatar cards, role in mono caps.
- **CTA**: "List with the archive" + "Browse verified listings".

## 3.7 Community Q&A `/questions` *(new page)*

- Header: "Ask the Broker" + [Ask a Question] primary.
- Category tabs: All / Legal / Financing / NRN / Area Specific / General (from `QuestionCategory`).
- Question list rows: category chip, area tag chip, question title, answer count + latest answerer badge, mono date. Click → thread page `/questions/[id]`: full question, answers sorted by verified-author-first, accepted-answer green check, ask-answer box (gated to AGENT/ADMIN roles or verified users).

---

# 4. Client App — Authentication

Auth is modal-first (Zustand `auth-modal` store + `AuthModalListener`), powered by Better Auth. Pages exist only for deep-linked flows.

## 4.1 Sign In / Sign Up Modal (`SignIn.tsx`)

- Centered modal, `max-w-md rounded-2xl`, `.topo-bg` header band.
- Header: logo mark + Fraunces "Welcome to the Archive" / subtitle "Sign in to save searches, list property, or verify documents."
- **Tabs**: [Sign In | Create Account] segmented control.
- **Sign In form**: Email input · Password input (eye toggle) · "Forgot password?" ghost link · [Sign In] primary full-width h-11 · divider "or continue with" · social buttons row (Google — `secondary` button with brand icon).
- **Create Account form**: Full name · Email · Phone (`+977` prefix locked, mono) · Password with strength meter (4-bar, tertiary→primary) · role intent radio cards: [I'm buying] [I'm selling] [I'm an agent] (sets initial `UserRole`) · terms checkbox linking `/terms` · [Create Account] primary.
- Footer microcopy: "We verify sellers and agents. Buyers stay free forever."
- Error state: `error-container` banner with icon above form; field-level errors inline.
- On success: modal → OTP step.

## 4.2 Email/Phone OTP Verification (`VerifyEmailOtp.tsx`)

- Same modal shell. Header: `mark_email_read` icon 48px in `secondary-container` circle.
- Copy: "Enter the 6-digit code sent to **user@email.com**" (mono address).
- 6-cell OTP input (auto-focus, paste support), 60s resend countdown (mono), [Verify] primary (disabled until 6 digits), "Wrong email? Go back" ghost.
- Success: checkmark animation → toast "Email verified" → modal closes into intended action (post-auth redirect preserved).

## 4.3 Password Reset

- Modal step: email input → [Send reset link] → confirmation state ("Check your inbox") → token page `/reset-password?token=…`: new password + confirm, strength meter, [Update password].

## 4.4 Auth-Gate Pattern

Any protected action (favorite, save search, list property, ask question, request walkthrough, WhatsApp reveal) when logged out:
1. Opens Sign In modal with context banner: "Sign in to save this listing" (icon + listing title).
2. After auth, the original action completes automatically (pending-action queue in store).

---

# 5. Client App — User Dashboard

Route group `(auth)` — layout: left sub-nav sidebar (220px) within content area, sticky; mobile becomes horizontal scroll tabs. Header strip: page title (Fraunces 28px) + contextual primary action.

Sidebar sections: **Overview** · **My Listings** · **Document Vault** · **Saved & Alerts** (Saved Searches, Favorites) · **Inquiries** · **Appointments** · **My Questions** · **Profile & Verification**.

## 5.1 Overview `/dashboard`

- **Greeting row**: "Namaste, {name}" Fraunces 28px + role badges + verification status chip (Unverified → CTA banner).
- **Verification banner** (if not L2): amber banner — "Complete number verification to list property" [Verify Number →] .
- **Stat cards row** (4): Active listings · Total views (30d) · Open inquiries · Saved-search matches (7d) — each mono value + delta chip.
- **Two-col below**:
  - *Left*: **Recent activity feed** — mixed timeline (inquiry received, document verified, price-drop on a favorite, appointment scheduled), icon dots by type, mono timestamps, relative "2h ago".
  - *Right*: **My listings snapshot** mini-table (thumb, code, status chip, views mono, [Manage]) + **Upcoming appointments** card list (date block mono, property code, officer name, status chip).

## 5.2 My Listings `/dashboard/listings`

- Header action: [+ New Listing] primary → creation wizard.
- Filter tabs: All / Draft / Under Verification / Live / Sold / Archived (counts in mono).
- **Table view**: Cover thumb (48px) · Code + title · Type chip · Status chip (color per §8.3) · Verification level (stamp mini) · Asking price mono · Views · Inquiries (badge count) · Updated (mono) · `...` menu (Edit / View public page / Mark sold / Archive / Duplicate).
- Selection checkboxes → bulk bar: Archive, Request re-verification.
- Empty state: blueprint-grid, "Your archive is empty", [List your first property].

### 5.2.1 Listing Creation Wizard `/dashboard/listings/new`

5-step progress header (numbered mono, step titles, completed = primary check):

**Step 1 — Basics**: title (char counter), property type select (6 cards with icons), description rich textarea, asking price (mono NPR input + auto price/aana preview chip).
**Step 2 — Location**: cascaded Province/District/Municipality/Ward selects, area name, address text, **pin-drop Leaflet map** (drag marker, reverse-geocoded address preview).
**Step 3 — Land & Specs**: unit-system toggle (Ropani-Aana-Paisa-Daam | Bigha-Katha-Dhur), numeric inputs with live `totalSqFt`/`totalSqMeters` conversion card; road type select, road width ft, facing compass picker, corner-plot toggle.
**Step 4 — Media & Documents**: image uploader (drag-sort grid, first = cover badge, alt-text fields, 20 max), optional video-walkthrough URL, cadastral map upload; **document attach** — pick from Document Vault *or* upload new (typed: Lalpurja/Tax Clearance/Naksa…) with `isPrivate` default-on toggle explained.
**Step 5 — Review & Submit**: full preview mirroring public detail page, checklist sidebar (✓ photos ≥5, ✓ Lalpurja attached, ⚠ field verification optional), [Save Draft] secondary + [Submit for Verification] primary → status `UNDER_VERIFICATION`, toast + redirect to listing manage view.

### 5.2.2 Listing Manage `/dashboard/listings/[id]`

- Header: code + title + status chip + [View public page] ghost.
- **Stats strip**: views chart (30d area chart, mono axis), inquiry count, favorites count, days live.
- Tabs: **Details** (edit form same as wizard steps, inline save) · **Documents** (per-listing doc table + upload, status chips, replace action) · **Inquiries** (scoped list) · **Appointments** (officer visits) · **Audit trail** (verification timeline from `VerificationAuditLog`).
- Actions bar: [Mark as Sold] (opens sold-record form: sold price, sold date → creates `PropertySaleRecord`) · [Archive] · [Boost: request field verification L3].

## 5.3 Document Vault `/dashboard/documents`

- Header: [+ Upload Document] primary.
- Explainer card: "Your vault documents can be reused across listings. Tax clearances expire annually — we'll remind you."
- **Grid of document cards**: type icon (`Lalpurja` → `article`, Citizenship → `badge`, Tax clearance → `receipt_long`, Naksa → `map`), file name, type chip, status chip, expiry row (amber countdown chip if <90 days: "Expires in 24 days" [Renew]), linked-listings count badge, `...` (Preview / Replace / Download / Delete).
- Preview: image/PDF lightbox.
- Grouping tabs: All / Verified / Pending / Expiring / Expired.

## 5.4 Saved Searches & Favorites

**Saved Searches** `/dashboard/saved-searches`:
- Card list: label ("Land under 5 Aana, Ward 6, Pokhara"), filter summary chips, **match count** mono, frequency toggle (Instant/Daily/Off segmented), [Run now] ghost → results page with filters applied, `...` (Rename / Duplicate / Delete).
- New matches since last visit: primary dot badge.

**Favorites** `/dashboard/favorites`:
- Property card grid (same as public cards) + per-card: `notifyOnPriceChange` toggle, price-drop chip if dropped since save, remove heart.
- Empty: "Save listings to track price drops."

## 5.5 Inquiries `/dashboard/inquiries`

- Tabs: **Received** (seller/agent view) / **Sent** (buyer view).
- Table: Type icon (WhatsApp / Video / General / EMI) · Person (name + `isVerifiedLead` badge) · Property (code chip) · Message excerpt · Status chip (OPEN amber / IN_NEGOTIATION primary / CLOSED variant) · mono date · [Reply ▾].
- Row click → thread drawer: message history (chat bubbles, own = `secondary-container`, theirs = surface border), quick actions: [WhatsApp deep-link] [Mark negotiating] [Close inquiry], internal note box.
- Filter bar: property select, status multi-select, date range.

## 5.6 Appointments `/dashboard/appointments`

- Calendar/list toggle.
- **List rows**: date block (mono day+month) · Property code + area · Type (Field verification / Registry officer visit) · Officer name · Status chip (REQUESTED amber → SCHEDULED primary → COMPLETED green / RESCHEDULE_NEEDED tertiary) · actions (Reschedule → date modal, Cancel → confirm dialog).
- Completed rows expand: outcome notes card.
- Empty: "Book a field verification to earn the Level 3 stamp."

## 5.7 My Questions `/dashboard/questions`

- My asked questions list (status: answered badge) + answers I've given (for agents) with upvote/accepted marks.
- [Ask new question] → modal: category select, area tag, body textarea.

## 5.8 Profile & Verification `/dashboard/profile`

1. **Identity card**: avatar upload, name, email (verified badge), phone (+977 mono, [Verify] if pending → OTP modal).
2. **Role & verification panel**: current roles chips; "Verification level" progress — Level 1 basic (email+phone) → Level 2 doc verified (citizenship) → Level 3 (for sellers/agents). For AGENCY roles: license number input + agency picker/create (name, PAN/VAT, seats).
3. **Details form**: permanent district/address, preferred language (English/नेपाली toggle), preferred contact method (Phone/WhatsApp/Viber radio).
4. **Citizenship verification** (sensitive): citizenship no. (masked input), issue date, front/back uploads → copy notes encryption & admin-only access; status chip from vault docs.
5. **Notifications preferences**: matrix of toggles — rows (Price drops, New matches, Document expiry, Messages, Appointments, Weekly digest) × columns (In-app, Email).
6. **Danger zone**: `border-error` card — Export my data [Download], Delete account […] with typed-confirm dialog.

---
