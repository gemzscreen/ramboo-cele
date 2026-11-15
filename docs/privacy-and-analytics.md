# Analytics and privacy — decision paper (ROADMAP D9)

**Status:** approved by Gemz 2026-11-15 — no analytics before v1.0.0, then one
cookieless aggregate counter (GoatCounter). Nothing here is switched on: the
app loads no analytics and sends no data anywhere.

*Not legal advice. Have the notice and this approach reviewed by a lawyer
familiar with RA 10173 before Phase 3 (accounts) at the latest.*

## What the app handles, by phase

| Phase | Data | Where it lives | Personal information? |
|---|---|---|---|
| 0–2 (now → study hub) | Scores, timing, mistake bank, settings | The user's own browser (localStorage / IndexedDB) | Not held by us — it never leaves the device |
| 0–2 | Page requests (IP address, browser) | GitHub's servers, as the host | Processed by GitHub, not visible to us |
| 0–2 | Donations | GCash / Maya / Ko-fi | Handled by those providers; we see what they show a recipient |
| 3 (accounts) | Google account ID, email, username, synced history | Supabase | **Yes** — we become a personal information controller in practice |
| 4 (payments) | Payment reference, entitlement | PayMongo, Supabase | **Yes** |

The line that matters is Phase 3. Before it, the simplest honest position is
available: *we do not collect personal information*. The analytics choice
decides whether that sentence stays true.

## Recommendation

**1. Phase 0 through launch (v1.0.0): no analytics.**
There is nothing to measure before launch, and "no tracking at all" is the
strongest thing a free tool can say to students.

**2. At launch: one cookieless, aggregate-only counter.**
Enough to answer the questions that actually drive the roadmap: how many
people use it, which subject, phone or desktop, and whether they come back
the next week. Requirements for whichever tool is picked:

- no cookies and no persistent identifier, so no consent banner is needed;
- no IP addresses stored; no cross-site tracking; no advertising use;
- a single small script, loaded after the app is usable, and the app works
  identically if it is blocked;
- honours Do Not Track / Global Privacy Control.

**3. No Google Analytics.** It sets cookies, identifies users across visits and
would require a consent banner and a longer notice, for detail this project
does not need.

**4. In-app events stay on the device.** Topic-weakness analytics (ROADMAP §1,
differentiator 6) are computed locally from the user's own history. They are a
feature for the user, not telemetry for us.

### Candidate tools

All three are cookieless and meet the requirements above as generally
described by their makers. **Pricing and terms change — check each one's
current terms before adopting; nothing below has been verified against a live
pricing page.**

| Tool | For | Against |
|---|---|---|
| **GoatCounter** | Open source, very small script, made for exactly this; hosted tier has been free for non-commercial use; can be self-hosted later | "Non-commercial" may stop applying once paid tiers start (Phase 4) |
| **Cloudflare Web Analytics** | Free, no site-traffic proxying needed for the script version, large provider | Less detail; data sits with a large US company; dashboard is basic |
| **Plausible** | Polished, EU-hosted, clear public policy | Paid subscription from day one |

**Suggested pick: GoatCounter at launch, revisit at Phase 4.** It is the
smallest commitment and the easiest to explain in one sentence of the notice.

### What adopting one changes in the repo

- `tests/stage2-dom.js` currently fails any script loaded from another host.
  The chosen analytics host gets a single, explicit allow-list entry there.
- `docs/privacy-notice.md` gains the "Usage counts" paragraph (already drafted
  in it, marked as not yet in force).
- A one-line setting in the app to turn the counter off.

## RA 10173 (Data Privacy Act of 2012) — what applies when

**Now (no accounts, no analytics):** we hold no personal information, so there
is little to comply with beyond being truthful. Still worth doing: publish the
notice, because users store exam history in the app and deserve to know it
stays on their device.

**From Phase 3 (accounts):**

- **Privacy notice** covering what is collected, why, the legal basis
  (consent / contract), retention, who it is shared with (Supabase, Google
  sign-in, PayMongo later), and the data subject's rights.
- **Data subject rights** have to be workable in practice: to be informed, to
  access, to object, to rectify, to erase or block, to data portability, to
  damages, and to complain to the National Privacy Commission. The export /
  import backup planned for Phase 1 and an account-deletion button cover most
  of these.
- **Someone accountable for data protection** (a Data Protection Officer in
  the Act's terms) — for a one-person project, that is Gemz, with a contact
  address published in the notice.
- **Security measures** proportionate to the data: Row Level Security on every
  Supabase table, no service keys in client code, least data collected.
- **Breach notification**: the NPC and affected users must be told promptly
  after a breach involving sensitive data that risks real harm (the rules set
  a 72-hour clock). Decide in advance who does this.
- **Leaderboards**: public username only, never the real name or email
  (already the plan in ROADMAP Phase 3).
- **NPC registration**: mandatory registration depends on size and on the
  kind and volume of data processed. Whether it applies should be confirmed
  with the lawyer at Phase 3; it is unlikely to apply before then.
- **Cross-border storage**: Supabase and Google store data outside the
  Philippines. The Act allows this, with the controller staying accountable;
  say so in the notice.
- **Minors**: CELE takers are graduates, so the audience is adult. State in
  the terms that accounts are for users 18 and over.

## Decisions needed from Gemz

1. Approve "no analytics until v1.0.0, then one cookieless counter".
2. Pick the tool (suggested: GoatCounter), or defer the pick to launch week.
3. Provide a public contact email for privacy questions — ideally a project
   address, not a personal one. The notice has a placeholder until then.
4. Confirm the notice wording in `docs/privacy-notice.md`.
