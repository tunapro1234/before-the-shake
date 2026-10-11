---
doc: prd
status: approved
---

# Before the Shake — Product Requirements

A short, calm interview for adults living in Istanbul apartment blocks that ends in one honest preparedness card: what to do this week in order, what to ask a licensed engineer, and what the app cannot judge.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. On an uneasy evening (a tremor or drill in the news, or the week of a move), the person opens the app and sees the Start screen: what it is, what it is not, a live/offline badge, and a quiet "In an emergency, call 112" line. They press Start.
2. They answer about 10 questions, one per screen, by tapping answer chips. Every question has a "Not sure" chip. They can go Back. Progress reads like "4 of 11".
3. When an answer needs it, one of three fixed follow-up questions appears and says why: "Because you said there is a child under 5: ...".
4. Near the end there is one optional free-text box: "Anything else about your home?".
5. At any question they can tap "Can you tell me if my building is safe?". A short honest panel explains that only a licensed engineer can say, and the facts they gave are added to the engineer questions on the card. Then they continue.
6. If they tap "Something happening right now?" on any question screen, or the free text mentions an emergency (e.g. a smell of gas), the flow stops and the Emergency screen shows only "Call 112 now".
7. After the last question they get the Card: this week's actions in order with checkboxes and a source tag on each, questions for an engineer, and what this app cannot judge, plus a short sources list.
8. They tick actions as they do them, print the card, or start over. If they close the tab and come back, the card and ticks are still there in this browser.

Success: one person finishes in a few minutes and gets a card whose order fits their household, in live mode or in labeled offline mode.
It is a one-off rather than a daily habit; they might come back after a move or a change in the household.

## Screens and Layout
Single column that works on a phone. Five surfaces:

### Start Screen
- One sentence on what the app is and what it is not.
- Start button.
- Small badge: "Live" or "Offline mode".
- Quiet footer line: "In an emergency, call 112".

### Question Screen
- One question per screen.
- Answer chips, always including "Not sure". No free typing at each step, on purpose: it keeps the flow calm and predictable.
- Back button.
- Progress: "N of M", where M counts base questions plus the follow-ups that apply; when a follow-up adds a screen, M grows and the follow-up's "Because you said" line explains why.
- Follow-up questions carry a one-line reason: "Because you said ...".
- Link on every question screen: "Can you tell me if my building is safe?".
- Small fixed link on every question screen: "Something happening right now?", which opens the Emergency screen.
- Near the end: one optional free-text box, "Anything else about your home?".

### Honest Panel
- Opens from the "Can you tell me if my building is safe?" link, and also when the free text asks for a verdict.
- Says briefly and plainly that only a licensed engineer with a proper assessment can say whether a building is safe.
- Shows that the building facts the person gave will be turned into engineer questions on the card.
- Closes back to the same question.

### Emergency Screen
- Shown from the "Something happening right now?" link, or when the free text trips the emergency check (see Emergency Stop).
- Shows only "Call 112 now" and "Back to the questions". Nothing else.
- The only place red is used.

### Card Screen
- Section 1, "This week": actions in priority order, each with a checkbox and a source tag.
- Section 2, "Questions for an engineer": questions for a licensed engineer, built from the building facts given. Below them, a small subheading "The official process" holds the Law 6306 line (owners) or the "ask the owner or building manager" line (renters).
- Section 3, "What this app cannot judge".
- Print button, Start over button, "Clear my answers" button.
- Short sources list at the bottom.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.
- Like a printed note on a fridge: off-white paper background, dark ink text, one calm accent color, large type.
- Single column, works on a phone.
- Calm, not scary. Plain words, "like a friend who studies civil engineering sitting next to you and asking good questions".
- Red only on the Emergency screen. No stock illustrations, no gradients.
- The card prints cleanly.
- Type: a plain, sturdy book serif for headings and a clean, readable sans for body text. Not handwritten (hard to read under stress), not typewriter (costume-y).
- Accent: a deep ink teal, around `#1F5F5B`, for buttons, checkboxes and links.
- Reference: a well-printed municipal checklist or a library card. Quiet, practical, nothing decorative.

## Features and Behavior

### Interview
Source: `scope.md > The Unique Kernel`, `scope.md > The POC Boundary`.
- The questions and the rules are fixed in the app. Every question also has a "Not sure" chip.

| # | Question | Chips |
|---|---|---|
| Q1 | Who lives with you? (multi) | Only adults / A child under 5 / Someone older or who needs help moving / A pet |
| Q2 | Which floor is your flat on? | Ground to 2nd / 3rd to 6th / 7th or higher |
| Q3 | Is there heavy furniture (wardrobe, bookshelf, tall cabinet) in a bedroom that is not fixed to the wall? | Yes, not fixed / It is fixed / No heavy furniture there |
| Q4 | Do you have an emergency bag ready? | Yes / Partly / No |
| Q5 | Do you know your nearest assembly area? | Yes / No |
| Q6 | Does your household have a plan: where to meet and one contact outside the city? | Yes / Partly / No |
| Q7 | Do you know how to shut off gas, water and electricity at home? | Yes / No |
| Q8 | Roughly when was your building built? | Before 2000 / 2000-2018 / After 2018 |
| Q9 | Have you noticed any of these? (multi) | Cracks in columns or beams / A wall or column removed in a renovation (also in shops on the ground floor) / Rust or exposed steel in concrete / None of these |
| Q10 | Do you own or rent? | Own / Rent |
| Q11 | Anything else about your home? (optional free text) | — |

**Follow-up questions** (fixed in the rules; each also has "Not sure"):

| # | Asked when | Question | Chips | Effect |
|---|---|---|---|---|
| F1 | Q1 has "A child under 5" and Q3 is "Yes, not fixed" or "Not sure" | "Because you said there is a child under 5: does the child sleep in a room with that furniture?" | Yes / No | Yes or Not sure: A1 says "start with the child's room". |
| F2 | Q1 has "Someone older or who needs help moving" | "Because you said someone at home needs help moving: who would help them get out?" | Someone at home / A neighbour / Nobody yet | Nobody yet or Not sure: the A5 helper line becomes one sentence, "agree on one person who helps and on the way out; if nobody at home can help, ask a neighbour". |
| F3 | Q9 has "A wall or column removed" | "Because you said a wall or column was removed: where was it?" | In my flat / In a shop or another flat | Only changes the wording of the engineer question, never the actions. |

- Which questions and follow-ups are asked, and in what order, is fixed by the rules. In live mode the model only words the follow-ups; offline mode uses fixed wording.
- The free-text answer is turned into known flags (an emergency, or a request for a verdict). Free text that matches no known flag never changes actions or order.
  - [ ] Every question and follow-up shows a "Not sure" chip.
  - [ ] Back returns to the previous question with the earlier answer kept.
  - [ ] Progress shows "N of M", with M counting base questions plus applicable follow-ups.
  - [ ] Each follow-up appears only under its condition and starts with "Because you said ...".

### Priority Rules
Source: `scope.md > The POC Boundary`, `scope.md > Explicitly Cut`.
- The order of "This week" comes only from fixed rules written by the team. The model never decides the order.
- The card says the order is a suggestion from simple rules in this app, not an official ranking.

**Actions, in default order, with the condition that puts each on the card:**

| # | Action | On the card when |
|---|---|---|
| A1 | Fix heavy furniture to the wall | Q3 is "Yes, not fixed" or "Not sure" |
| A2 | Practice Drop, Cover, Hold On with everyone at home | Always |
| A3 | Pack or complete the emergency bag | Q4 is Partly, No or Not sure |
| A4 | Look up your assembly area | Q5 is No or Not sure |
| A5 | Make the household plan | Q6 is Partly, No or Not sure |
| A6 | Learn the gas, water and electricity shut-offs | Q7 is No or Not sure |

**Modifiers** (simple points; ties keep the default order; every move shows "why: because you said ..."):
- Child under 5: A1 stays at the top if furniture is not fixed (children sleep in those rooms); with F1 Yes or Not sure, A1 says "start with the child's room". A3 gets child items (diapers, food, medicine).
- Someone older or who needs help moving: A5 moves to second place (right after A1, or first if A1 is not on the card) and includes "who helps whom and the way out". If the floor is 3rd or higher too, A5 says "plan the stairs route, never the lift". F2 Nobody yet or Not sure: the helper line and the neighbour line merge into one sentence.
- Pet: A3 gets pet food and a leash.
- If A5 is not on the card (Q6 Yes), the older-person rule has nothing to move.

**Building facts never change actions or order.** Q8, Q9 and Q10 only produce engineer questions:

| Answer | Engineer question or line |
|---|---|
| Q8 Before 2000 | "Which seismic code was the building designed under, and has it ever had a performance assessment?" |
| Q9 Wall or column removed | "Was the renovation checked by an engineer, and was the removed element load-bearing?" (F3 adjusts the wording to where it was) |
| Q9 Cracks in columns or beams | "Are these cracks structural? Can you inspect them?" |
| Q9 Rust or exposed steel | "Is there corrosion in the reinforcement?" |
| Q10 Own | One line explaining the official risky-building process under Law 6306 (owners apply). Wording checked against the law text in `4-spec`. |
| Q10 Rent | "Ask the owner or building manager whether an assessment was done." |
| No building facts given | General engineer questions. |

  - [ ] Two different households get a visibly different card (which actions appear, their order, or their contents), each change with a "why: because you said ..." line.
  - [ ] Demo pair. Household A (adults only, furniture fixed, bag partly): no A1 on the card. Household B (child under 5 and an older person, 4th floor, furniture not fixed, F1 Yes, household plan No): A1 first with "start with the child's room", A5 second with the stairs line.
  - [ ] The same answers always give the same order, in live and offline mode.
  - [ ] Changing only Q8, Q9 or Q10 never changes the actions or their order, only the engineer section.
  - [ ] A2 is always on the card.

### Source Tags
Source: `scope.md > The Unique Kernel` ("each with a source tag").
- A tag is a short numbered label, e.g. "[2] Earthquake Country Alliance, Step 1: Secure your space". Tapping it jumps to the sources list.
- The sources list shows organization, page title, URL and the date the team checked it.
- Order explanations ("why: because you said ...") carry the tag "App rule": the app's own logic, not an official source.
- All wording is the team's own sentences; no copied official text.
- Candidate sources (checked by the learner on 2026-10-11): earthquakecountry.org/sevensteps (and steps 1-3), shakeout.org/dropcoverholdon, the AFAD services page on turkiye.gov.tr (assembly-area lookup listed there; needs e-Devlet login), Law 6306 on mevzuat.gov.tr, afad.gov.tr. The final list is fixed in `4-spec`.
  - [ ] Every action shows a numbered tag that leads to an entry in the sources list.
  - [ ] Every sources-list entry shows organization, page title, URL and check date.
  - [ ] Every order change is tagged "App rule".

### Honest Redirect
Source: `scope.md > The Unique Kernel` ("oh, that's cool" moment).
- The app never says a building is safe or unsafe, and shows no score or risk percentage.
- The panel lists the building facts given so far as plain sentences ("Built before 2000", "A wall or column was removed in your flat").
- Asking "is my building safe?" (link or free text) opens the Honest Panel and turns the given building facts (year range, visible cracks, a removed wall) into two or three concrete engineer questions.
  - [ ] Tapping the link on any question screen opens the panel; closing it returns to the same question.
  - [ ] After the person gave building facts, the card's engineer section contains questions that mention those facts.
  - [ ] Free text asking for a verdict opens the panel instead of producing a verdict.
  - [ ] No screen shows a safety verdict, a score or a percentage.

### Emergency Stop
Source: `scope.md > The POC Boundary`.
- No answer chip mentions an emergency, on purpose: this is a preparedness tool.
- Two ways in: the small "Something happening right now?" link on every question screen, and the free text.
- Free text goes through a fixed keyword check (gas, smell, trapped, injured, bleeding, fire, collapse, plus the same in Turkish) in both modes, and the check always wins. In live mode the model can also raise the emergency flag, but it can never clear one.
- The screen shows only "Call 112 now" and "Back to the questions". 112 is the only number shown anywhere in the app.
  - [ ] Tapping "Something happening right now?" on any question screen shows the Emergency screen immediately.
  - [ ] Typing "I smell gas" in the free-text box shows the Emergency screen, in live and offline mode.
  - [ ] A keyword match shows the Emergency screen even if the model says there is no emergency.
  - [ ] No phone number other than 112 appears.

### Card
Source: `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`.
- Three sections as in Card Screen. In live mode the model writes the card in plain language from the rule output; it adds no actions, numbers or order of its own.
- In live mode the app checks that the model's text keeps every action and the exact order; if not, it uses the fixed wording (details in `4-spec`).
- Checkboxes can be ticked as the person does things.
- Print, Start over, Clear my answers.
  - [ ] The card has exactly three sections in the stated order, plus a sources list.
  - [ ] Every action in "This week" shows a source tag.
  - [ ] Print aims for one A4 page and prints on A4 with nothing cut off (smaller base size and small-type sources in print).
  - [ ] If the live text drops an action or changes the order, the card shows the fixed wording instead.
  - [ ] Ticks survive closing and reopening the tab in the same browser.
  - [ ] "Clear my answers" removes the answers, card and ticks from this browser.

### Live and Offline Modes
Source: `scope.md > What "Working" Looks Like`.
- Live mode: Claude writes follow-up wording, reads the free text into flags and writes the card.
- Offline mode, when there is no API key: the same flow and the same order, with fixed wording. A visible "Offline mode" label.
- If the API fails mid-way, the app switches to offline mode with a visible notice and keeps the answers.
  - [ ] With no API key, the whole flow runs and the badge says "Offline mode".
  - [ ] Simulating an API failure mid-interview shows a notice, keeps earlier answers and continues offline.

## States and Boundaries
- **First use** — Start screen; nothing saved yet.
- **All "Not sure"** — still gives a useful card: general actions in the default order and general engineer questions.
- **No building facts given** — the engineer section holds general questions, not fact-based ones.
- **Verdict request in free text** — opens the Honest Panel.
- **Emergency (link or free text)** — flow stops on the Emergency screen; the person can come back later.
- **API failure mid-way** — switch to offline mode with a notice; answers kept.
- **Returning visit** — card and ticks are still there in this browser only.
- **Shared device** — "Clear my answers" removes everything from this browser.
- **Persistence boundary** — nothing is sent to or stored on a server for saving. No address, no account.

## Product Decisions
- Chips plus "Not sure" instead of free typing at each step — keeps it calm and predictable; one optional free-text box near the end.
- Order comes from fixed rules, never from the model — the order must be predictable and checkable.
- Follow-ups explain themselves ("Because you said ...") — the person sees why the card is personal. Three fixed follow-ups; the model only words them.
- Building facts never change actions or order — they only become engineer questions; the app does not judge the building.
- No emergency chip; a fixed "Something happening right now?" link instead — this is a preparedness tool, but help is always one tap away.
- Fixed keyword check always wins over the model; the model can raise the emergency flag, never clear it — safety must not depend on the model.
- The verdict question is always one tap away and always answered honestly — the honest line is the point of the app.
- Emergency shows only "Call 112 now" — nothing else competes for attention.
- Card and ticks stay in this browser; "Clear my answers" for shared devices — household answers are personal.
- API failure falls back to offline mode and keeps answers — the person never loses their progress.

## What We're Building
- Start, Question, Honest Panel, Emergency and Card screens as described.
- About 10 fixed questions with chips, rule-triggered follow-ups, one optional free-text box.
- Fixed priority rules with a source tag on every action.
- Honest redirect turning building facts into engineer questions.
- Emergency stop showing only 112: a link on every question screen and a fixed keyword check on free text.
- Card with checkboxes, Print, Start over, Clear my answers, saved in this browser.
- Live mode and labeled offline mode, with fallback on API failure.
- English UI.

## Deferred From the POC
- Turkish UI — English for this proof of concept.
- Address-based hazard lookup — would mean revisiting the no-address rule.
- Photo crack analysis — far beyond the proof and close to a structural verdict.
- Building-wide plan for neighbors — needs sharing between people.
- Reminders — need notifications or an account.
- Accounts — would mean revisiting the no-account rule.

## Possible Later Enhancements
- Turkish UI as the main audience's language.
- A shared plan the people in one building can fill together.

## Non-Goals
- Any structural safety verdict, score or risk percentage — only a licensed engineer with a proper assessment can say.
- Model-chosen priorities — the order must be predictable and checkable.
- Storing answers on a server — answers about a household are personal; the card stays in the browser and can be printed.
- Phone numbers other than 112.
- Collecting an address or creating accounts.

## Open Questions
- **Final source list** — fixed in `4-spec` from the candidates above.
- **Law 6306 line wording** — checked against the law text in `4-spec`.

### Resolved in review
- Follow-up questions — three fixed follow-ups F1-F3 (see Interview).
- Emergency path — no emergency chip; "Something happening right now?" link plus a fixed keyword check on free text.
- Demo difference — criterion is "visibly different card"; demo pair A/B written under Priority Rules.
- Honest Panel closes back to the same question — confirmed.
- Free text matching no known flag never changes actions or order — confirmed.
- Print — one A4 page, nothing cut off.
- Reasons for Deferred items and Possible Later Enhancements — confirmed.
