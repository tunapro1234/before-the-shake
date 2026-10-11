# Before the Shake

It is an evening in Istanbul. A small tremor is in the news, and someone in a flat in an older apartment block thinks: I should do something. Then: is my building even safe?

Before the Shake asks them about ten short questions, one per screen, and gives back one card they can print and put on the fridge:

1. **This week:** what to do first for this household, in order, each step with a source.
2. **Questions for an engineer:** what they told the app about the building (a year range, cracks, a removed wall), turned into questions a licensed engineer can answer.
3. **What this app cannot judge.**

A household with a small child and a parent who needs help on the stairs gets a different order than two adults in a ground-floor flat. Each change says why ("Because you said ...").

A survey by the Istanbul Metropolitan Municipality's statistics office (November 2020, 769 people, [reported by bianet](https://bianet.org/haber/istanbullularin-yuzde-72-sinin-deprem-cantasi-yok-234374)) found that 72.1% had no emergency bag and 52.6% did not know their assembly area. The card starts there. We have not tested the app with users yet.

## What it does not do

It never says whether a building is safe. It gives no score and no percentage. Only a licensed engineer with a proper assessment can judge a building, and the app says so whenever someone asks, through the "Can you tell me if my building is safe?" link on every question or in the free-text box.

If someone types that they smell gas, or that someone is trapped or injured (in English or Turkish), the interview stops and the screen shows one thing: **Call 112 now**. 112 is the only phone number in the app.

It asks for no address and no account. Answers and the card stay in this browser (`localStorage`); "Clear my answers" removes them.

## Run it

Needs Node 22 or newer.

```
npm ci
npm start
```

Open http://localhost:3000. Use `PORT=4000 npm start` if port 3000 is taken. The server listens on `127.0.0.1` only.

Run the tests with `npm test`.

## Offline mode and live mode

Without an API key the app runs in **offline mode**: the same questions, the same rules and the same card, with fixed wording written by us. The Start screen shows an "Offline mode" label.

**How to run live:** copy `.env.example` to `.env` and put your Anthropic API key in `ANTHROPIC_API_KEY`, then `npm start`. The Start screen then says:

> Live mode: some of your answers are sent to Claude, Anthropic's AI, to write the wording. This app saves nothing on a server.

In live mode Claude rewords the follow-up questions (`CLAUDE_MODEL_FAST`, default `claude-haiku-5-5`), reads the free-text note for an emergency or a request for a verdict, and writes the explanation under each action on the card (`CLAUDE_MODEL_CARD`, default `claude-opus-5-5`).

If the connection fails, the app switches to offline mode, says so, and keeps every answer.

## How Claude is kept inside the lines

- **The rules decide, Claude words.** Which actions go on the card and in what order comes from fixed rules in `public/lib/rules.js`. Claude never sees the person's raw answers for the card, only the titles and lines the rules already chose.
- **The answer is checked before it is shown.** Claude returns JSON keyed by action id (`public/lib/validate.js`). The ids must match the rule output exactly, in the same order. Each explanation must be short, contain no digits or `%`, and avoid phrases like "building is safe" or "risk score". Reassurance counts too: "should be fine", "hold up", "solid", "sturdy" and "nothing to worry" are refused ("a sturdy table" for Drop, Cover, Hold On is allowed). Titles, sources and engineer questions always come from the app's own text.
- **Any failure falls back to fixed wording.** An API error, a refusal or `max_tokens` stop, text that does not parse, or JSON that fails the check: in all four cases the card shows the fixed explanations and a "Fixed wording" note.
- **The emergency check does not depend on the model.** A fixed phrase check (`public/lib/emergency.js`) runs in the browser first. Claude can add an emergency flag, never clear one.

`test/claude.test.js` runs all four failure forms and a good response against a stubbed SDK client, so the tests need no key.

## Sources on the card

1. Earthquake Country Alliance, Step 1: Secure your space. https://www.earthquakecountry.org/step1/
2. Great ShakeOut, Drop, Cover, and Hold On. https://www.shakeout.org/dropcoverholdon/
3. Earthquake Country Alliance, Step 3: Organize disaster supplies. https://www.earthquakecountry.org/step3/
4. AFAD, Emergency assembly area lookup (e-Devlet, login required). https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama
5. Earthquake Country Alliance, Step 2: Plan to be safe. https://www.earthquakecountry.org/step2/
6. Law No. 6306 on the Transformation of Areas under Disaster Risk. https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6306.pdf

All checked on 2026-10-11. The order of the actions and the "Because you said" lines are the app's own rules, tagged "App rule" on the card, not an official ranking.

## How this was built

Built with Claude Code running the Devpost Learn skill pack for the Build With AI: Basics hackathon. The planning documents are in `devpost/`: `scope.md`, `prd.md`, `spec.md` and the build `checklist.md`. An AI agent answered the planning interviews on my behalf, based on my background.

## License

Code: MIT, see `LICENSE`. Fonts: Source Serif 4 and Source Sans 3 by Adobe, SIL Open Font License 1.1, see `public/fonts/*/OFL.txt`.
