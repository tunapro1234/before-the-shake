import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCard, questionSequence, DEFAULT_ORDER } from '../public/lib/rules.js';

const ids = (card) => card.actions.map((a) => a.id);

test('all "Not sure" (or no answers) puts every action on the card in default order', () => {
  assert.deepEqual(ids(buildCard({})), DEFAULT_ORDER);
  const notSure = { Q3: 'not_sure', Q4: 'not_sure', Q5: 'not_sure', Q6: 'not_sure', Q7: 'not_sure' };
  assert.deepEqual(ids(buildCard(notSure)), DEFAULT_ORDER);
});

test('a well-prepared household still gets A2', () => {
  const ready = { Q3: 'fixed', Q4: 'yes', Q5: 'yes', Q6: 'yes', Q7: 'yes' };
  assert.deepEqual(ids(buildCard(ready)), ['A2']);
});

test('each action appears only under its condition', () => {
  assert.ok(ids(buildCard({ Q3: 'not_fixed' })).includes('A1'));
  assert.ok(!ids(buildCard({ Q3: 'none' })).includes('A1'));
  assert.ok(ids(buildCard({ Q4: 'partly' })).includes('A3'));
  assert.ok(!ids(buildCard({ Q4: 'yes' })).includes('A3'));
  assert.ok(!ids(buildCard({ Q5: 'yes' })).includes('A4'));
  assert.ok(ids(buildCard({ Q6: 'partly' })).includes('A5'));
  assert.ok(!ids(buildCard({ Q7: 'yes' })).includes('A6'));
});

test('the base sequence is Q1 to Q11', () => {
  assert.deepEqual(questionSequence({}), ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11']);
});
