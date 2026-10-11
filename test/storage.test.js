import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEY, load, save, startOver, clear, emptyState } from '../public/lib/storage.js';
import { buildCard } from '../public/lib/rules.js';

function fakeStorage() {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

const answers = { Q1: ['child_under_5'], Q3: 'not_fixed', F1: 'yes' };

test('nothing saved gives null', () => {
  assert.equal(load(fakeStorage()), null);
});

test('mid-interview save resumes at the same step with the answers', () => {
  const s = fakeStorage();
  save(s, { ...emptyState(), step: 'Q4', answers });
  const back = load(s);
  assert.equal(back.step, 'Q4');
  assert.deepEqual(back.answers, answers);
  assert.equal(back.card, null);
});

test('the card and its ticks survive a reload', () => {
  const s = fakeStorage();
  const card = { ruleOutput: buildCard(answers), explanations: {}, wording: 'fixed', ticks: { A1: true, A3: true } };
  save(s, { ...emptyState(), step: 'Q11', answers, card });
  const back = load(s);
  assert.deepEqual(back.card.ticks, { A1: true, A3: true });
  assert.deepEqual(back.card.ruleOutput, card.ruleOutput);
});

test('Start over keeps nothing but the mode', () => {
  const s = fakeStorage();
  const state = { ...emptyState('live'), step: 'Q5', answers, flags: { emergency: true, verdict_request: true } };
  save(s, state);
  const fresh = startOver(s, state);
  assert.deepEqual(fresh, emptyState('live'));
  assert.deepEqual(load(s), emptyState('live'));
});

test('Clear my answers removes the key', () => {
  const s = fakeStorage();
  save(s, { ...emptyState(), step: 'Q2', answers });
  clear(s, 'offline');
  assert.equal(s.map.has(KEY), false);
  assert.equal(load(s), null);
});

test('broken or odd saved data starts fresh instead of failing', () => {
  const s = fakeStorage();
  for (const raw of ['{not json', '[]', '"text"', '{"answers": 3}']) {
    s.setItem(KEY, raw);
    assert.equal(load(s), null, raw);
  }
  s.setItem(KEY, JSON.stringify({ answers, step: 'Q3', card: { ruleOutput: { actions: [] } } }));
  const back = load(s);
  assert.equal(back.card, null);
  assert.equal(back.step, 'Q3');
});

test('blocked storage never throws', () => {
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
  };
  assert.equal(load(blocked), null);
  assert.doesNotThrow(() => save(blocked, emptyState()));
  assert.doesNotThrow(() => clear(blocked));
});
