---
doc: scope
status: approved
---

> Note, added after approval: in this project, "the learner" means the answers an AI agent gave on Tuna's behalf, based on Tuna's background. The agent also gave the approvals recorded here. See "How this was built" in the README.

# Before the Shake

A short interview for people in Istanbul apartments that ends in one honest preparedness card: what to do this week, what to ask an engineer, and what the app cannot judge.

## The Unique Kernel
The app asks and the person answers. About 8-12 questions turn into ONE card with three parts:
1. This week's actions in priority order, each with a source tag.
2. Questions to ask a licensed engineer or the official risky-building process.
3. What the app cannot judge.

What makes it different, in the learner's words: static checklists give everyone the same 30 items with the same weight, so people read them and do nothing; hazard maps tell you about the ground, not what to do tonight. This gives an order for your household ("first this, then this") and turns what you can observe about your building into concrete questions for an expert, instead of pretending to judge the building. Without it you miss "what first, for us" and "what exactly do I ask the expert".

The follow-ups carry it: a baby, an elderly parent or heavy bookshelves in the bedroom change the next question and the order of the card. And the app is openly honest about where its knowledge stops: only a licensed engineer with a proper assessment can say whether a building is safe.

The "oh, that's cool" moment: the person asks "is my building safe?" and the app does not judge. Instead it turns what they told it (year range, visible cracks, a removed wall) into two or three concrete questions for an engineer. The card appearing right after is the payoff.

## Who It's For
Adults living in apartment buildings in Istanbul, renters and owners. Pictured: someone in their 20s-40s renting or owning a flat in an older apartment block. They hear "is my building safe?" and have no clear, personal list of what they can do now. The learner's evidence is an Istanbul Statistics Office survey (Nov 2020, n=769, reported by bianet): 72.1% had no emergency bag and 52.6% did not know their assembly area.
Source: https://bianet.org/haber/istanbullularin-yuzde-72-sinin-deprem-cantasi-yok-234374
Not tested with users yet.

## The Core Loop
The moment: an ordinary evening when a small tremor or an earthquake drill is in the news, they feel uneasy and think "I should do something" but don't know where to start. Or the week they move into a new flat.
They open the app, answer about 10 questions one at a time (household, home preparedness, building facts they can observe), see a follow-up appear when an answer needs it, and get the card. One sitting, a few minutes. It is a one-off rather than a daily habit; they might come back after a move or a change in the household.

## Inspiration & Identity
Calm, not scary: one question at a time, big readable text, plain words, "like a friend who studies civil engineering sitting next to you and asking good questions". No alarm colors except the emergency band. The result is one card you could print and stick on the fridge.

## Why This Matters to the Learner
"I live in Istanbul and study civil engineering. Istanbul is expected to face a major earthquake; when people hear 'is my building safe?' the honest answer is that only a licensed engineer with a proper assessment can say. But there are things a household can do this week, and most people never get a clear, personal list. I want a tool that is honest about that line."
Learning goal: keeping an LLM inside hard safety boundaries while it is still useful.

## What "Working" Looks Like
Someone runs it locally (one command, README) or opens an optional static demo in offline mode. They answer about 10 questions, see a follow-up appear when an answer needs it, and get the card with its three parts. Two modes:
- Live mode, with Claude running the interview and writing the card in plain language.
- Offline mode with no API key, same flow, with a visible "offline mode" label.

Proof in the video:
- Two different households get different orders.
- Asking "is my building safe?" gets an honest redirect, not a verdict.
- An emergency answer (e.g. smell of gas) stops the flow and shows 112.
- With no API key the same flow runs, labeled "offline mode".

## The POC Boundary
In:
- One interview flow (about 8-12 questions) and one card with the three parts above.
- Priorities from deterministic rules written by the team, each action carrying a source tag. The model only asks follow-ups and writes plain language.
- Emergency answers (trapped, injured, gas smell) stop the flow and show 112, and only 112.
- Live mode and a labeled offline mode.
- English UI.
- No address, no account, nothing stored on a server.

## Later
- Turkish UI.
- Address-based hazard lookup (would mean revisiting the no-address rule).
- Photo crack analysis.
- Building-wide plan for neighbors.
- Reminders.
- Accounts (would mean revisiting the no-account rule).

## Explicitly Cut
- Structural safety verdict of any kind: only a licensed engineer with a proper assessment can say it.
- Score or risk percentage: it would read as a verdict.
- Model-chosen priorities: the order must be predictable and checkable, so rules decide it.
- Storing answers on a server: answers about a household are personal; the card stays in the browser and can be printed.
