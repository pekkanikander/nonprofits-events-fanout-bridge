# Nonprofit Events Fanout Bridge (nefb)

A small, OSS bridge that syncs events from a single source of truth to multiple surfaces
(Wix Events, Facebook Pages/Instagram posts, WordPress later),
with zero/near-zero ongoing running cost.

## Goals & Non-Goals

### Goals
- One source of truth for each org (initially Google Calendar).
- Fan-out to:
  - Wix Events (preferred native objects),
  - Facebook Page (Page Event where API allows; otherwise formatted Page post),
  - Instagram (image + caption post via Business account),
  - WordPress (Phase 2+).
- Multi-tenant: one instance serves many small nonprofits.
- Zero/near-zero infra cost for MVP; scalable path (Kubernetes-ready for later larger deployments).
- Accessibility & SEO first-class: alt text required, JSON-LD/Schema.org Event for web surfaces where applicable.
- Worldwide ready: robust timezones, i18n architecture; Western languages at launch.

### Non-Goals (MVP)
- Attendee registration/RSVP management (defer; link out to existing registrars).
- Payment/commerce.
- Full support for non-Gregorian calendars / RTL layout (design for, not implement in MVP).

## Personas & Use Cases

- **Volunteer coordinator**: Adds/edits an event once (Google Calendar). Expectation: posts appear on site + socials within minutes.
- **Communications lead**: Wants consistent branding, alt text, links, and tracking tags; minimal manual work.
- **Admin**: Needs audit logs, dry-run, error notifications, and per-tenant configs.

## 2) High-Level Architecture

```
Google Calendar (per tenant)
        |
        v
  Ingestor -> Normalizer (Event Model) -> Deduper/Idempotency -> Dispatcher
                                         |                  |
                                         |                  +-- Adapter: Wix Events (create/update/delete)
                                         |                  +-- Adapter: Facebook Page (Event or fallback post)
                                         |                  +-- Adapter: Instagram (image + caption)
                                         |                  +-- (Phase 2) WordPress (CPT/REST)
                                         |
                                         +-- State Store (per-tenant mapping of canonical event_id <-> platform ids + hashes)
```

**Scheduler options** (pick 1 for MVP; keep others documented):
- GitHub Actions cron (5-30 min) -> runs sync job.
- Cloudflare Workers/Pages Functions with Cron Triggers.
- Tiny VPS (Hetzner) cron + container.

**Runtime**: TypeScript/Node.js.
**Packaging**: single repo; CLI (sync, dry-run), optional HTTP endpoint.

---

## Multi-Tenant Design
- `tenants.yaml`: array of tenants with:
  - `tenant_id`, `org_name`, `default_locale`, `time_zone`.
  - Sources: `google_calendar_id` (MVP), optional `repo_yaml_url` (future).
  - Targets: toggles + credentials refs (`wix_site_id`, `fb_page_id`, `ig_business_id`, `wp_site_url`, etc.).
- Secrets: stored per-tenant in the platform's secret store (GH Actions secrets / Cloudflare KV / env vars on VPS).
- State: KV/D1/SQLite table keyed by `{tenant_id, event_id, adapter}` storing platform ids, content hashes, timestamps.

---

## Data Model (Normalized Event)

```json
{
  "event_id": "stable-hash(title|start|org)",
  "slug": "optional-human-slug",
  "title": {"en": "...", "fi": "..."},
  "description": {"en": "..."},
  "start": "2025-08-23T18:00:00+03:00",
  "end":   "2025-08-23T20:00:00+03:00",
  "allday": false,
  "time_zone": "Europe/Helsinki",
  "status": "confirmed|cancelled|tentative",
  "location": {
    "name": {"en": "Community Hall"},
    "address": "Street, City, Country",
    "geo": {"lat": 60.1699, "lng": 24.9384}
  },
  "online_url": "https://...",    // optional
  "registration_url": "https://...", // optional
  "price": {"currency": "EUR", "amount": 0},
  "organizer": {"name": "Org A", "email": "info@..."},
  "cover_image": {
    "src": "https://.../image.jpg",
    "alt": {"en": "Alt text required"}
  },
  "tags": ["free", "family", "music"],
  "accessibility": ["wheelchair", "hearing_loop"],
  "updated_at": "..."
}
```

**Notes**
- i18n: store localized strings as maps; MVP may use only `default_locale`.
- Event ID: deterministic hash of `tenant_id` + canonicalized title + start + tz. Remains stable across runs.

---

## Ingestion: Google Calendar (MVP)
- Pull ICS from each tenant's calendar (service account or public ICS URL).
- Parse into normalized events.
- Map GCal fields -> our model; use `extendedProperties` if needed later.
- Respect cancellations/updates (UID based) and timezones.

**Future**: alternate sources (YAML/JSON repo, Airtable, Notion, etc.). Keep the Normalizer interface stable.

---

## Adapters (Targets)

### 6.1 Wix Events (priority)
- Create/Update/Delete native Wix Events for visibility on Wix sites.
- Use Wix's server-side API (Velo) and/or official Events API endpoints where available.
- Mapping: title, description, start/end, location, online_url, price, cover image.
- Idempotency: store Wix eventId per `{tenant,event_id}`; update if hash differs; delete if canonical removed/cancelled.
- Assets: host images either on Wix Media Library or tenant's CDN; maintain stable URLs.

### 6.2 Facebook Page
- **Preferred**: create a Page Event. If API or permissions block, fallback to a formatted Page post:
  - Title, date/time, short description.
  - Short URL to web event page or Add-to-Calendar link.
  - Cover image.
- Idempotency: keep post_id or event_id; update caption/image on changes; delete/close when cancelled.

### 6.3 Instagram (Business)
- Publish image (auto-generated poster or supplied cover) with caption template.
- Link strategy: caption contains non-clickable URL; optionally rotate bio link to most upcoming event (optional feature flag).
- Accessibility: set alt text if API supports; otherwise encode key info in image + caption.

### 6.4 WordPress (Phase 2)
- If site uses an Events plugin (CPT), write via WP REST to that CPT.
- Else create a standard Post/Page with embedded Event JSON-LD and a clean permalink.

---

## Templates

### 7.1 Caption/Body Template Tokens
- `{{title}}`, `{{date_long}}`, `{{time_range_local}}`, `{{location_name}}`, `{{registration_url}}`, `{{price_human}}`, `{{hashtags}}`, `{{org_name}}`, `{{short_url}}`.
- Per-tenant template overrides; per-platform defaults.

### 7.2 Auto-Poster (PNG) Generator
- Simple, brandable layout: title, date, time, venue, QR to reg URL.
- Fallback to supplied `cover_image` if present.

### 7.3 JSON-LD (Schema.org Event) Snippet
- Generated for WordPress/custom web pages.
- Fields: `@context`, `@type`: Event, `name`, `startDate`, `endDate`, `eventStatus`, `eventAttendanceMode`, `location` (Place/VirtualLocation), `image`, `description`, `organizer`, `offers` (price/currency), `performer` (optional), `eventSchedule` (optional).

---

## Scheduling & Deployment Options

### Option A - GitHub Actions (MVP)
- `on: schedule: cron: "*/15 * * * *"` (UTC), plus manual `workflow_dispatch`.
- **Pros**: zero cost, repo-native, easy secrets.
- **Cons**: timing jitter; no inbound webhooks; dormant repos can pause schedules.

### Option B - Cloudflare Workers/Pages
- Cron Triggers + KV/D1 for state; optional HTTP endpoint.
- **Pros**: no servers, global edge, tiny latency, logs.
- **Cons**: unfamiliar stack for some volunteers; quotas to respect.

### Option C - Tiny VPS (Hetzner)
- Dockerized service + system cron.
- **Pros**: full control; receive webhooks; easy file storage.
- **Cons**: €4-€6/mo; patching/hardening burden.

### Kubernetes (later)
- Containerize service; horizontal queue workers; externalized DB (Postgres) and object storage.
- Only when traffic warrants.

---

## Security, Privacy, Compliance
- **Least privilege**: request only required scopes.
- **Secret hygiene**: rotate yearly; per-tenant isolation; never commit secrets.
- **No PII**: only public event info; no attendee data in MVP.
- **Audit log**: per run, per tenant, per adapter (created/updated/skipped/errors).
- **Backoff & rate limits**: exponential backoff; respect platform guidelines.
- **Content safety**: alt text required; avoid text-only flyers; WCAG-aware color contrast in auto-posters.

---

## Timezones & i18n
- Store ISO-8601 + TZ; render per platform locale.
- Formatting layer uses Intl APIs; per-tenant default locale.
- Strings externalized; RTL-safe poster layout primitives.

---

## Observability
- Structured logs (JSON) with `tenant_id`, `event_id`, `adapter`, `action`, `latency_ms`.
- Metrics (later): counts of create/update/delete, error rates, queue latency.
- Optional Sentry hook for exceptions.

---

## Testing Strategy
- Pure functions for mapping/templating: snapshot (golden) tests.
- Integration tests behind env flags hitting sandboxes/dev assets.
- Dry-run mode: print intended mutations without side effects.
- Canary tenant for staging before enabling real tenants.

---

## Repo Layout (TypeScript/Node)

```
/ (repo root)
  +-- src/
  |   +-- adapters/
  |   |   +-- wix.ts
  |   |   +-- facebook.ts
  |   |   +-- instagram.ts
  |   |   +-- wordpress.ts
  |   +-- ingestion/
  |   |   +-- gcal.ts
  |   +-- core/
  |   |   +-- model.ts        // Event model, validation (zod)
  |   |   +-- normalize.ts
  |   |   +-- dedupe.ts
  |   |   +-- state.ts        // KV/D1/SQLite abstraction
  |   |   +-- templates.ts
  |   +-- cli.ts
  |   +-- server.ts (optional http)
  +-- config/
  |   +-- tenants.example.yaml
  |   +-- templates/
  +-- scripts/
  +-- .github/workflows/sync.yml
  +-- docs/
  |   +-- ADRs.md
  |   +-- SPIKES.md          # Architecture spikes and implementation findings
  +-- package.json
  +-- LICENSE
  +-- README.md
```

---

## MVP Scope (2-4 weeks, part-time)
1. Normalizer from Google Calendar ICS -> Event model.
2. State: file-backed json (MVP) or KV; idempotency via hashes.
3. Wix adapter: create/update basic events; map required fields; handle cancellations.
4. FB/IG adapters**:
   - FB: Event create if permitted; else Page post fallback.
   - IG: image + caption post (Business account), with templating.
5. CLI + GH Actions runner; dry-run mode; audit logs.
6. Alt text required; JSON-LD generator (for later WP).

---

## Roadmap (v0.2 -> v1)
- **v0.2**: Short-URL/UTM tagging; QR in posters; better error notifications.
- **v0.3**: WordPress CPT/REST; embed JSON-LD; themeable HTML summary pages.
- **v0.4**: Multi-source (YAML repo); Web UI for preview/overrides.
- **v0.5**: Cloudflare Workers deployment; KV/D1 state; cron triggers.
- **v1.0**: Multi-tenant admin panel; per-tenant rate limiters; basic metrics.

---

## Open Questions / Implementation Notes
- **Wix**: final API surface for programmatic Event creation/update and required auth flow; media upload strategy.
- **Meta**: exact scopes and app review needs for FB Events creation & IG content publishing; behavior of alt text.
- **Branding**: per-tenant poster themes and caption templates; default fonts.
- **Link strategy**: whether to auto-rotate IG bio link; whether to use a shared short-link domain.
- **Hosting**: start with GH Actions; consider Cloudflare Workers as soon as state exceeds a simple JSON file.

---

## Appendix

### 18.1 Deterministic Event ID

```
event_id = base32(sha256(normalize(tenant_id|title|start|tz)))
```

### 18.2 Sample Caption Template (Instagram)

```
{{title}}
{{date_long}} • {{time_range_local}}
{{location_name}}

Details & RSVP: {{short_url}}
#{{org_name}} {{hashtags}}
```

### 18.3 Sample JSON-LD (Event)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Community Choir Night",
  "startDate": "2025-09-05T18:00:00+03:00",
  "endDate": "2025-09-05T20:00:00+03:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Community Hall",
    "address": "Street, City, Country"
  },
  "image": ["https://.../cover.jpg"],
  "description": "An open, all-ages community singing evening.",
  "organizer": {"@type": "Organization", "name": "Org A"},
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}
}
```
