# Potential roadmap

> Purpose: show a clear path from a tiny MVP to a service that reliably helps many small nonprofits, while keeping scope tight and cost near zero.

---

## Guiding principles
- **Start where we already have demand.** One surface first (Wix *or* WordPress), not both.
- **Keep it one‑way (fanout) at first.** No bi‑directional sync until real demand appears.
- **Ship smallest value early.** ICS as universal source of truth.
- **Accessibility & safety first.** Alt text, plain language, dry‑run by default, easy pause.

---

## Three axes (choices we make)

1) **UX / SKU**
   Options over time: **Wix app** → **WP plugin** → **Cloudflare Pages PWA (hosted)** → **Workspace Add‑on** → **Mobile app**.

2) **Protocols core (source of truth)**
   **ICS** → **Google OAuth (Calendar API)** → **Workspace DWD (service account impersonation)** → *(maybe later)* multi‑way sync.

3) **Fanouts (destinations)**
   **Native site** (Wix *or* WP) → **Facebook Page posts** → **Instagram posts** → *(later)* others.

> Constraint: **Either Wix or WP, never both for the same org**. We will support only one CMS per org and we will start with only one CMS overall until demand is proven for the other.

---

## Where we are now (Aug 2025)
- **MVP slice identified**: ICS → Normalize → **Wix Events** (native).
- **Next likely step**: Facebook Page posts (Events API doesn't appear to be permitted).

---

## Branching strategy (pick one anchor, revisit later)

### Branch A — Wix‑first (recommended based on current pilots)
- **Anchor SKU**: Wix app (distributed, per‑site).
- **Secondary SKU**: Only if demand appears: WP plugin (reuse the same core).

### Branch B — WP‑first (if pilot interest shifts)
- **Anchor SKU**: WP plugin (per‑site; WP‑Cron).
- **Secondary SKU**: Wix app later if demand appears.

Decision gate: choose A or B after the first **2–4 pilot sign‑ups**.

---

## Phased plan (board view)

### Phase 0 — Private Alpha (now → 10 weeks)
- **Scope**: ICS → Normalize → **Native site** (Wix *or* WP).
- **UX**: settings page with **Preview**, **Apply**, **Pause**.
- **Success**: 2 pilot orgs can create/update/delete events for 30 days with <2% error rate.

### Phase 1 — Social Fanout (next 10–20 weeks)
- **Add**: **Facebook Page posts** (image + caption; no Events object).
- **Keep**: Alt text required; dry‑run by default; per‑org daily caps.
- **Success**: same pilots post to Facebook without duplicates; updates patch cleanly.

### Phase 2 — Instagram (only if pilots ask)
- **Add**: **Instagram posts** (image + caption).
- **Caveat**: handle media constraints and app review; only when it’s worth it.
- **Scope**: Posts only (no Reels/Stories) in this phase.

### Phase 3 — Second SKU (only if needed)
- **Add**: the other CMS (**WP plugin** if Wix‑first, or **Wix app** if WP‑first).
- **Goal**: Confirm the shared core cleanly powers both runners.
- **Constraint**: Support only one CMS per org; don’t mix Wix + WP.

### Phase 4 — Protocol fidelity upgrade (optional)
- **Add**: **Google OAuth (Calendar API)** for faster updates (keep **ICS fallback**).
- **Success**: measurably fresher updates with minimal extra support.
- **Fallback**: ICS remains supported at all times.

### Phase 5 — Protocol fidelity upgrade 2 (optional)
- **Workspace**: offer **Domain‑Wide Delegation** for orgs with admins.
- **Success**: Adopted by two Google Workspace orgs.
- **Fallback**: ICS remains supported at all times.

### Phase 6 — Hosted access (optional)
- **Add**: **Cloudflare Pages PWA** for non‑Wix/WP orgs; same wizard; passkeys + magic links.
- **Guardrails**: encryption at rest, per‑tenant isolation, Pause, quotas.

### Phase 7 — Nice‑to‑haves (later)
- Mobile app (push notifications, optional secrets manager), email digests, short links/QR, small analytics.

---

## Decision gates & “stop rules”
- **Gate A (after Phase 0):** If pilots struggle with install or trust, pause development and improve UX docs/copy before adding features.
- **Gate B (before Phase 3):** Don’t add the second SKU unless at least **5 orgs** explicitly ask for it.
- **Gate C (before Phase 6):** Only build the hosted PWA if **non‑Wix/WP demand ≥ 10 orgs** *and* support load requires central tooling.
- **Stop rule:** If we can’t keep error rate <2% or support costs spike, freeze features and focus on reliability.

---

## Risks & mitigations (executive)
- **Meta app review delays** → Keep Facebook in dev mode for pilots; communicate timelines; ship Wix/WP value first.
- **ICS latency surprises** → Set expectations in UI (“changes may take a while”); offer Calendar API later.
- **Scope creep** → Limit to one CMS at a time; cap daily posts; require “decision gates.”
- **Security posture** → Per‑org secrets only (Wix/WP). If/when hosted, encrypt tokens and keep scopes minimal.

---

## Success signals
- 2 pilots happy for 30 days (Wix or WP).
- Facebook posts working without duplicates.
- Inbound requests for the second SKU or Calendar API speed‑up.
- Support questions trending down after first week.
