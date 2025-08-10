# Long‑term UX vision (high‑level summary)

## Context
Tiny nonprofits (volunteer‑run, minimal IT, very limited time/budget) need a painless way to publish the same event everywhere. NEFB is a **one‑way fanout** bridge from one source of truth (start with Google Calendar) to Wix (native events) and optionally Facebook/Instagram. The long‑term goal is to serve hundreds of thousands of nonprofits at a **near‑zero price**, funded only to cover infra.

## Scenario (persona & scale)
- **User:** Tech‑savvy but non‑technical volunteer/staff steward; 1–10 events/month; a few hours of IT per year.
- **Access:** Can authorize Wix; may also manage FB Page and IG; accounts often shared historically.
- **Scale target:** Hundreds → hundreds of thousands of orgs; cap ~10 events/mo/org.

## UX principles
- **5‑minute setup, zero ongoing effort.** If it needs a manual, it’s too hard.
- **Plain language.** No jargon; show clear next steps.
- **Trust & safety.** Least‑privilege tokens, easy revoke/pause; no passwords stored.
- **Accessibility by default.** Clear text + required alt text.
- **Self‑healing & transparency.** User sees human‑readable status and how to fix issues.

## Onboarding (WIX/WP native first, then PWA)
First WIX app & WP plugin for distributed WIX / WP deployment
THen mobile **web app (PWA)** with passkeys; email magic‑link fallback.
1) **Identify org** (name, locale/time zone).
2) **Choose source**: Google Calendar (recommended) or paste other ICS.
3) **Connect destinations**: Native (WIX or WP); Facebook & Instagram (optional).
4) **Preview** upcoming events exactly as they’ll appear.
5) **Go live** with a single toggle; default per‑channel caps.

## Authentication & access
- **Native secret store**: Secrets stored locally in the WIX app / WP Plugin instance
  - Simplest case of ICS polling with only native fanout requires no secrets
- **Passkeys first**, **magic link** fallback; optional hardware keys.
- **Invites & roles**: Owner + Steward(s); avoid shared accounts.
- **Recovery**: second device enrollment, backup codes, and break‑glass org verification (DNS/Wix meta‑tag).

## Operations & troubleshooting (for users)
- **Health card**: “Wix ✓ · Facebook ⚠ Reconnect · Instagram — Not connected”; buttons for **Reconnect**, **Pause**, **Dry‑run**, **Force sync**.
- **Readable errors** with one‑click fixes; gentle email reminders for expiring tokens.
- **Audit timeline**: “2 posts to Wix; 1 to Facebook; 0 errors (Aug 24).”

## Architecture notes (UX‑relevant)
- Initially **WIX/WP native single-tenant control**
- Later also **Hosted, multi‑tenant control plane** (serverless functions + queue + KV/DB).
- **Per‑event/per‑channel state** with idempotent create/update/delete using content hashes.
- **Image handling**: hosted media + simple, brandable poster generator; mandatory alt text.

## Mobile app (later)
A small Flutter wrapper adds push notifications and store presence. The device **authorizes**; the **server** stores tokens (KMS‑encrypted) and runs jobs. Not required for MVP.

## Corner cases & recovery
- **Switch iOS ↔ Android**: enroll a second passkey before switching or use a hardware key.
- **Lost phone**: sign in on desktop via passkey/magic link → remove lost device credential; tokens on server keep working.
- **No smartphone**: desktop PWA works fully.

## Community & comms
- GitHub Discussions for help; pinned “Common fixes”.
- Minimal email: only important health notices and annual token renewals.

## Success metrics (experience‑level)
- Time‑to‑first‑post (goal: <10 minutes from signup).
- % orgs with Wix connected; % with socials connected later.
- Error rate and median time‑to‑resolve (self‑service).
- Token expiry reconnection rate (within 7 days).
- Pilot NPS / “Would you recommend?” score.

## Next UX deliverables
- Wireframes: **Connect wizard**, **Health card**, **Recovery flow**.
- Copy deck: human‑readable statuses and error messages.
- Accessibility checklist for captions/images.
