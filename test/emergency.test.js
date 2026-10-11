import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasEmergencyKeyword, asksForVerdict } from '../public/lib/emergency.js';

test('emergency phrases open the Emergency screen', () => {
  for (const t of [
    'I smell gas',
    'I can smell gas in the kitchen',
    'There is a smell of gas',
    'It smells of gas here',
    'gas smell near the boiler',
    'I think there is a gas leak',
    'Gas is leaking!',
    'leaking gas',
    'My neighbour is trapped',
    'someone is injured',
    'an injury on the stairs',
    'he is bleeding',
    'the flat next door is on fire',
    'fire in the kitchen',
    'the balcony collapsed',
    'the wall is collapsing',
  ]) {
    assert.equal(hasEmergencyKeyword(t), true, t);
  }
});

test('ordinary answers do not open the Emergency screen', () => {
  for (const t of [
    'we have a gas stove',
    'there is a fire extinguisher in the hall',
    'the room smells damp',
    'We know where the gas valve is',
    'Our building had a fire drill last year',
    'Will my building collapse?',
    '',
    undefined,
  ]) {
    assert.equal(hasEmergencyKeyword(t), false, String(t));
  }
});

test('verdict questions are recognised', () => {
  for (const t of ['Is my building safe?', 'is the building ok', 'How safe is my flat?', 'Will my building collapse in a big quake?']) {
    assert.equal(asksForVerdict(t), true, t);
  }
  for (const t of ['we have a gas stove', 'safe place under the table', 'my building is old']) {
    assert.equal(asksForVerdict(t), false, t);
  }
});
