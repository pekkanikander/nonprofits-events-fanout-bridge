# Architecture Spikes

This document tracks our architecture spikes and implementation findings for the NEFB Events Bridge.

## Overview

Architecture spikes are focused experiments to validate key technical assumptions before committing to the full implementation. Each spike addresses a specific integration or technical challenge.

## Spike 1: Google Calendar API Integration

**Status**: ✅ COMPLETE
**Date**: August 2025
**Duration**: ~2 hours

**Objective**
Verify reliable ingest from Google Calendar and normalization to our Event schema.

**Outcome**
- OAuth2 flow working (refresh tokens).
- Correct handling of timed vs all‑day events and time zones.
- Normalized data maps cleanly to core model.

**Notes**
- Keep **ICS** as MVP default; Calendar API retained for later fidelity upgrades.
- Details: [`GOOGLE-CALENDAR-LESSONS-LEARNED.md`](./GOOGLE-CALENDAR-LESSONS-LEARNED.md)

**Next**
None for MVP; proceed with ICS path.

## Spike 2: Wix Events API Integration (Phase 1)

**Status**: ✅ COMPLETE
**Date**: August 2025
**Duration**: ~3 hours

**Objective**
Probe direct REST access to Wix Events.

**Outcome**
- Confirmed REST calls require **site/app instance context**; raw API key is insufficient.
- Result: approach invalid for production.

**Action**
Superseded by **Spike 2B** (SDK + OAuth).

## Spike 2B: Wix Authentication Deep Dive

**Status**: ✅ COMPLETE
**Date**: August 2025
**Duration**: ~8 hours

**Objective**
Achieve authenticated Wix Events operations with proper context.

**Outcome**
- OAuth 2.0 via Wix SDK working.
- Instance ID captured via **App Instance Installed** webhook.
- **Create event** succeeded (multiple tests).

**Docs**
- [`WIX-EVENTS-API-LESSONS-LEARNED.md`](./WIX-EVENTS-API-LESSONS-LEARNED.md)
- [`WIX-EVENTS-API-INTEGRATION-GUIDE.md`](./WIX-EVENTS-API-INTEGRATION-GUIDE.md)

**Next**
Integrate into the Wix runner with idempotent create/update/delete.

## Spike 3: Facebook/Instagram API Integration

**Status**: ✅ COMPLETE
**Date**: August 2025
**Duration**: ~3–4 hours

**Objective**
Validate feasible social fanout paths.

**Outcome**
- **Facebook Events API for Pages deprecated** → choose **Page posts** (text/link/photo).
- **Instagram**: Graph API supports **Business** accounts linked to a Page; two‑step media container → publish.
- Minimal FB adapter prototype posts to a Page; IG flow validated.

**Limits**
App Review required; 60‑day page tokens; hosted image URL needed for IG.

**Next**
Harden FB adapter; plan **Spike 7 (Instagram posts)** after FB is solid.

## Spike 4: Wix ICS Ingest (Velo)

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~2 hours

**Objective**
Fetch and parse an ICS feed inside the Wix (Velo) backend, normalize to our Event schema, and handle timezone/"all‑day" edge cases.

**Planned Implementation**
- Backend `fetch()` of ICS URL with `If-Modified-Since`/`ETag` where possible; cache last fetch metadata.
- Parse via a lightweight ICS parser usable in Velo (evaluate options; fall back to minimal parser if needed).
- Normalize to core Event (start/end, timezone, location, description, image hint, URL).
- Guardrails: max horizon (e.g., next 60 days); basic retry on network errors.

**Exit Criteria**
Given a valid ICS URL, the runner lists normalized events for the next N days with correct local times and all‑day handling.

---

## Spike 5: Wix Settings UI — Stepper, Preview & Pause

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~2–3 hours

**Objective**
Create a simple admin UI in the Wix app: paste ICS, optional social connects (stub), **Preview** (dry‑run), **Apply** (no‑op for now), and a global **Pause** toggle.

**Planned Implementation**
- Settings page stepper: 1) ICS URL → 2) Destinations (Wix required; FB/IG placeholders) → 3) Preview → 4) Go live.
- Preview uses Spike 4 output + diff to show **Create / Update / Skip / Delete**.
- Implement **Pause** (stores a flag; preview still allowed).
- Audit list (last run summary) persisted in a small collection.

**Exit Criteria**
A non‑technical user can add an ICS URL, see a clear Preview list, toggle **Pause**, and click **Go live** (which logs the intent only).

---

## Spike 6: OAuth & Token Storage in Wix (Facebook)

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~2–3 hours

**Objective**
Acquire a Facebook **Page access token** from within the Wix app, decide where/how to store it securely per‑site, and implement a clean **Reconnect** flow.

**Planned Implementation**
- OAuth via Facebook Login → Page selection → Page access token.
- Storage evaluation: Wix Secrets (static) vs Collection (encrypted/permissioned) for **dynamic tokens**; pick approach and implement.
- Implement token refresh/reconnect and a visible status pill in Settings.

**Exit Criteria**
From the Wix settings page, an admin connects a FB Page; the token persists across publishes; **Reconnect** works; token is retrievable by backend code only.

---

## Spike 7: Facebook Page Posts — Create/Update (Idempotent)

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~2–3 hours

**Objective**
Post **one Page update per event** and **update it** on change, avoiding duplicates.

**Planned Implementation**
- Render a Page post (text + optional image link) from a normalized event.
- Maintain `{event_id → post_id, last_hash}` mapping; update the post when the rendered payload hash changes.
- Graceful failure that **does not block Wix**; surface clear status/messages in the audit list.

**Exit Criteria**
A pilot Page shows a post for an event; editing the event changes the post (no duplicates). Deleting/canceling the event yields a sensible outcome (update text or comment).

---

## Spike 8: State Management & Idempotency

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~2 hours

### Objective
Validate our approach to state management and idempotent operations.

### Planned Implementation
- **Storage**: Per-site collection (Wix Data) or KV; JSON file only for local dev
- **Idempotency**: Content hash-based change detection
- **State**: Per-tenant event mappings
- **Operations**: Create, update, delete tracking

### Key Questions to Answer
1. What's the best storage approach for MVP?
2. How do we detect changes efficiently?
3. How do we handle failed operations?
4. What's the performance impact of our approach?

---

## Spike 9: Multi-tenant Control Plane & State (Backbone)

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~1–2 days

### Objective
Stand up a minimal control plane and state layer so one org’s events can fan out to Wix **idempotently**. This becomes the backbone for CLI, PWA, and future workers.

### Proposed Implementation
- **Data shapes**: `Org`, `Source`, `Connection`, `Event`, `Delivery` (only fields needed for MVP).
- **State storage**: File-based JSON or KV (MVP). Later upgradeable to D1/SQLite or Postgres.
- **Idempotency**: Content-hash per channel based on the **rendered payload** (not raw event).
- **APIs/Functions**:
  - `ingest` (source → normalized events for next N days)
  - `preview(tenant)` (compute per-channel actions with hashes)
  - `apply(tenant)` (create/update/delete on Wix; record `{platform_id, last_hash, timestamps}`)
- **Controls**: per-tenant **pause** toggle; per-channel toggles; retry with exponential backoff; dead-letter log.
- **Security**: No secrets in repo; per-tenant secrets via env or secrets store.

### Success Criteria
- Two tenants with different calendars can **preview** and **apply** to **Wix** without duplicates.
- Updates change existing posts; cancellations delete/close appropriately.
- Delivery records visible (basic audit: created/updated/skipped/errors).

### Code Structure (initial)
```
src/
  core/
    model.ts         # Event + Delivery types, validation
    state.ts         # get/set delivery records; hash helpers
  ingestion/
    gcal.ts          # source → normalized events
  adapters/
    wix.ts           # create/update/delete; pure functions
  api/
    preview.ts
    apply.ts
```

### Notes & Risks
- **Hash drift**: stabilize by hashing the rendered payload after normalization.
- **Partial failures**: isolate per-event/per-channel; retries with backoff.
- **Scaling**: design for later move to queue + DB without changing interfaces.

---

## Spike 10: PWA Shell (Auth + Connect Wizard, Minimal)

**Status**: 🔄 PLANNED
**Date**: TBD
**Duration**: ~1–2 days

### Objective
Validate the 5-minute setup UX. A mobile-first web shell that signs in, connects source/destination, shows a preview, and can trigger Apply.

### Proposed Implementation
- **Auth**: Passkey (WebAuthn) sign-in with **email magic link** fallback.
- **Wizard steps**:
  1) Identify org (name, locale, time zone)
  2) Connect **Google Calendar** (paste ICS)
  3) Connect **Wix** (OAuth; token lands server-side)
  4) **Preview** next 3 events (calls control-plane `preview`)
  5) **Go live** toggle (calls control-plane `apply`)
- **Health card stub**: “Wix ✓ · Facebook ⚠ Reconnect · Instagram — Not connected”.
- **Accessibility**: mobile-first layout; plain language; required alt text in forms.
- **Secrets**: device manages consent; **server** stores tokens (encrypted) for scheduled jobs.

### Success Criteria
- A new user completes the wizard on phone or desktop and pushes one event to Wix.
- Passkeys work on iOS/Android/desktop; magic link works as fallback.
- Dry-run preview clearly shows intended actions before Apply.

### Screens (text wireframe)
- **Sign in** (Passkey or email link)
- **Connect** (Org → Source → Wix)
- **Preview** (list of changes: create/update/delete)
- **Go live** (toggle + per-channel switches)
- **Health** (Wix/FB/IG status; Reconnect/Pause buttons)

### Notes
- FB/IG are optional and can be added after this spike.
- Reuse Spike 5 API endpoints to avoid duplicate logic.

---

## General Spike Guidelines

### Before Starting
1. **Clear Objective**: What specific question are we answering?
2. **Success Criteria**: How do we know the spike succeeded?
3. **Time Box**: Set a maximum duration (usually 2-4 hours)
4. **Scope**: Keep it focused and minimal

### During Implementation
1. **Document Findings**: Capture what works and what doesn't
2. **Error Handling**: Test edge cases and failures
3. **Performance**: Note any performance implications
4. **Dependencies**: Track external dependencies and requirements

### After Completion
1. **Update Documentation**: Record findings and lessons learned
2. **Code Review**: Clean up and document the spike code
3. **Next Steps**: Plan integration into main application
4. **Knowledge Transfer**: Share findings with the team

### Spike Template
```markdown
## Spike X: [Name]

**Status**: 🔄 PLANNED / 🔄 IN PROGRESS / ✅ COMPLETE / ❌ FAILED
**Date**: YYYY-MM-DD
**Duration**: X hours

### Objective
[What specific question are we trying to answer?]

### Implementation
[Technical approach and tools used]

### Key Findings
[What worked, what didn't, surprises, challenges]

### Code Structure
[Key files and their purpose]

### Test Results
[Actual output and results]

### Configuration
[Required setup and environment variables]

### Lessons Learned
[Key insights and recommendations]

### Next Steps
[What to do with this knowledge]
```
