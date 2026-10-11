import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCardText, checkFollowupText, checkFlags } from '../public/lib/validate.js';
import { buildCard } from '../public/lib/rules.js';

const ruleOutput = buildCard({ Q1: ['child_under_5', 'needs_help'], Q3: 'not_fixed', Q6: 'no' });
const ids = ruleOutput.actions.map((a) => a.id);
const good = () => ({ actions: ids.map((id) => ({ id, explanation: `Plain words for ${id.replace(/\d/g, '')} this week.` })) });

test('a complete answer in the right order passes', () => {
  assert.equal(checkCardText(ruleOutput, good()), true);
});

test('missing, reordered or extra actions fail', () => {
  const missing = good();
  missing.actions.pop();
  assert.equal(checkCardText(ruleOutput, missing), false);
  const reordered = good();
  [reordered.actions[0], reordered.actions[1]] = [reordered.actions[1], reordered.actions[0]];
  assert.equal(checkCardText(ruleOutput, reordered), false);
  const extra = good();
  extra.actions.push({ id: 'A7', explanation: 'Something new.' });
  assert.equal(checkCardText(ruleOutput, extra), false);
});

test('digits, percent signs and blocked phrases fail', () => {
  for (const bad of ['Keep 3 litres of water.', 'Most homes are fine, 90% of them.', 'Your building is safe, relax.', 'This is unsafe.', 'We guarantee it.', 'Low risk score.']) {
    const card = good();
    card.actions[1].explanation = bad;
    assert.equal(checkCardText(ruleOutput, card), false, bad);
  }
});

test('reassurance about the building fails, furniture words pass', () => {
  for (const bad of [
    'Your building should hold up fine.',
    'Older blocks here usually hold up.',
    'Your flat should be fine in most shaking.',
    'The frame looks sturdy.',
    'Concrete like this is solid.',
    'There is nothing to worry about, just fix the shelves.',
  ]) {
    const card = good();
    card.actions[1].explanation = bad;
    assert.equal(checkCardText(ruleOutput, card), false, bad);
  }
  for (const ok of ['Get under a sturdy table and hold on until it stops.', 'Sturdy desks work too.', 'Consolidate the bag in one place.']) {
    const card = good();
    card.actions[1].explanation = ok;
    assert.equal(checkCardText(ruleOutput, card), true, ok);
  }
  assert.equal(checkFollowupText('Is your block solid?'), false);
});

test('empty, too long, wrong type and extra keys fail', () => {
  for (const bad of ['', '   ', 'x'.repeat(241), 42, null]) {
    const card = good();
    card.actions[0].explanation = bad;
    assert.equal(checkCardText(ruleOutput, card), false, String(bad));
  }
  const extraKey = good();
  extraKey.actions[0].title = 'New title';
  assert.equal(checkCardText(ruleOutput, extraKey), false);
  assert.equal(checkCardText(ruleOutput, { ...good(), order: ids }), false);
});

test('broken shapes fail', () => {
  for (const bad of [null, 'text', [], {}, { actions: 'A1' }]) assert.equal(checkCardText(ruleOutput, bad), false, JSON.stringify(bad));
});

test('follow-up wording: one short question, no numbers or verdicts', () => {
  assert.equal(checkFollowupText('Does your child sleep in a room with that furniture?'), true);
  assert.equal(checkFollowupText('Does your child sleep there.'), false);
  assert.equal(checkFollowupText('Is the child under 5?'), false);
  assert.equal(checkFollowupText('Your building is safe, right?'), false);
  assert.equal(checkFollowupText(`${'x'.repeat(160)}?`), false);
  assert.equal(checkFollowupText(undefined), false);
});

test('flags must be exactly two booleans', () => {
  assert.equal(checkFlags({ emergency: false, verdict_request: true }), true);
  assert.equal(checkFlags({ emergency: 'no', verdict_request: true }), false);
  assert.equal(checkFlags({ emergency: false }), false);
  assert.equal(checkFlags({ emergency: false, verdict_request: false, score: 1 }), false);
});
