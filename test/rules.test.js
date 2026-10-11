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

import { followupsFor, buildingFacts } from '../public/lib/rules.js';

const householdA = { Q1: ['only_adults'], Q3: 'fixed', Q4: 'partly' };
const householdB = { Q1: ['child_under_5', 'needs_help'], Q2: 'floor_3_to_6', Q3: 'not_fixed', F1: 'yes', Q6: 'no' };
const byId = (card, id) => card.actions.find((a) => a.id === id);

test('demo pair: household A has no A1', () => {
  const card = buildCard(householdA);
  assert.ok(!ids(card).includes('A1'));
  assert.deepEqual(ids(card), ['A2', 'A3', 'A4', 'A5', 'A6']);
});

test('demo pair: household B has A1 first (child room) and A5 second (stairs line)', () => {
  const card = buildCard(householdB);
  assert.deepEqual(ids(card).slice(0, 2), ['A1', 'A5']);
  assert.ok(byId(card, 'A1').variants.includes('childs_room'));
  assert.ok(byId(card, 'A5').variants.includes('stairs'));
  assert.deepEqual(byId(card, 'A5').variants, ['who_helps_neighbour', 'stairs']);
  assert.deepEqual(byId(card, 'A5').why, ['needs_help_second']);
  assert.ok(byId(card, 'A3').variants.includes('child_items'));
});

test('A and B get visibly different cards', () => {
  assert.notDeepEqual(buildCard(householdA), buildCard(householdB));
});

test('needs help without A1 puts A5 first', () => {
  const card = buildCard({ Q1: ['needs_help'], Q3: 'fixed', Q6: 'no' });
  assert.equal(ids(card)[0], 'A5');
  assert.deepEqual(byId(card, 'A5').why, ['needs_help_first']);
});

test('if A5 is not on the card (Q6 Yes), the older-person rule has nothing to move', () => {
  const card = buildCard({ Q1: ['needs_help'], Q3: 'not_fixed', Q6: 'yes' });
  assert.ok(!ids(card).includes('A5'));
  assert.deepEqual(ids(card), ['A1', 'A2', 'A3', 'A4', 'A6']);
});

test('F2 nobody yet or not sure merges the helper and neighbour lines into one', () => {
  for (const F2 of ['nobody_yet', 'not_sure', undefined]) {
    const card = buildCard({ Q1: ['needs_help'], Q6: 'no', F2 });
    assert.deepEqual(byId(card, 'A5').variants, ['who_helps_neighbour'], String(F2));
  }
  for (const F2 of ['neighbour', 'someone_at_home']) {
    const card = buildCard({ Q1: ['needs_help'], Q6: 'no', F2 });
    assert.deepEqual(byId(card, 'A5').variants, ['who_helps'], F2);
  }
});

test('stairs line only from the 3rd floor up', () => {
  const low = buildCard({ Q1: ['needs_help'], Q2: 'ground_to_2', Q6: 'no' });
  assert.ok(!byId(low, 'A5').variants.includes('stairs'));
  const high = buildCard({ Q1: ['needs_help'], Q2: 'floor_7_plus', Q6: 'no' });
  assert.ok(byId(high, 'A5').variants.includes('stairs'));
});

test('pet adds pet items to the bag', () => {
  assert.ok(byId(buildCard({ Q1: ['pet'], Q4: 'no' }), 'A3').variants.includes('pet_items'));
});

test('building facts never change actions or order', () => {
  const facts = [
    { Q8: 'before_2000' },
    { Q9: ['cracks', 'removed', 'rust'], F3: 'my_flat' },
    { Q10: 'own' },
    { Q10: 'rent', Q8: 'after_2018', Q9: ['none'] },
  ];
  for (const base of [householdA, householdB, {}]) {
    const plain = buildCard(base).actions;
    for (const f of facts) assert.deepEqual(buildCard({ ...base, ...f }).actions, plain);
  }
});

test('building facts become engineer questions; none means general questions', () => {
  assert.deepEqual(buildCard({}).engineer, ['general_assessment', 'general_code', 'general_who']);
  const own = buildCard({ Q8: 'before_2000', Q9: ['removed', 'cracks'], F3: 'other_unit', Q10: 'own' });
  assert.deepEqual(own.engineer, ['pre_2000', 'removed_other_unit', 'cracks']);
  assert.deepEqual(own.process, ['law_6306_owner']);
  const rent = buildCard({ Q9: ['rust'], Q10: 'rent' });
  assert.deepEqual(rent.engineer, ['rust']);
  assert.deepEqual(rent.process, ['rent']);
  assert.deepEqual(buildCard({ Q10: 'not_sure' }).process, []);
});

test('follow-ups appear only under their conditions, right after their trigger', () => {
  assert.deepEqual(followupsFor({}), []);
  assert.deepEqual(followupsFor({ Q1: ['child_under_5'], Q3: 'fixed' }), []);
  assert.deepEqual(followupsFor({ Q1: ['child_under_5'], Q3: 'not_sure' }), ['F1']);
  assert.deepEqual(followupsFor({ Q1: ['needs_help'] }), ['F2']);
  assert.deepEqual(followupsFor({ Q9: ['removed'] }), ['F3']);
  const seq = questionSequence({ Q1: ['child_under_5', 'needs_help'], Q3: 'not_fixed', Q9: ['removed'] });
  assert.deepEqual(seq, ['Q1', 'F2', 'Q2', 'Q3', 'F1', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'F3', 'Q10', 'Q11']);
});

test('a stale follow-up answer is ignored when its condition no longer holds', () => {
  const card = buildCard({ Q1: ['only_adults'], Q3: 'not_fixed', F1: 'yes' });
  assert.deepEqual(card.actions[0].variants, []);
});

test('building facts for the Honest Panel skip "none" and "not sure"', () => {
  assert.deepEqual(buildingFacts({ Q8: 'not_sure', Q9: ['none'] }), []);
  assert.deepEqual(buildingFacts({ Q8: 'before_2000', Q9: ['cracks'] }), ['built_before_2000', 'cracks']);
  assert.deepEqual(buildingFacts({ Q9: ['removed'], F3: 'my_flat' }), ['removed_my_flat']);
  assert.deepEqual(buildingFacts({ Q9: ['removed'], F3: 'not_sure' }), ['removed']);
});
