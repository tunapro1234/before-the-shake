---
doc: spec
status: approved
---

# Before the Shake — Technical Spec

## How This Works, In Plain Language
Before the Shake is a small web app that runs on your own computer. It has three pieces:

1. **The page in the browser.** It shows the screens, asks the questions, and holds the **rules module**: one plain JavaScript file that knows every question, every action and every rule. Given the answers, the rules module decides which actions go on the card, in what order, with which "why" lines and which engineer questions. It does this the same way every time, with or without Claude.
2. **A tiny local server.** It hands the page its files and has one route, `/api/claude`, that talks to Claude. It exists only so the API key stays in `.env` on your machine and never reaches the page.
3. **Claude, in two roles.** A fast model (Claude Haiku 5.5) words the follow-up questions and reads the free-text answer into two yes/no flags. A stronger model (Claude Opus 5.5) writes one short explanation under each action on the card. Claude never decides what is on the card or in what order.

The page always builds the card skeleton itself: action titles, order, source tags, engineer questions and "What this app cannot judge" are the app's own fixed text. Claude's explanations are checked against that skeleton before they are shown; anything that does not match is thrown away and the fixed wording is used.

Answers, the card and the ticks are kept in the browser's `localStorage` (a small notebook the browser keeps for one site). Nothing is saved on a server. Without an API key the page runs the same flow with fixed wording and says "Offline mode"; that also means the same files can later be put online as a static offline demo.

Why this shape: the rules are the product, so they live in one testable file that does not depend on Claude. Claude adds plain language where it helps, inside a fence the app checks.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. You run `npm start` and open `http://localhost:3000`. The page asks the server `GET /api/mode`; the server answers `live` if `ANTHROPIC_API_KEY` is set, else `offline`. If the request fails (no server, as in the static demo), the page uses `offline`. The Start screen shows the badge.
2. You press Start. The page reads the question list from `questions.js` and shows Q1. Each chip tap is saved to `localStorage` right away.
3. When a follow-up's condition is met (`rules.js > followupsFor(answers)`), the page shows it. In live mode it first asks `/api/claude` with task `followup` (fast model) for a friendlier wording of the question; the "Because you said ..." line and the chips are fixed. If the call fails or the wording fails its check, the fixed wording is used.
4. "Can you tell me if my building is safe?" opens the Honest Panel (fixed text from `content.js`), which lists the building facts given so far as plain sentences (`FACTS` in `content.js`). Closing it returns to the same question.
5. "Something happening right now?" opens the Emergency screen directly.
6. At Q11 you can type free text. The page first runs `emergency.js > hasEmergencyKeyword(text)` in the browser. A match shows the Emergency screen at once, with no Claude call. In live mode the page then asks `/api/claude` with task `flags` (fast model) for `{emergency, verdict_request}`. `emergency: true` also opens the Emergency screen; `verdict_request: true` opens the Honest Panel. The model can only add flags; a keyword match is never cleared.
7. After the last question, `rules.js > buildCard(answers)` returns the **rule output**: the ordered action ids with their fixed titles, variants, "why" lines and source tags, the engineer question ids, and the cannot-judge items.
8. In live mode the page sends the rule output to `/api/claude` with task `card` (card model). Claude returns JSON with one explanation per action id. `validate.js > checkCardText(ruleOutput, modelJson)` checks it (see Card Text Check). Pass: explanations are shown under the fixed titles. Fail: fixed explanations from `content.js`, with a small "Fixed wording" note.
9. The Card screen shows the three sections and the sources list. Ticks, Print (`window.print()` with a print stylesheet), Start over and Clear my answers act on `localStorage`.

```
Browser (public/)                            Local server (server/)            Claude API
┌──────────────────────────────┐   POST     ┌───────────────────────┐        ┌─────────────┐
│ app.js  screens + flow       │──/api/────→│ server.js  route      │──SDK──→│ Haiku 5.5   │
│ lib/rules.js  order (fixed)  │  claude    │ claude.js  3 tasks    │        │ Opus 5.5    │
│ lib/validate.js  fence       │←──JSON─────│ prompts.js  schemas   │←───────│             │
│ localStorage  answers, ticks │            └───────────────────────┘        └─────────────┘
└──────────────────────────────┘
```

## Stack
Learner-accepted (4-spec, group 1):
- **Node.js 22** (installed on the dev machine: v22.22.0). Runs the local server. https://nodejs.org/docs/latest-v22.x/api/
- **Built-in `node:http`**, no web framework — one route plus static files does not need Express.
- **Plain browser JavaScript (ES modules), no build step** — open the files, no bundler to debug.
- **`@anthropic-ai/sdk`**, the only runtime dependency, pinned to an exact version in `package.json` (no `^`). Pinned to `0.128.0`, the newest version at least two weeks on npm at install (2026-10-11). https://github.com/anthropics/anthropic-sdk-typescript · https://docs.claude.com/en/api/messages
- **`node:test`** and `node:assert` for unit tests, no test framework. https://nodejs.org/docs/latest-v22.x/api/test.html
- **No other dependencies.** Structured JSON output uses the API's `output_config.format` with a plain JSON schema, so no schema library is added.

Unverified, check early in the build: the exact `output_config: { format: { type: "json_schema", schema } }` shape in SDK `0.133.0` (fallback: a single strict tool with `tool_choice: auto`); that `.env` loading works with Node 22's `--env-file=.env` flag.

## Where It Runs and How Someone Tries It
- **Runtime:** Node 22 local process; any modern browser.
- **Setup:** `npm install`, then `cp .env.example .env` and add `ANTHROPIC_API_KEY` for live mode (optional). Optional `CLAUDE_MODEL_FAST` (default `claude-haiku-5-5`) and `CLAUDE_MODEL_CARD` (default `claude-opus-5-5`), `PORT` (default `3000`).
- **Start:** `npm start` (runs `node --env-file-if-exists=.env server/server.js`; flag to verify in the build, fallback: load `.env` with a few lines in `server.js`). Open `http://localhost:3000`.
- **Tests:** `npm test` (runs `node --test`).
- **Demo recording:** local, live mode for the main run; then restart without the key for the offline run. Show the four proofs from `scope.md > What "Working" Looks Like` with the demo pair from `prd.md > Priority Rules`.
- **Submission:** short demo video + public GitHub repository (required). The planning docs `devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md` are in the repo.
- **Optional public demo (learner choice):** offline mode only, the `public/` folder served as static files, no key, no live calls, no server route. Only after the local version works; hosting details decided at the end of `5-build`.

## Look and Feel
From `prd.md > Look and Feel`. All in `public/styles.css`, CSS custom properties at the top.
- **Colors:** paper `#FAF7F0` (off-white), ink `#1E1E1C` (dark), muted ink `#5A5852` for secondary text, rule lines `#D9D3C7`, accent deep ink teal `#1F5F5B` for buttons, checkboxes (`accent-color`) and links. Emergency red `#B3261E`, used only on the Emergency screen. No gradients, no shadows beyond a 1px rule, no illustrations.
- **Type:** headings in a sturdy book serif, body in a clean sans. Learner-confirmed: bundle **Source Serif 4** and **Source Sans 3** (SIL Open Font License) as `woff2` in `public/fonts/` with `OFL.txt`, downloaded from Adobe's official GitHub releases, so the video looks the same on any machine and no font CDN is needed; fallbacks `Georgia, serif` and `system-ui, sans-serif`. Base size 20px, line height 1.5, headings 1.6-2rem.
- **Layout:** single column, max width about 38rem, 16px side padding on phones, generous spacing. Chips are large tap targets (min 48px high) in a wrapped row.
- **Card:** looks like a printed note: a thin border, section headings in the serif, numbered actions with a checkbox, the tag in small muted text. `@media print` hides buttons, links and badges, keeps the three sections and the sources list, fits one A4 page (`@page { size: A4; margin: 15mm }`).
- **Copy tone:** plain words, short sentences, calm. "Because you said ..." lines in muted ink.

## Components

### Rules Module
`public/lib/rules.js`. Pure functions, no DOM, no network; imported by the page and by the tests.
- `followupsFor(answers)` → which of F1-F3 apply (`prd.md > Interview`).
- `questionSequence(answers)` → ordered list of question ids to ask (Q1-Q10, applicable F1-F3 placed right after their trigger question, then Q11). Used for "N of M" progress (M = length of the sequence).
- `buildCard(answers)` → rule output (see Data Model): actions on the card (`prd.md > Priority Rules` conditions), order (default A1-A6, child keeps A1 first, older person puts A5 second or first when A1 is absent, ties keep default order), variants (F1 child's room, child items, pet items, help-moving line, stairs line, F2 line), "why" lines tagged "App rule", engineer questions from Q8-Q10 and F3, general questions when no facts.
- Building facts are never read by the ordering code: the order function takes only household and preparedness answers.
PRD ref: `prd.md > Priority Rules`, `prd.md > Interview`, `prd.md > Honest Redirect`.

### Fixed Content
`public/lib/questions.js` (Q1-Q11 and F1-F3 text and chips, every chip list ending in "Not sure"), `public/lib/content.js` (action titles and variants, fixed explanations, "why" templates, engineer question texts, cannot-judge items, Honest Panel and Start screen text, offline follow-up wording), `public/lib/sources.js` (numbered sources). All English, own sentences, no copied official text.
PRD ref: `prd.md > Source Tags`, `prd.md > Honest Redirect`, `prd.md > Card`.

### Emergency Check
`public/lib/emergency.js`. `hasEmergencyKeyword(text)`: lowercase, then match fixed **phrases**, not single words, so ordinary answers do not trip it (gas comes up often because of Q7):
- gas together with smell or leak: `smell gas`, `smell of gas`, `smells of gas`, `gas smell`, `gas leak`, `leaking gas`, `gas is leaking`;
- `trapped`; `injured`, `injury`, `injuries`; `bleeding`;
- `on fire`, `fire in` (e.g. "fire in the kitchen");
- `collapsed`, `collapsing`.
Runs in the browser before any Claude call, in both modes. The page combines `keyword || modelFlag`; there is no code path where the model flag lowers a keyword match.
PRD ref: `prd.md > Emergency Stop`.

### Card Text Check
`public/lib/validate.js`. The fence around the model; this is the learner's chosen approach (see Decisions).
- `checkCardText(ruleOutput, json)` passes only if: `json` is an object with an `actions` array; the list of `id`s equals the rule output's id list exactly, same length and same order; every `explanation` is a string of 1-240 characters; no explanation contains a digit, `%`, or the blocked phrases (`safe building`, `building is safe`, `unsafe`, `risk score`, `percent`, `guarantee`) or reassurance words matched as whole words (`hold up`/`holds up`, `should be fine`, `sturdy`, `solid`, `nothing to worry`; only `sturdy table`/`sturdy desk` is allowed, for Drop, Cover, Hold On); no extra keys beyond `id` and `explanation`.
- `checkFollowupText(text)` passes only if: 1-160 characters, ends with `?`, no digit, no blocked phrase.
- On fail, the caller uses the fixed text from `content.js`. Titles, order, tags, engineer questions and cannot-judge items are never taken from the model, so a reworded explanation cannot change them.
PRD ref: `prd.md > Card`, `prd.md > Live and Offline Modes`.

### Screens and Flow
`public/app.js` with `public/index.html`. One page, five views switched by showing one `<section>` at a time: Start, Question, Honest Panel (an overlay on Question), Emergency, Card. Holds the flow: next/back over `questionSequence`, the two fixed links on every question screen, the mode badge, the offline notice, and calls to `/api/claude`. Reads and writes `localStorage` through two small helpers (`load()`, `save()`).
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey`.

### Claude Client (browser side)
In `public/app.js`, `askClaude(task, payload)` does `fetch('/api/claude', { method: 'POST', body: JSON.stringify({ task, payload }) })` with a timeout (8 s for `followup`/`flags`, 30 s for `card`). Any network error, timeout, non-200 or `{ error }` response switches the session to offline mode with the notice "Live connection lost. Continuing in offline mode; your answers are kept." and returns `null`.
PRD ref: `prd.md > Live and Offline Modes`.

### Local Server
`server/server.js`, `node:http`.
- `GET /` and static files from `public/` (fixed content types for `.html .css .js .woff2 .txt`, no directory listing, paths kept inside `public/`).
- `GET /api/mode` → `{ "mode": "live" | "offline" }` from whether `ANTHROPIC_API_KEY` is set.
- `POST /api/claude` → body `{ task, payload }`, max 16 KB. Unknown task → 400. No key → 503 `{ error: "offline" }`. Calls `claude.js` and returns `{ result }` or `{ error }`. Nothing is logged except the task name and status; answers are not written anywhere.
- Binds to `127.0.0.1`.
PRD ref: `prd.md > Live and Offline Modes`, `prd.md > States and Boundaries` (persistence boundary).

### Claude Tasks
`server/claude.js` with `server/prompts.js`. One SDK client; three task functions. Prompts are fixed on the server; the browser only sends data, never prompt text.
- **`followup`** (model `CLAUDE_MODEL_FAST`, `output_config.effort: "low"` if accepted, `max_tokens: 1024`): input `{ followupId }`, the server reads the fixed question and its reason from `questions.js`; returns `{ question }`. System prompt: reword the question for a calm, plain-English interview, keep its meaning and answer options, one sentence ending in "?", no numbers, no judgment of the building.
- **`flags`** (model `CLAUDE_MODEL_FAST`, effort `"low"` if accepted, `max_tokens: 1024`): input `{ text }`; returns `{ emergency: boolean, verdict_request: boolean }` via JSON schema. System prompt: emergency = someone is trapped, injured, or there is gas, fire or collapse happening now; verdict_request = the person asks whether the building is safe or for a rating.
- **`card`** (model `CLAUDE_MODEL_CARD`, effort `"medium"`, `max_tokens: 4096`): input = rule output's action ids, titles, variants and "why" lines; returns `{ actions: [{ id, explanation }] }` via JSON schema (`additionalProperties: false`, `id` an enum of the rule output's ids). System prompt: one or two plain sentences per action on what to do this week, in the given order, keep every id, add no actions, no numbers or quantities, never say whether a building is safe.
- Every response: check `stop_reason` first; `refusal`, `max_tokens` or unparseable output → `{ error }`. API errors (rate limit, 5xx, connection) → `{ error }`; the SDK's default 2 retries stay on.
PRD ref: `prd.md > Interview`, `prd.md > Emergency Stop`, `prd.md > Card`.

## Data Model
All in the browser. `localStorage` key `before-the-shake.v1`, one JSON object:

```json
{
  "mode": "live | offline",
  "step": "Q4",
  "answers": { "Q1": ["child_under_5", "older"], "Q2": "3_to_6", "F1": "yes", "Q11": "free text" },
  "flags": { "emergency": false, "verdict_request": false },
  "card": {
    "ruleOutput": {
      "actions": [ { "id": "A1", "variants": ["childs_room"], "why": ["child_first"], "sourceId": 1 } ],
      "engineer": [ "pre_2000", "removed_my_flat" ],
      "process": [ "law_6306_owner" ],
      "cannotJudge": [ "structure", "ground", "official_status" ]
    },
    "explanations": { "A1": "..." },
    "wording": "model | fixed",
    "ticks": { "A1": true }
  }
}
```

- **answers:** written on every chip tap; Back reads them to show the earlier choice. Kept on API failure.
- **step:** the current question, written on every move. Reopening the tab mid-interview resumes there (implementation detail derived from "keep the answers"; not a separate PRD behavior).
- **card:** written once when the card is built; `ticks` updated on each tick. Reopening the tab shows the card with its ticks.
- **Start over:** clears `answers`, `step`, `flags`, `card`, keeps nothing else. **Clear my answers:** removes the key entirely.
- Rule output stores ids only; display text always comes from the fixed content files, so a content fix applies to old cards too.
- Nothing is sent anywhere for saving. In live mode, the answers needed for a task are sent through the local server to the Claude API to produce wording; the Start screen and README say so (see Live-Mode Disclosure).

## File Structure

```
before-the-shake/
├── public/                  # everything the browser loads; also the static offline demo
│   ├── index.html           # one page, five <section> views
│   ├── styles.css           # colors, type, layout, print stylesheet
│   ├── app.js               # flow, screens, localStorage, askClaude()
│   ├── fonts/               # Source Serif 4 + Source Sans 3 woff2, OFL.txt
│   └── lib/
│       ├── questions.js     # Q1-Q11, F1-F3: text, chips (always "Not sure")
│       ├── rules.js         # followupsFor, questionSequence, buildCard
│       ├── content.js       # fixed wording: titles, explanations, why lines, engineer questions, panels
│       ├── sources.js       # numbered sources: org, title, URL, check date
│       ├── emergency.js     # hasEmergencyKeyword
│       └── validate.js      # checkCardText, checkFollowupText
├── server/
│   ├── server.js            # node:http: static files, /api/mode, /api/claude
│   ├── claude.js            # SDK client, three tasks, error handling
│   └── prompts.js           # system prompts + JSON schemas
├── test/
│   ├── rules.test.js        # demo pair A/B, facts never change order, A2 always, all "Not sure", F1-F3 conditions
│   ├── emergency.test.js    # phrases incl. "I smell gas"; no hit on "we have a gas stove", "fire extinguisher", "the room smells damp"
│   └── validate.test.js     # missing id, reordered ids, extra id, digit, blocked phrase, broken JSON
├── devpost/                 # scope.md, prd.md, spec.md (public); learner-profile.md (gitignored)
├── .env.example             # ANTHROPIC_API_KEY=, CLAUDE_MODEL_FAST=claude-haiku-5-5, CLAUDE_MODEL_CARD=claude-opus-5-5, PORT=3000
├── .gitignore
├── package.json             # "type": "module", exact @anthropic-ai/sdk version, scripts start/test
├── package-lock.json
├── skills-lock.json         # from the official skill pack install
├── LICENSE                  # MIT
└── README.md                # what it is, what it is not, run steps, modes, sources
```

## External Services and Dependencies

### Claude API
- Endpoint: `POST https://api.anthropic.com/v1/messages` via `@anthropic-ai/sdk` (`client.messages.create`). Docs: https://docs.claude.com/en/api/messages · structured outputs: https://docs.claude.com/en/docs/build-with-claude/structured-outputs
- Auth: `ANTHROPIC_API_KEY` from `.env`, read by the SDK on the server only.
- Models: `claude-haiku-5-5` (fast tasks), `claude-opus-5-5` (card); both overridable by env.
- Calls per interview: up to 3 `followup` + at most 1 `flags` + 1 `card`. Size: a few thousand tokens per interview, not measured yet. Measure during the build from `response.usage`; prices only from the official pricing page if quoted.
- Request shape (card): `{ model, max_tokens: 4096, system, messages: [{ role: "user", content: <rule output JSON> }], output_config: { effort: "medium", format: { type: "json_schema", schema } } }`. Response: `content[0].text` holds the JSON (verify against the SDK docs early).

### Sources Shown on the Card
Mapping confirmed by the learner in review. ECA page titles in the HTML are generic, so the step names are used as page titles.

| # | Organization, page | URL | Used by |
|---|---|---|---|
| 1 | Earthquake Country Alliance, Step 1: Secure your space | https://www.earthquakecountry.org/step1/ | A1 |
| 2 | Great ShakeOut, Drop, Cover, and Hold On | https://www.shakeout.org/dropcoverholdon/ | A2 |
| 3 | Earthquake Country Alliance, Step 3: Organize disaster supplies | https://www.earthquakecountry.org/step3/ | A3 |
| 4 | AFAD, Emergency assembly area lookup (e-Devlet, login required) | https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama | A4 |
| 5 | Earthquake Country Alliance, Step 2: Plan to be safe | https://www.earthquakecountry.org/step2/ | A5, A6 |
| 6 | Law No. 6306 on the Transformation of Areas under Disaster Risk, Article 3(1), as amended by Law 7471 (7 Nov 2023) | https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6306.pdf | Own-flat engineer line |
| — | App rule | (no link) | every "why" line and the order |

Law 6306 card line (learner-checked against the law text): "Under Turkey's Law 6306, building owners can have a risky-building assessment done, at their own cost, by an institution licensed by the Urban Transformation Presidency."

Check dates (2026-10-11): sources 1, 2, 3, 5 returned 200 from the dev server; source 4 checked by the learner (200, title "Afet ve Acil Durum Toplanma Alani Sorgulama"); source 6 read by the learner (article 3(1)). Re-check during the build only if a page changes.
- A6's fixed text carries, in the app's own words, ECA step 2's point: know where the gas, water and electricity shut-offs are, and turn off the gas only if you smell or hear a leak.

## Important Failure Modes
- **Claude slow, down, or no key** → offline mode with the notice; answers kept; the card still appears with fixed wording.
- **Model output broken, reordered, missing an action, or crossing the fence** (digit, blocked phrase, extra key) → `checkCardText` fails → fixed explanations, "Fixed wording" note. Same for a follow-up wording.
- **Model misses an emergency in free text** → the phrase check already caught the listed phrases in the browser; the model can only add, never clear.
- **Phrase check too loose or too tight** → negative tests ("we have a gas stove", "fire extinguisher", "the room smells damp") and positive tests ("I smell gas", "someone is trapped") in `test/emergency.test.js`.
- **Print cuts the card** → print stylesheet tested in the browser's print preview on A4 during the build.

## What Was Simplified and Why
- **Model writes only explanations** instead of the whole card — titles, order, tags and engineer questions are fixed text, so the check is a simple id-list comparison, not text matching. The fuller version would need fuzzy matching of free model text.
- **One HTML page with five views** instead of routed pages — five screens and one flow need no router.
- **Engineer questions and cannot-judge items are fixed text** instead of model-written — they are the closest thing to the honest line; keeping them fixed removes the verdict risk there.
- **No server storage, no accounts** — `localStorage` covers return visits on one browser (`prd.md > States and Boundaries`).
- **Fixed phrase list** instead of a classifier for emergencies — predictable and testable; phrase-level so "gas stove" or "fire extinguisher" do not trip it; the model is only an extra net.

## Decisions and Open Issues

### Learner decisions (4-spec)
- Stack as above, exact dependency versions — familiar, small, no build step.
- Two models from `.env`: `CLAUDE_MODEL_FAST=claude-haiku-5-5` for follow-ups and flags (runs on every step, speed matters), `CLAUDE_MODEL_CARD=claude-opus-5-5` for the card (the text people read and print).
- Optional public demo: offline only, static, after the local version works; hosting decided at the end of `5-build`.
- No prices in the spec unless checked on the official pricing page.

### The useful unknown: checking the model without a brittle check
The learner's question: how can the app check that the model kept every action and the exact order when the model rewords things, and what happens when its JSON is broken?
The learner's own idea, which the spec adopts: the model returns JSON keyed by action id, the app compares the id list with the rule output, and titles and tags always come from the app's fixed text, so the model only writes the explanation under each action.
Clarification: that is enough for order and completeness, because the comparison is on ids (exact strings the app chose), never on reworded text. Rewording can only affect the explanation, which gets its own small checks (length, no digits, no blocked phrases). Broken JSON has four forms, all handled the same way: the API call fails, `stop_reason` is `refusal` or `max_tokens`, the text does not parse, or it parses but fails the check. In every case the page uses the fixed explanations and says "Fixed wording". The JSON schema with an id enum makes most failures rare, but the app never relies on that. Evidence during the build: `test/validate.test.js` covers each failure form, and the build forces one live failure (for example a wrong model name in `.env`) to watch the fallback on screen.

### Implementation details derived from the decisions (agent)
- Effort levels: `low` for fast tasks, `medium` for the card. Timeouts 8 s and 30 s. Learner change C2: confirm in the build that `output_config.effort` is accepted by the Haiku model; if not, drop it for the fast tasks rather than fail.
- Mid-interview resume from `step` after reopening the tab.

### Learner decisions (review)
- Live-mode disclosure (T1), exact source 4 URL (T2), sources mapping and bundled fonts (T3), phrase-level emergency check (C1), effort check for the fast model (C2).

### Live-Mode Disclosure
Start screen, under the badge, in live mode, and the same sentence in README: "Live mode: some of your answers are sent to Claude, Anthropic's AI, to write the wording. This app saves nothing on a server."

### Open issues
- **Verify early in the build:** `output_config.format` shape in the pinned SDK; `output_config.effort` on the fast model (C2); `--env-file-if-exists` in Node 22.22. Result: `output_config.format` and `--env-file-if-exists` confirmed; C2 handled by a one-time retry without effort (see `checklist.md > Revisions`).
