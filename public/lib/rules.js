// The rules: which questions are asked, which actions go on the card and in what order.
// Pure functions, no DOM, no network. The same answers always give the same card.
// Building facts (Q8, Q9, Q10, F3) are never read by the action or order code.

import { BASE_ORDER } from './questions.js';

export const DEFAULT_ORDER = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

// A missing answer counts as "Not sure".
function one(answers, id) {
  return answers[id] ?? 'not_sure';
}

function many(answers, id) {
  return answers[id] ?? [];
}

function isIn(answers, id, values) {
  return values.includes(one(answers, id));
}

const household = (a) => {
  const who = many(a, 'Q1');
  return { child: who.includes('child_under_5'), needsHelp: who.includes('needs_help'), pet: who.includes('pet') };
};

// When each action goes on the card (prd.md > Priority Rules).
const ON_CARD = {
  A1: (a) => isIn(a, 'Q3', ['not_fixed', 'not_sure']),
  A2: () => true,
  A3: (a) => isIn(a, 'Q4', ['partly', 'no', 'not_sure']),
  A4: (a) => isIn(a, 'Q5', ['no', 'not_sure']),
  A5: (a) => isIn(a, 'Q6', ['partly', 'no', 'not_sure']),
  A6: (a) => isIn(a, 'Q7', ['no', 'not_sure']),
};

// When each follow-up is asked (prd.md > Interview).
const FOLLOWUP_WHEN = {
  F2: (a) => household(a).needsHelp,
  F1: (a) => household(a).child && ON_CARD.A1(a),
  F3: (a) => many(a, 'Q9').includes('removed'),
};

export function followupsFor(answers = {}) {
  return Object.keys(FOLLOWUP_WHEN).filter((id) => FOLLOWUP_WHEN[id](answers));
}

const FOLLOWUP_AFTER = { Q1: 'F2', Q3: 'F1', Q9: 'F3' };

export function questionSequence(answers = {}) {
  const applies = new Set(followupsFor(answers));
  const seq = [];
  for (const q of BASE_ORDER) {
    seq.push(q);
    const f = FOLLOWUP_AFTER[q];
    if (f && applies.has(f)) seq.push(f);
  }
  return seq;
}

function orderActions(answers) {
  const h = household(answers);
  const actions = DEFAULT_ORDER.filter((id) => ON_CARD[id](answers)).map((id) => ({ id, variants: [], why: [] }));
  const find = (id) => actions.find((x) => x.id === id);

  const a1 = find('A1');
  if (a1 && h.child) {
    if (isIn(answers, 'F1', ['yes', 'not_sure'])) a1.variants.push('childs_room');
    a1.why.push('child_first');
  }

  const a3 = find('A3');
  if (a3 && h.child) a3.variants.push('child_items');
  if (a3 && h.pet) a3.variants.push('pet_items');

  const a5 = find('A5');
  if (a5 && h.needsHelp) {
    // With nobody to help yet, the helper line and the neighbour line become one sentence.
    a5.variants.push(isIn(answers, 'F2', ['nobody_yet', 'not_sure']) ? 'who_helps_neighbour' : 'who_helps');
    if (isIn(answers, 'Q2', ['floor_3_to_6', 'floor_7_plus'])) a5.variants.push('stairs');
    // A5 moves to second place, right after A1, or to the top when A1 is not on the card.
    actions.splice(actions.indexOf(a5), 1);
    const target = a1 ? 1 : 0;
    actions.splice(target, 0, a5);
    a5.why.push(target === 1 ? 'needs_help_second' : 'needs_help_first');
  }
  // If A5 is not on the card (Q6 Yes), the older-person rule has nothing to move.
  return actions;
}

function removedWhere(answers) {
  const where = one(answers, 'F3');
  return where === 'my_flat' ? 'removed_my_flat' : where === 'other_unit' ? 'removed_other_unit' : 'removed';
}

function engineerQuestions(answers) {
  const facts = [];
  if (one(answers, 'Q8') === 'before_2000') facts.push('pre_2000');
  const seen = many(answers, 'Q9');
  if (seen.includes('removed')) facts.push(removedWhere(answers));
  if (seen.includes('cracks')) facts.push('cracks');
  if (seen.includes('rust')) facts.push('rust');
  return facts.length ? facts : ['general_assessment', 'general_code', 'general_who'];
}

// Statements about the official process, shown under the engineer questions.
function officialProcess(answers) {
  const tenure = one(answers, 'Q10');
  if (tenure === 'own') return ['law_6306_owner'];
  if (tenure === 'rent') return ['rent'];
  return [];
}

const BUILT = { before_2000: 'built_before_2000', from_2000_to_2018: 'built_2000_to_2018', after_2018: 'built_after_2018' };

// The facts the person gave about the building, as ids of plain sentences for the Honest Panel.
export function buildingFacts(answers = {}) {
  const facts = [];
  if (BUILT[answers.Q8]) facts.push(BUILT[answers.Q8]);
  const seen = many(answers, 'Q9');
  if (seen.includes('removed')) facts.push(removedWhere(answers));
  if (seen.includes('cracks')) facts.push('cracks');
  if (seen.includes('rust')) facts.push('rust');
  return facts;
}

export function buildCard(answers = {}) {
  return {
    actions: orderActions(answers),
    engineer: engineerQuestions(answers),
    process: officialProcess(answers),
  };
}
