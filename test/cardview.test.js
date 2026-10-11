import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCard } from '../public/lib/rules.js';
import { cardView } from '../public/lib/cardview.js';
import { PROCESS } from '../public/lib/content.js';

const householdB = {
  Q1: ['child_under_5', 'needs_help'], F2: 'nobody_yet', Q2: 'floor_3_to_6', Q3: 'not_fixed', F1: 'yes', Q6: 'no',
  Q8: 'before_2000', Q9: ['removed', 'cracks'], F3: 'my_flat', Q10: 'own',
};
const view = (answers, extra = {}) => cardView({ ruleOutput: buildCard(answers), explanations: {}, wording: 'fixed', ticks: {}, ...extra });

// Every leaf must be text, a number, a boolean or null: an element or a list joined into text would show up here.
function leaves(value, path = 'view') {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    assert.equal(Object.getPrototypeOf(value), Object.prototype, `${path} is a plain object`);
    return Object.entries(value).flatMap(([k, v]) => leaves(v, `${path}.${k}`));
  }
  assert.ok(['string', 'number', 'boolean'].includes(typeof value) || value === null, `${path} is ${typeof value}`);
  return typeof value === 'string' ? [value] : [];
}

test('household B: the card holds the official process with the Law 6306 line and its source', () => {
  const v = view(householdB);
  assert.equal(v.process.title, 'The official process');
  assert.deepEqual(v.process.items.map((p) => p.id), ['law_6306_owner']);
  assert.equal(v.process.items[0].text, PROCESS.law_6306_owner);
  assert.equal(v.process.items[0].source.n, 6);
  assert.deepEqual(v.engineer.map((q) => q.id), ['pre_2000', 'removed_my_flat', 'cracks']);
  assert.deepEqual(v.actions.map((a) => a.id), ['A1', 'A5', 'A2', 'A3', 'A4', 'A6']);
});

test('household B: every line on the card is plain text, none says [object', () => {
  const text = leaves(view(householdB));
  assert.ok(text.includes(PROCESS.law_6306_owner));
  assert.ok(text.every((t) => !t.includes('[object')), 'no "[object ...]" text');
  assert.ok(text.every((t) => t !== undefined && !t.includes('undefined')), 'no "undefined" text');
});

test('renters get the owner question; no tenure answer means no process block', () => {
  assert.deepEqual(view({ Q10: 'rent' }).process.items.map((p) => [p.id, p.source]), [['rent', null]]);
  assert.equal(view({}).process, null);
});

test('model explanations show only when the card wording is "model"; fallback shows the note', () => {
  const ruleOutput = buildCard({});
  const explanations = { A1: 'Model words.' };
  assert.notEqual(cardView({ ruleOutput, explanations, wording: 'fixed', ticks: {} }).actions[0].explanation, 'Model words.');
  assert.equal(cardView({ ruleOutput, explanations, wording: 'model', ticks: {} }).actions[0].explanation, 'Model words.');
  assert.equal(cardView({ ruleOutput, explanations: {}, wording: 'fixed', fallback: true, ticks: {} }).status, 'Fixed wording');
});
