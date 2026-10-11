// Screens and flow. The rules module decides the card; this file only shows it.

import { getQuestion } from './lib/questions.js';
import { questionSequence, buildCard, buildingFacts } from './lib/rules.js';
import { hasEmergencyKeyword, asksForVerdict } from './lib/emergency.js';
import {
  ACTIONS, VARIANTS, WHY, ENGINEER, PROCESS, PROCESS_TITLE, PROCESS_SOURCE, FACTS, CANNOT_JUDGE, START, ORDER_NOTE,
  HONEST_PANEL, EMERGENCY,
} from './lib/content.js';
import { SOURCES, APP_RULE, tagLabel } from './lib/sources.js';
import * as storage from './lib/storage.js';

// localStorage can throw on access (blocked site data); then nothing is kept.
const store = (() => {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem() {}, removeItem() {} };
  }
})();

let state = storage.emptyState();
let verdictShownFor = null;

const persist = () => storage.save(store, state);

// ---------- small DOM helpers ----------

const $ = (id) => document.getElementById(id);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function show(viewId) {
  $('panel').hidden = true;
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== viewId;
  window.scrollTo(0, 0);
}

// ---------- mode ----------

async function detectMode() {
  try {
    const res = await fetch('/api/mode', { cache: 'no-store' });
    if (!res.ok) return 'offline';
    const body = await res.json();
    return body.mode === 'live' ? 'live' : 'offline';
  } catch {
    return 'offline';
  }
}

function renderBadge() {
  $('mode-badge').textContent = state.mode === 'live' ? 'Live' : 'Offline mode';
  $('mode-badge').dataset.mode = state.mode;
}

// ---------- start ----------

function renderStart() {
  renderBadge();
  $('start-title').textContent = START.title;
  $('start-lead').textContent = START.lead;
  $('start-not').textContent = START.notThis;
  $('start-emergency').textContent = START.emergencyLine;
  show('view-start');
}

// ---------- questions ----------

function sequence() {
  return questionSequence(state.answers);
}

function goTo(id) {
  state.step = id;
  persist();
  renderQuestion();
}

function next() {
  const seq = sequence();
  const i = seq.indexOf(state.step);
  if (i < seq.length - 1) goTo(seq[i + 1]);
  else finish();
}

function back() {
  const seq = sequence();
  const i = seq.indexOf(state.step);
  if (i <= 0) {
    state.step = null;
    persist();
    renderStart();
  } else {
    goTo(seq[i - 1]);
  }
}

function toggleMulti(q, chipId) {
  let picked = new Set(state.answers[q.id] || []);
  if (picked.has(chipId)) picked.delete(chipId);
  else if ((q.exclusive || []).includes(chipId)) picked = new Set([chipId]);
  else {
    for (const ex of q.exclusive || []) picked.delete(ex);
    picked.add(chipId);
  }
  state.answers[q.id] = [...picked];
  persist();
}

function renderQuestion() {
  const q = getQuestion(state.step);
  const seq = sequence();
  $('view-question').dataset.step = q.id;
  $('q-progress').textContent = `${seq.indexOf(q.id) + 1} of ${seq.length}`;
  $('q-reason').hidden = !q.reason;
  $('q-reason').textContent = q.reason || '';
  $('q-text').textContent = q.text;
  $('q-hint').hidden = !q.hint;
  $('q-hint').textContent = q.hint || '';

  const chips = $('q-chips');
  chips.replaceChildren();
  const free = $('q-free');
  free.hidden = !q.freeText;
  $('q-next').hidden = !(q.multi || q.freeText);

  if (q.freeText) {
    free.value = state.answers[q.id] || '';
    $('q-next').textContent = 'Make my card';
  } else {
    $('q-next').textContent = 'Next';
    const current = state.answers[q.id];
    for (const chip of q.chips) {
      const pressed = q.multi ? (current || []).includes(chip.id) : current === chip.id;
      chips.append(
        el(
          'button',
          {
            type: 'button',
            class: 'chip',
            'data-chip': chip.id,
            'aria-pressed': String(pressed),
            onclick: () => {
              if (q.multi) {
                toggleMulti(q, chip.id);
                renderQuestion();
              } else {
                state.answers[q.id] = chip.id;
                next();
              }
            },
          },
          chip.label,
        ),
      );
    }
    if (q.multi) $('q-next').disabled = !(current && current.length);
  }
  if (q.freeText) $('q-next').disabled = false;
  show('view-question');
}

function onNextClick() {
  const q = getQuestion(state.step);
  if (q.freeText) {
    const text = $('q-free').value.trim();
    state.answers[q.id] = text;
    if (hasEmergencyKeyword(text)) {
      state.flags.emergency = true;
      persist();
      showEmergency();
      return;
    }
    if (asksForVerdict(text) && verdictShownFor !== text) {
      state.flags.verdict_request = true;
      verdictShownFor = text;
      persist();
      openPanel();
      return;
    }
  }
  next();
}

// ---------- honest panel ----------

function openPanel() {
  const facts = buildingFacts(state.answers);
  $('panel-title').textContent = HONEST_PANEL.title;
  $('panel-body').textContent = HONEST_PANEL.body;
  $('panel-facts-lead').textContent = facts.length ? HONEST_PANEL.factsLead : HONEST_PANEL.noFacts;
  $('panel-facts').replaceChildren(...facts.map((f) => el('li', {}, FACTS[f])));
  $('panel-facts').hidden = !facts.length;
  $('panel-close').textContent = HONEST_PANEL.close;
  $('panel').hidden = false;
  $('panel-close').focus();
}

function closePanel() {
  $('panel').hidden = true;
  renderQuestion();
}

// ---------- emergency ----------

function showEmergency() {
  $('emergency-call').textContent = EMERGENCY.title;
  $('emergency-back').textContent = EMERGENCY.back;
  show('view-emergency');
}

function leaveEmergency() {
  if (state.step) renderQuestion();
  else renderStart();
}

// ---------- card ----------

function finish() {
  state.card = { ruleOutput: buildCard(state.answers), explanations: {}, wording: 'fixed', ticks: {} };
  persist();
  renderCard();
}

function tagLink(n) {
  return el('a', { class: 'tag', href: `#source-${n}` }, tagLabel(n));
}

function renderCard() {
  const { ruleOutput } = state.card;
  const card = $('card');
  card.replaceChildren(
    el('h1', {}, 'Your card'),
    el('p', { class: 'quiet' }, START.emergencyLine),

    el('h2', {}, 'This week'),
    el('p', { class: 'note' }, ORDER_NOTE),
    el(
      'ol',
      { class: 'actions' },
      ruleOutput.actions.map((a) => {
        const def = ACTIONS[a.id];
        const explanation = state.card.explanations[a.id] || def.explanation;
        return el(
          'li',
          { 'data-action': a.id },
          el(
            'label',
            { class: 'action-title' },
            el('input', {
              type: 'checkbox',
              'data-tick': a.id,
              checked: state.card.ticks[a.id] === true,
              onchange: (e) => {
                state.card.ticks[a.id] = e.target.checked;
                persist();
              },
            }),
            ' ',
            def.title,
          ),
          el('p', {}, explanation),
          a.variants.map((v) => el('p', { class: 'variant', 'data-variant': v }, VARIANTS[v])),
          a.why.map((w) => el('p', { class: 'why', 'data-why': w }, WHY[w], ' ', el('span', { class: 'tag' }, `[${APP_RULE}]`))),
          el('p', { class: 'source' }, tagLink(def.source)),
        );
      }),
    ),

    el('h2', {}, 'Questions for an engineer'),
    el(
      'ul',
      { class: 'engineer' },
      ruleOutput.engineer.map((id) => el('li', { 'data-engineer': id }, ENGINEER[id])),
    ),
    ruleOutput.process.length
      ? [
          el('h3', {}, PROCESS_TITLE),
          ruleOutput.process.map((id) =>
            el('p', { class: 'process', 'data-process': id }, PROCESS[id], PROCESS_SOURCE[id] ? [' ', tagLink(PROCESS_SOURCE[id])] : null),
          ),
        ]
      : null,

    el('h2', {}, 'What this app cannot judge'),
    el('ul', { class: 'cannot' }, CANNOT_JUDGE.map((t) => el('li', {}, t))),

    el('h2', { class: 'sources-title' }, 'Sources'),
    el(
      'ol',
      { class: 'sources' },
      SOURCES.map((s) =>
        el('li', { id: `source-${s.n}`, value: s.n }, `${s.org}, ${s.title}. `, el('a', { href: s.url, rel: 'noopener' }, s.url), `. Checked ${s.checked}.`),
      ),
    ),
    el('p', { class: 'note' }, `${APP_RULE}: the order and the "because you said" lines come from this app's own logic, not from an official source.`),
  );
  $('card-buttons').replaceChildren(
    el('button', { type: 'button', class: 'primary', id: 'card-print', onclick: () => window.print() }, 'Print'),
    el('button', { type: 'button', id: 'card-start-over', onclick: startOver }, 'Start over'),
    el('button', { type: 'button', id: 'card-clear', onclick: clearAnswers }, 'Clear my answers'),
  );
  show('view-card');
}

function startOver() {
  state = storage.startOver(store, state);
  verdictShownFor = null;
  renderStart();
}

function clearAnswers() {
  state = storage.clear(store, state.mode);
  verdictShownFor = null;
  renderStart();
}

// ---------- start up ----------

async function init() {
  $('start-button').addEventListener('click', () => goTo(sequence()[0]));
  $('q-back').addEventListener('click', back);
  $('q-next').addEventListener('click', onNextClick);
  $('q-safe').addEventListener('click', openPanel);
  $('q-now').addEventListener('click', showEmergency);
  $('panel-close').addEventListener('click', closePanel);
  $('emergency-back').addEventListener('click', leaveEmergency);
  $('q-free').addEventListener('input', (e) => {
    state.answers[state.step] = e.target.value;
    persist();
  });

  const saved = storage.load(store);
  if (saved) state = saved;
  state.mode = await detectMode();
  if (saved) persist();
  // A return visit opens where the person left off: the card, or the same question.
  if (state.card) renderCard();
  else if (state.step && questionSequence(state.answers).includes(state.step)) renderQuestion();
  else renderStart();
}

init();
