---
doc: checklist
status: approved
---

> Note, added after approval: in this project, "the learner" means the answers an AI agent gave on Tuna's behalf, based on Tuna's background. The agent also gave the approvals recorded here. See "How this was built" in the README.

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

- [x] **2. Your household changes the card**
  Becomes usable: F1-F3 follow-ups appear only under their conditions with "Because you said ..."; the child, older-person and pet modifiers change order and contents with "why" lines tagged "App rule"; building facts produce engineer questions (and general ones when none) without touching actions or order; the Law 6306 owner line.
  Why now: This is the kernel (an order for your household, facts turned into engineer questions), so it comes right after the skeleton.
  PRD ref: `prd.md > Interview`, `prd.md > Priority Rules`, `prd.md > Honest Redirect`
  Spec ref: `spec.md > Rules Module`, `spec.md > Fixed Content`, `spec.md > Sources Shown on the Card`
  Build: `followupsFor`, `questionSequence`, full `buildCard` (modifiers, variants, why lines, engineer questions); the page asks follow-ups and renders the new card parts.
  Verify (mechanical): `npm test` with the demo pair A/B, "facts never change order", F1-F3 conditions, A5-second rule, "A5 absent" case; headless run of household B shows A1 first with "start with the child's room" and A5 second with the stairs line.
  Learner check: Run the app twice as household A and household B from the PRD and compare the two cards.
  Commit: `Add household rules, follow-ups and engineer questions`

- [x] **3. The app stays honest and stops for emergencies**
  Becomes usable: "Can you tell me if my building is safe?" on every question opens the Honest Panel with the facts given so far and returns to the same question; "Something happening right now?" opens the Emergency screen; free text with an emergency phrase opens the Emergency screen (only "Call 112 now", the only red); a way to come back later.
  Why now: The honest line and the 112 stop are the hard boundaries and two of the four demo proofs; they must work before any live wording is added.
  PRD ref: `prd.md > Honest Panel`, `prd.md > Emergency Screen`, `prd.md > Honest Redirect`, `prd.md > Emergency Stop`
  Spec ref: `spec.md > Emergency Check`, `spec.md > Screens and Flow`
  Build: `lib/emergency.js` phrase check; the two links, the panel overlay and the Emergency view in `app.js`/`index.html`.
  Verify (mechanical): `npm test` for `test/emergency.test.js` (positives incl. "I smell gas"; negatives "we have a gas stove", "fire extinguisher", "the room smells damp"); headless run: link opens panel and returns to the same question, "I smell gas" in Q11 shows the Emergency screen, page text contains no number other than 112.
  Learner check: Tap "Can you tell me if my building is safe?" mid-interview, then type "I smell gas" in the last box. What do you see each time?
  Commit: `Add honest panel and emergency stop`

- [x] **4. The card is yours to keep: ticks, return visits, print, clear**
  Becomes usable: Ticks and the card survive closing the tab; mid-interview reload resumes at the same question; Print gives a one-page A4 card; Start over and Clear my answers work; the full look and feel (paper, ink, teal accent, bundled Source Serif 4 and Source Sans 3).
  Why now: Completes the offline product the learner will see in the video before the live path is layered on.
  PRD ref: `prd.md > Card`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Data Model`, `spec.md > Look and Feel`
  Build: `localStorage` load/save, ticks, resume, Start over, Clear; `styles.css` with tokens, fonts from Adobe's GitHub releases with `OFL.txt`, print stylesheet.
  Verify (mechanical): `nice -n 19 npm test` incl. `test/storage.test.js` (save/load with a fake storage: ticks kept, step resumes, Start over keeps nothing but mode, Clear removes the key, broken JSON starts fresh); `curl` the font files and `OFL.txt`. Browser checks (tick survives reload, resume mid-interview, print-to-PDF one A4 page, phone and desktop screenshots) move to the final checkpoint run on the laptop.
  Learner check: Tick two actions, close the tab, reopen it, and print the card. Does it look like a note you would stick on the fridge?
  Commit: `Add saved card, print and visual style`

- [x] **5. Live mode with the fence**
  Becomes usable: With a key, the server's `/api/claude` runs the three tasks; follow-up wording, free-text flags and card explanations come from Claude inside the checks; any failure falls back to fixed wording with a notice; the live-mode disclosure line on the Start screen.
  Why now: The model is the last layer on a product that already works without it; the fence is tested with a stubbed client because there is no key on this server.
  PRD ref: `prd.md > Live and Offline Modes`, `prd.md > Card`, `prd.md > Emergency Stop`
  Spec ref: `spec.md > Local Server`, `spec.md > Claude Tasks`, `spec.md > Card Text Check`, `spec.md > Claude Client (browser side)`, `spec.md > Live-Mode Disclosure`, `spec.md > External Services and Dependencies`
  Build: `server/claude.js`, `server/prompts.js`, `POST /api/claude`; `lib/validate.js`; `askClaude` with timeouts and offline switch in `app.js`; the client is injectable so tests can stub it.
  Verify (mechanical): `npm test` for `test/validate.test.js` and a server task test with a stubbed SDK client: one good response plus the four failure forms (API error, `refusal`/`max_tokens`, unparseable text, parses but fails the check); keyword emergency still wins when the stub says no emergency; with no key `/api/claude` returns 503 and the app stays offline.
  Learner check: Later, with your own key: run in live mode and read the card explanations; then set a wrong model name in `.env` and watch the fixed-wording fallback.
  Commit: `Add live mode with checked Claude output`

- [x] **6. Someone else can run it**
  Becomes usable: A stranger can clone, read the README (what it is, what it is not, run steps, both modes, how to run live, sources, the live-mode sentence) and start it; `.env.example`; MIT `LICENSE`.
  Why now: Needed for the public repo and the video; written last so it describes what exists.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure`
  Build: `README.md` (incl. a short "How this was built" section: built with Claude Code running the Devpost Learn skill pack; planning docs in `devpost/`; exactly this sentence: "An AI agent answered the planning interviews on my behalf, based on my background.", nothing more about approval; plus the live-mode sentence from `spec.md > Live-Mode Disclosure`), `.env.example`, `LICENSE`.
  Verify (mechanical): fresh clone into a temp folder, `npm ci`, `npm test`, `npm start` on another port, `curl /api/mode` returns `offline`; no Turkish characters and no secrets in tracked files.
  Learner check: Read the README as if you had never seen the project. Is anything missing to run it?
  Commit: `Add README, env example and license`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 3: the four scope proofs in offline mode (two households, honest redirect, 112 stop, offline label)
- [x] Final kick-the-tires exploration and feedback completed — after slice 6; the browser run (slice 4 checks plus a slice 1-3 regression) goes to the laptop via the planning agent. Laptop run 1 found 7 failures; after the fixes, laptop run 2 passed 49/49 and the learner's review (via the planning agent) passed.

## Final Review

- [x] Fix: official-process block renders as text, not "[object ...]" (commit "Fix card process block and fit print on one page"; confirmed on laptop run 2)
- [x] Fix: card B prints on one A4 page with every line kept (commit "Fix card process block and fit print on one page"; confirmed on laptop run 2)
- [x] Fix: README names the survey source and says the app is not tested with users yet (same commit)
- [x] Final review complete — feedback resolved and learner confirms ready to ship (the planning agent: "Final review passed")

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: focused alternative on the learning goal (keeping an LLM inside hard safety boundaries while it is still useful). Evidence: `checkCardText` in `public/lib/validate.js`, the four failure forms driven through a stub client in `test/claude.test.js`, and the "[object ...]" bug that passed every data test and was caught only by laptop run 1. The learner named what the evidence does not establish: real model behaviour (fallback rate, latency, effort on the fast model), that the check reads words and not meaning, that the emergency check knows only English phrases (Turkish phrases were added afterwards, in 2e55170), and that nobody outside the build has used it yet.
Route and stops: not toured interactively; the map holds a reference route ("Make my card": `public/app.js` writeCard/askClaude, `server/claude.js` card, `public/lib/validate.js` checkCardText).
Edit outcome: not applicable (focused alternative, no edit).
Reflection: transfer question offered, skipped.
Activity mode: focused alternative, answered by the learner through the planning agent. App map: `devpost/app-map.html` (paths and symbols checked against the code; browser look-over goes with the 6-ship laptop run).

## Revisions

- `@anthropic-ai/sdk` pinned to `0.128.0`, not `0.133.0` — the build rule asks for a version at least two weeks on npm; `0.128.0` (2026-09-22) is the newest that qualifies.
- Added a fixed offline check, `asksForVerdict` in `lib/emergency.js`, so free text asking for a verdict ("Is my building safe?") opens the Honest Panel in offline mode too, as `prd.md` asks. It opens once per text; submitting the same text again makes the card. Live mode adds the model's flag on top.
- Build server load (2026-10-11): no headless browser run per slice from slice 4 on. Each slice is verified with `nice -n 19 npm test`; browser checks run only at the two hands-on checkpoints, on the laptop. Slice 4 storage logic goes in a pure `lib/storage.js` so it can be unit-tested.
- Checkpoint 1 feedback (learner, via the planning agent), folded into slice 4: progress is "N of M" with M from `questionSequence`; the Law 6306 and renter lines move under "The official process" below the engineer questions (`buildCard` returns `process`); the Honest Panel shows facts as plain sentences; the Emergency back button reads "Back to the questions"; the A5 helper and neighbour lines merge into one sentence (`who_helps_neighbour`); print uses a smaller base size and small-type sources. `prd.md` and `spec.md` updated to match.
- Fonts: only three files are bundled (Source Serif 4 Semibold for headings, Source Sans 3 Regular and Semibold for body), from releases `4.005R` and `3.052R`. The release zips carry no license file, so each `OFL.txt` is the `LICENSE.md` from the same release tag in Adobe's repository.
- Slice 5 findings: the pinned SDK `0.128.0` types confirm `output_config: { effort, format: { type: "json_schema", schema } }`, so no tool fallback was needed. C2 cannot be checked without a key, so the fast tasks send `effort: "low"` and, if the API answers 400 naming effort, retry once without it and keep it off (tested with a stub); the first live run will show which path Haiku takes. The `followup` task takes only `followupId` and reads the fixed question from `questions.js` on the server, and the `card` task rebuilds titles and lines from `content.js`, so no text from the browser goes into a prompt except the free-text note sent to `flags`. The server runs the same checks as the browser (`validate.js`, plus `checkFlags`), and the page checks the card again before showing it. Live mode shows the fixed card at once and swaps in Claude's explanations only when they pass.
- Final review, laptop run 1 (39 ok, 7 fail): the official-process block rendered as "[object ...]" text because `replaceChildren` got a nested array; the card is now built from a pure `lib/cardview.js` (tested in `test/cardview.test.js`) and every child list is flattened before it reaches the DOM. Card B printed on two pages; the print stylesheet now uses smaller type, tighter spacing and a two-column sources list, with every line kept. The phone-number check in the laptop script now allows the law numbers 6306 and 7471. README names the survey source and says the app is not tested with users yet.
- Final review, laptop run 2 (49 ok, exit 0): the process block renders as text, card B prints on one A4 page, fonts load, no console errors. The page then had about a fifth of its height free, so the print sizes went back up (9.5pt body, 7.5pt small lines, 7pt sources; commit "Raise print type sizes to use the A4 page"). The laptop script keeps its one-page check, and the next laptop run re-checks it together with any 6-ship changes.
- Learning wrap-up raised two gaps, planned for 6-ship and not built yet: the wording check reads words, not meaning, so reassurance phrases (hold up, should be fine, sturdy, solid, nothing to worry) join the blocked list with tests; the emergency check knows only English, so a few Turkish emergency phrases are matched after folding Turkish letters to ASCII (letters written as \u escapes so repo files stay ASCII), with tests.
- 6-ship safety follow-ups, done: reassurance words are refused in Claude's wording, with "sturdy table"/"sturdy desk" allowed because Drop, Cover, Hold On uses them (commit "Refuse reassurance words in Claude's wording"); Turkish emergency phrases are matched after folding Turkish letters to ASCII, as phrases where a single word is ordinary ("yangin tupu", and "coktu" which also means "there were many") (commit "Catch Turkish emergency phrases"). The flags prompt says the note may be in Turkish. `spec.md`, `prd.md`, README and the app map updated.
- Mode badge on every view (6-ship, requested with the video work so each scene shows the mode): `#mode-badge` moved from the Start section to the top of the page, a second badge inside the Honest Panel overlay, hidden on Emergency (only 112 there) and in print. `.badge[hidden]` needs its own rule because `.badge` sets `display`. Checked by new badge checks in the laptop run, not by `npm test` (no DOM in the unit tests).
