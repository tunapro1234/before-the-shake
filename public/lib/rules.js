// The rules: which questions are asked, which actions go on the card and in what order.
// Pure functions, no DOM, no network. The same answers always give the same card.

import { BASE_ORDER } from './questions.js';

export const DEFAULT_ORDER = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

// A missing answer counts as "Not sure".
function one(answers, id) {
  return answers[id] ?? 'not_sure';
}

function isIn(answers, id, values) {
  return values.includes(one(answers, id));
}

// When each action goes on the card (prd.md > Priority Rules).
const ON_CARD = {
  A1: (a) => isIn(a, 'Q3', ['not_fixed', 'not_sure']),
  A2: () => true,
  A3: (a) => isIn(a, 'Q4', ['partly', 'no', 'not_sure']),
  A4: (a) => isIn(a, 'Q5', ['no', 'not_sure']),
  A5: (a) => isIn(a, 'Q6', ['partly', 'no', 'not_sure']),
  A6: (a) => isIn(a, 'Q7', ['no', 'not_sure']),
};

export function questionSequence(answers = {}) {
  return [...BASE_ORDER];
}

export function buildCard(answers = {}) {
  const actions = DEFAULT_ORDER.filter((id) => ON_CARD[id](answers)).map((id) => ({ id, variants: [], why: [] }));
  return {
    actions,
    engineer: ['general_assessment', 'general_code', 'general_who'],
  };
}
