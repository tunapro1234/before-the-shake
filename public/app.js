// Screens and flow. The rules module decides the card; this file only shows it.

import { getQuestion } from './lib/questions.js';
import { questionSequence, buildCard } from './lib/rules.js';
import { ACTIONS, VARIANTS, WHY, ENGINEER, ENGINEER_SOURCE, CANNOT_JUDGE, START, ORDER_NOTE } from './lib/content.js';
import { SOURCES, APP_RULE, tagLabel } from './lib/sources.js';

const state = {
  mode: 'offline',
  step: null,
  answers: {},
  card: null,
};

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
}

function renderQuestion() {
  const q = getQuestion(state.step);
  const seq = sequence();
  $('view-question').dataset.step = q.id;
  $('q-progress').textContent = `${seq.indexOf(q.id) + 1} of about 10`;
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
  if (q.freeText) state.answers[q.id] = $('q-free').value.trim();
  next();
}

// ---------- card ----------

function finish() {
  state.card = { ruleOutput: buildCard(state.answers), explanations: {}, wording: 'fixed' };
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
          el('label', { class: 'action-title' }, el('input', { type: 'checkbox', 'data-tick': a.id }), ' ', def.title),
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
      ruleOutput.engineer.map((id) =>
        el('li', { 'data-engineer': id }, ENGINEER[id], ENGINEER_SOURCE[id] ? [' ', tagLink(ENGINEER_SOURCE[id])] : null),
      ),
    ),

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
  show('view-card');
}

// ---------- start up ----------

async function init() {
  $('start-button').addEventListener('click', () => goTo(sequence()[0]));
  $('q-back').addEventListener('click', back);
  $('q-next').addEventListener('click', onNextClick);
  state.mode = await detectMode();
  renderStart();
}

init();
