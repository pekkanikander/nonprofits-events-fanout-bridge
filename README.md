# Nonprofit Events Fanout Bridge (nefb)

**One‑way fanout of events from a single source of truth to multiple channels — built for tiny nonprofits**

**Status:** _Design phase (pre‑alpha)_. This repo is not usable yet.
We’re drafting, prototyping, and recruiting pilot orgs.
If you’re here from GitHub search: **please don’t depend on this yet** — but do ⭐ the repo and say hi!

## Who this is for

- **Volunteer‑run nonprofits** that host a handful of free/low‑cost events per month
- **Small comms teams** who want to post once and be done
- **Tech‑friendly non‑profits** comfortable with GitHub or willing to work with a helper

If you’re on Wix today and copy/paste the same event into Facebook and Instagram, this is for you.

## Why this exists (in one minute)

- **Time back to humans:** Enter an event once. The bridge does the repetitive work.
- **Ethical + sustainable:** Free, open‑source, no subscriptions or lock‑in.
- **Accessible by default:** Clear text details and image alt text so everyone can read it.
- **Low running cost:** Designed to run on free/low‑cost setups.

Commercial tools exist, but monthly fees add up quickly for tiny budgets. This project aims to be a commons.

----

## What this project will do (soon)

Enter your event **once** and the bridge will publish it to:

- **Wix** — add or update your event on your Wix site.
- **Facebook** — create a Facebook event (or a regular Page post if events aren’t available).
- **Instagram** — post an image and caption about the event.
- **WordPress (later)** — add an event page/post.

Key principles:
- **Single source of truth** (starting with **Google Calendar**). No double entry.
- **One‑way fanout**. Edit your original event and we’ll push updates out.
- **Built for many small orgs**. One installation can serve multiple nonprofits.
- **Accessibility matters**. Alt text and readable text are required.

## What it will **not** do (at first)

- Ticketing or payments
- Attendee lists/RSVP management
- Two‑way sync (this is **fanout**, not a synchronizer)
- A full admin website (early versions are simple and guided)

We’re keeping the scope narrow so it’s reliable, cheap, and easy to adopt.

---

## Project status & timeline

- **Now**: Designing and testing with a few pilot sites.
- **Target**: First usable MVP in **Fall 2025** (depends on volunteer time and platform approvals).
- **Pilots wanted**: 2–4 small nonprofits on Wix with Facebook Pages (Instagram welcome but not required).

If that’s you, open a discussion in this repo to introduce your org and needs.

---

## How it will work (plain English)

1. You add your event in **Google Calendar** (the “one place” to keep it).
2. The bridge notices new or changed events and **posts them for you** on your channels.
3. If you update or cancel the event, the posts are **updated where possible**.
4. It runs **automatically** on a schedule so you don’t have to remember.

More technical details live in `DESIGN.md` (WIP).

---

## Using this project (today)

Right now there’s **no installable release**.

If you want to help test early builds:
1. ⭐ Star the repo to follow along.
2. Open a **Discussion** with your org’s context (Wix site, FB Page, IG status, Google Calendar readiness).
3. If you have a helper, we’ll coordinate on an early pilot and share setup instructions before the first public release.

---

## Contributing

We welcome contributors of all experience levels—especially nonprofit staff/volunteers who can validate real‑world needs.

- Share ideas and questions in **Discussions**.
- Use **Issues** for bugs or concrete requests.
- If you’re technical and want to help, see `DESIGN.md` for the plan and open an Issue to coordinate.

---

## License

Released into the public domain under **The Unlicense**.

You may copy, modify, publish, use, compile, sell, or distribute this software,
either in source code form or as a compiled binary,
for any purpose, commercial or non‑commercial, and by any means.

See the [LICENSE](LICENSE) file or <https://unlicense.org/> for the full text.

**Disclaimer of Warranty:** This software is provided “AS IS”, without warranty of any kind.

---

## Credits & contact

Created and maintained by volunteers aiming to save nonprofits time and money.

- Project lead: Pekka Ilmari Nikander <pnr@iki.fi>
- Discussions: please use the GitHub **Discussions** tab

If you’re a small nonprofit and want to pilot this, we’d love to talk.

---

## Development

### Quick Start
```bash
npm run setup           # Install all dependencies
npm run verify-offline  # Confirm offline-ready
npm run dev auth        # Test Google Calendar auth
```

### Offline Development
This project is designed for **100% offline development** after initial setup. See [`docs/OFFLINE-DEVELOPMENT.md`](docs/OFFLINE-DEVELOPMENT.md) for detailed workflow and troubleshooting.

### Architecture Spikes
Current implementation status and lessons learned: [`docs/SPIKES.md`](docs/SPIKES.md)

---

## FAQ (short)

**Is this a sync tool?**
No. It’s a **fanout** bridge: one‑way from your source of truth to other platforms. If we ever support two‑way sync, it’ll be a separate project.

**Will it cost money to run?**
We aim for **€0/month** on common setups.

**Why not use Zapier/Make/etc.?**
They’re fine, but recurring fees add up for tiny budgets. This project is free and open‑source.

**What if my org isn’t on Wix?**
WordPress support is on the roadmap. Other targets can be added over time.
