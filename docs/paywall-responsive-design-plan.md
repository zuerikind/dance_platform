# Paywall: Apple-style responsive optimization plan

Optimize the paywall for **all mobile devices and computers**, make it look **professional and Apple-like**, use the **same color logic** as the rest of the app, and **ensure CTA buttons work and forward to Stripe**.

---

## 1. Current state

- **Where**: `src/legacy.js` → `renderPaywallCard()` (and built `app.js`). No paywall-specific CSS in `style.css`.
- **What**: Three plan cards (Básico, Intermedio, Avanzado); “Most popular” on Intermedio; billing status in header. Layout is inline-styled grid; typography and spacing are fixed and don’t scale.
- **Stripe flow**: Each card has a button that calls `window.startCheckout(planKey)` with `'basico' | 'intermedio' | 'avanzado'`. That function:
  - Gets auth session
  - Calls Supabase Edge Function `stripe-create-checkout` with `{ academyId, planKey, currency }`
  - Redirects to `data.url` (Stripe Checkout). No change to this flow in the plan—only markup/CSS.

---

## 2. Goals

| Goal | Detail |
|------|--------|
| **All devices** | Phones (320px–430px), large phones / small tablets (430px–768px), tablets (768px–1024px), desktops (1024px+). No horizontal scroll; readable and tappable everywhere. |
| **Apple-like** | System font stack, generous whitespace, rounded corners (radius tokens), subtle shadows, clear hierarchy, 44pt min touch targets, smooth transitions. |
| **Same color logic** | Use only existing design tokens (see below). Light/dark via `:root` and `body.dark-mode`; no new hardcoded colors except the featured gradient. |
| **Buttons → Stripe** | Keep `onclick="window.startCheckout('…')"` and `id="paywall-btn-…"`; after refactor, verify each plan key still triggers redirect to Stripe. |

---

## 3. Color and design tokens (use only these)

**From `style.css` — use the same logic:**

- **Backgrounds**: `--bg-body`, `--bg-card`, `--system-gray6`
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`
- **Borders**: `--border`, `--border-color`
- **Accent**: `--system-blue` (#007AFF)
- **Radii**: `--radius-s` (10px), `--radius-m` (12px), `--radius-l` (18px), `--radius-xl` (24px)
- **Font**: `--system-font` (-apple-system, BlinkMacSystemFont, …) or `--font-main` (Outfit + system fallback)
- **Motion**: `--transition` (cubic-bezier)
- **Safe area**: `--safe-top`, `--safe-bottom` for notches/home indicators

**Featured card (Intermedio):** Keep one exception—gradient + white text so it reads in both themes, e.g. `linear-gradient(155deg, #0071e3 0%, #5e5ce6 100%)` with white text and rgba white for secondary/buttons. Define in CSS under `.paywall-card--featured` so it’s consistent.

**Dark mode:** All non-featured paywall UI must use the variables above so `body.dark-mode` overrides apply automatically. Do not hardcode light grays or black text.

---

## 4. Apple design language (applied to paywall)

- **Typography**: Clear hierarchy (one strong title, one subtitle, then price, then short description, then feature list). Use system font; weight 600–800 for titles/prices, 400–500 for body. Slightly tight letter-spacing on large type (-0.5px to -1px).
- **Spacing**: Generous padding; consistent gaps (e.g. 8px, 12px, 16px, 24px). Avoid crowding.
- **Corners**: Use `--radius-m` to `--radius-xl` for cards and buttons (e.g. card 18–22px, button 12–14px).
- **Shadows**: Subtle on default (e.g. `0 2px 12px rgba(0,0,0,0.04)` light); slightly stronger on hover/focus. Featured card can use a soft blue tint.
- **Touch**: Buttons and tappable areas min-height 44px on mobile; adequate hit area (padding) so taps never feel cramped.
- **Motion**: Short, smooth transitions (0.2–0.25s) for hover/focus (shadow, background) using `--transition`.
- **Focus**: Visible focus ring for keyboard/screen reader (e.g. outline or box-shadow using `--system-blue`).

---

## 5. Responsive behavior (mobile-first)

- **Base (default, &lt; 768px)**  
  - Single column; full width with horizontal padding (e.g. 1rem–1.25rem); safe-area padding bottom.  
  - Card: reduced padding (e.g. 1.25rem 1rem), radius ~16–18px; price ~28–32px; plan name ~20–22px; features 13–14px.  
  - CTA: min-height 44px, full width, clear tap state.  
  - “Most popular” badge: smaller font (e.g. 10–11px), no overflow.

- **480px–767px**  
  - Still single column (or 2 columns if layout allows without squashing). Slightly more padding; optional bump in font sizes.

- **768px–1023px**  
  - Two or three columns; max-width on grid (e.g. 920px); gap 1rem–1.25rem. Card padding and typography between mobile and desktop.

- **1024px+**  
  - Three columns; max-width ~920px; desktop spacing; price 42px, name 26px; card padding 2rem 1.75rem; CTA 50px height.

---

## 6. Implementation plan

### Step A: Add paywall CSS in `style.css`

- Add a single block: `/* --- Paywall (Apple-style, responsive) --- */`.
- **Classes** (all using tokens above):
  - `.paywall-page` — outer wrapper: min-height, flex column, center, padding (with safe-area), background `--bg-body`.
  - `.paywall-header` — logo, title, subtitle, optional billing pill; centered; uses `--text-primary`, `--text-secondary`.
  - `.paywall-grid` — CSS Grid; 1 column by default; at 768px+ use 2–3 columns; gap and max-width as above.
  - `.paywall-card` — card shell: `--bg-card`, `--border`, border-radius, padding, box-shadow, transition. Use `--text-primary` / `--text-secondary` for text.
  - `.paywall-card--featured` — overrides: gradient background, white text, white/translucent button; shadow with blue tint.
  - `.paywall-badge` — “Most popular”: small, uppercase, centered above card; blue or white depending on card.
  - Card internals: `.paywall-card__tier`, `.paywall-card__name`, `.paywall-card__price`, `.paywall-card__period`, `.paywall-card__desc`, `.paywall-card__features`, `.paywall-card__cta`.
  - `.paywall-card__cta` — button: full width, min-height 44px (mobile) / 50px (desktop), border-radius, `--system-blue` or inverted for contrast; hover/active and focus-visible states.
- **Breakpoints**: Define base (mobile-first), then `@media (min-width: 480px)`, `768px`, `1024px` for grid and typography scale.
- **Dark mode**: Rely on existing `body.dark-mode` variables; no extra overrides except if the featured gradient needs a small tweak for contrast.

### Step B: Refactor `renderPaywallCard()` in `src/legacy.js`

- **Markup**: Output the new structure with the classes above (e.g. `paywall-page`, `paywall-header`, `paywall-grid`, `paywall-card`, `paywall-card--featured`, `paywall-card__*`, `paywall-badge`).
- **Buttons**: Keep exact behavior:
  - `type="button"`
  - `onclick="window.startCheckout('basico')"` (and `'intermedio'`, `'avanzado'`).
  - `id="paywall-btn-basico"` (and `-intermedio`, `-avanzado`) for possible messaging/analytics.
  - Class: e.g. `paywall-card__cta`.
- **Dynamic values**: Use inline style only where necessary (e.g. billing status dot color). Optionally use a data attribute (e.g. `data-status`) and a small CSS rule for status color.
- **No change** to: plan keys, translation keys, or the content of `window.startCheckout` (still calls `stripe-create-checkout` and redirects to `data.url`).

### Step C: Ensure buttons forward to Stripe (verification)

- **Code**: Confirm each CTA still has `onclick="window.startCheckout('basico'|'intermedio'|'avanzado')"` and that `window.startCheckout` is unchanged (invokes `stripe-create-checkout` with `planKey`, then `window.location.href = data.url`).
- **Manual test**: On a dev/staging environment with Stripe test mode, open paywall on mobile and desktop, tap/click each of the three “Get started” buttons and confirm:
  - “Redirecting to checkout…” appears briefly.
  - Browser redirects to Stripe Checkout with the correct plan and price.
- **Regression**: If the app is built from `src/legacy.js`, run the build and smoke-test the paywall again to ensure class names and IDs are preserved.

---

## 7. File checklist

| File | Action |
|------|--------|
| `style.css` | Add paywall block with classes above; mobile-first + breakpoints 480 / 768 / 1024; use only design tokens; Apple-like spacing, radii, shadows, 44px min touch target. |
| `src/legacy.js` | Refactor `renderPaywallCard()` to class-based markup; keep `onclick` and `id` on each CTA; remove redundant inline styles; keep Stripe flow unchanged. |

---

## 8. Summary

- **Optimize for all devices**: Single responsive layout with breakpoints for phones, tablets, and desktops; no horizontal scroll; readable and tappable everywhere.
- **Apple-like**: System fonts, token-based colors/radii/shadows, clear hierarchy, 44pt touch targets, smooth transitions.
- **Same color logic**: Only `--bg-*`, `--text-*`, `--border`, `--system-blue`, `--radius-*`, etc.; featured card keeps gradient + white text in CSS.
- **Buttons → Stripe**: Keep `window.startCheckout(planKey)` and button `id`s; verify all three plans redirect to Stripe Checkout after refactor.
