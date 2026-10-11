---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (learner choice, stated in `1-start` and confirmed at the start of `5-build`)

## Slices

- [x] **1. You can answer the whole interview offline and get a card**
  Becomes usable: `npm start`, open the page, see the Start screen with the "Offline mode" badge, answer Q1-Q11 with chips (Back works, "N of about 10"), and get a Card with the three sections, the base actions in default order with source tags, the sources list, and the fixed cannot-judge items.
  Why now: Proves the whole path (server, page, questions, rules, card) on the first slice, offline, with no key. Bootstrapping lives here.
  PRD ref: `prd.md > The Core Journey` (steps 1, 2, 7), `prd.md > Start Screen`, `prd.md > Question Screen`, `prd.md > Card Screen`, `prd.md > Source Tags`
  Spec ref: `spec.md > Local Server`, `spec.md > Screens and Flow`, `spec.md > Fixed Content`, `spec.md > Rules Module`, `spec.md > File Structure`, `spec.md > Where It Runs and How Someone Tries It`
  Build: `package.json` (type module, scripts, exact `@anthropic-ai/sdk` version at least two weeks on npm), `npm install`; `server/server.js` with static files and `GET /api/mode` on 127.0.0.1; `public/index.html`, `app.js`, `lib/questions.js`, `lib/content.js`, `lib/sources.js`, `lib/rules.js` with action conditions and default order; plain base styles.
  Verify (mechanical): `npm test` passes a first `test/rules.test.js` (conditions, default order, A2 always, all "Not sure"); start the server, `curl` `/`, `/api/mode` (`offline`) and a `lib/` file; a headless browser run clicks through Q1-Q11 and finds the three card sections and the source tags.
  Learner check: Start the app, answer every question, and look at the card: are the three sections and their wording what you pictured?
  Commit: `Add offline interview and base card`

- [ ] **2. Your household changes the card**
  Becomes usable: F1-F3 follow-ups appear only under their conditions with "Because you said ..."; the child, older-person and pet modifiers change order and contents with "why" lines tagged "App rule"; building facts produce engineer questions (and general ones when none) without touching actions or order; the Law 6306 owner line.
  Why now: This is the kernel (an order for your household, facts turned into engineer questions), so it comes right after the skeleton.
  PRD ref: `prd.md > Interview`, `prd.md > Priority Rules`, `prd.md > Honest Redirect`
  Spec ref: `spec.md > Rules Module`, `spec.md > Fixed Content`, `spec.md > Sources Shown on the Card`
  Build: `followupsFor`, `questionSequence`, full `buildCard` (modifiers, variants, why lines, engineer questions); the page asks follow-ups and renders the new card parts.
  Verify (mechanical): `npm test` with the demo pair A/B, "facts never change order", F1-F3 conditions, A5-second rule, "A5 absent" case; headless run of household B shows A1 first with "start with the child's room" and A5 second with the stairs line.
  Learner check: Run the app twice as household A and household B from the PRD and compare the two cards.
  Commit: `Add household rules, follow-ups and engineer questions`

- [ ] **3. The app stays honest and stops for emergencies**
  Becomes usable: "Can you tell me if my building is safe?" on every question opens the Honest Panel with the facts given so far and returns to the same question; "Something happening right now?" opens the Emergency screen; free text with an emergency phrase opens the Emergency screen (only "Call 112 now", the only red); a way to come back later.
  Why now: The honest line and the 112 stop are the hard boundaries and two of the four demo proofs; they must work before any live wording is added.
  PRD ref: `prd.md > Honest Panel`, `prd.md > Emergency Screen`, `prd.md > Honest Redirect`, `prd.md > Emergency Stop`
  Spec ref: `spec.md > Emergency Check`, `spec.md > Screens and Flow`
  Build: `lib/emergency.js` phrase check; the two links, the panel overlay and the Emergency view in `app.js`/`index.html`.
  Verify (mechanical): `npm test` for `test/emergency.test.js` (positives incl. "I smell gas"; negatives "we have a gas stove", "fire extinguisher", "the room smells damp"); headless run: link opens panel and returns to the same question, "I smell gas" in Q11 shows the Emergency screen, page text contains no number other than 112.
  Learner check: Tap "Can you tell me if my building is safe?" mid-interview, then type "I smell gas" in the last box. What do you see each time?
  Commit: `Add honest panel and emergency stop`

- [ ] **4. The card is yours to keep: ticks, return visits, print, clear**
  Becomes usable: Ticks and the card survive closing the tab; mid-interview reload resumes at the same question; Print gives a one-page A4 card; Start over and Clear my answers work; the full look and feel (paper, ink, teal accent, bundled Source Serif 4 and Source Sans 3).
  Why now: Completes the offline product the learner will see in the video before the live path is layered on.
  PRD ref: `prd.md > Card`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Data Model`, `spec.md > Look and Feel`
  Build: `localStorage` load/save, ticks, resume, Start over, Clear; `styles.css` with tokens, fonts from Adobe's GitHub releases with `OFL.txt`, print stylesheet.
  Verify (mechanical): `npm test`; headless run: tick, reload, tick still there; reload mid-interview resumes; Clear empties `localStorage`; print-to-PDF on A4 is one page with nothing cut off; screenshots at phone and desktop width.
  Learner check: Tick two actions, close the tab, reopen it, and print the card. Does it look like a note you would stick on the fridge?
  Commit: `Add saved card, print and visual style`

- [ ] **5. Live mode with the fence**
  Becomes usable: With a key, the server's `/api/claude` runs the three tasks; follow-up wording, free-text flags and card explanations come from Claude inside the checks; any failure falls back to fixed wording with a notice; the live-mode disclosure line on the Start screen.
  Why now: The model is the last layer on a product that already works without it; the fence is tested with a stubbed client because there is no key on this server.
  PRD ref: `prd.md > Live and Offline Modes`, `prd.md > Card`, `prd.md > Emergency Stop`
  Spec ref: `spec.md > Local Server`, `spec.md > Claude Tasks`, `spec.md > Card Text Check`, `spec.md > Claude Client (browser side)`, `spec.md > Live-Mode Disclosure`, `spec.md > External Services and Dependencies`
  Build: `server/claude.js`, `server/prompts.js`, `POST /api/claude`; `lib/validate.js`; `askClaude` with timeouts and offline switch in `app.js`; the client is injectable so tests can stub it.
  Verify (mechanical): `npm test` for `test/validate.test.js` and a server task test with a stubbed SDK client: one good response plus the four failure forms (API error, `refusal`/`max_tokens`, unparseable text, parses but fails the check); keyword emergency still wins when the stub says no emergency; with no key `/api/claude` returns 503 and the app stays offline.
  Learner check: Later, with your own key: run in live mode and read the card explanations; then set a wrong model name in `.env` and watch the fixed-wording fallback.
  Commit: `Add live mode with checked Claude output`

- [ ] **6. Someone else can run it**
  Becomes usable: A stranger can clone, read the README (what it is, what it is not, run steps, both modes, how to run live, sources, the live-mode sentence) and start it; `.env.example`; MIT `LICENSE`.
  Why now: Needed for the public repo and the video; written last so it describes what exists.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure`
  Build: `README.md` (incl. a short "How this was built" section: built with Claude Code running the Devpost Learn skill pack; planning docs in `devpost/`; an AI agent answered the planning interviews from the learner's background and the learner approved them; plus the live-mode sentence from `spec.md > Live-Mode Disclosure`), `.env.example`, `LICENSE`.
  Verify (mechanical): fresh clone into a temp folder, `npm ci`, `npm test`, `npm start` on another port, `curl /api/mode` returns `offline`; no Turkish characters and no secrets in tracked files.
  Learner check: Read the README as if you had never seen the project. Is anything missing to run it?
  Commit: `Add README, env example and license`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 3: the four scope proofs in offline mode (two households, honest redirect, 112 stop, offline label)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- `@anthropic-ai/sdk` pinned to `0.128.0`, not `0.133.0` — the build rule asks for a version at least two weeks on npm; `0.128.0` (2026-09-22) is the newest that qualifies.
