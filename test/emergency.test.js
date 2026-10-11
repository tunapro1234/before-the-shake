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

// Turkish letters are written as escapes so the repository stays ASCII.
test('Turkish emergency phrases open the Emergency screen', () => {
  for (const t of [
    'gaz kokusu var',
    'Mutfakta gaz kokuyor',
    'Gaz ka\u00e7a\u011f\u0131 var galiba',
    'Kom\u015fumuz mahsur kald\u0131',
    '\u0130ki ki\u015fi enkaz alt\u0131nda',
    'Yaral\u0131 var',
    'Babam yaraland\u0131',
    'Kolu kan\u0131yor',
    'YANGIN VAR',
    'Mutfakta yang\u0131n \u00e7\u0131kt\u0131',
    'Balkon \u00e7\u00f6kt\u00fc',
    'Duvar \u00e7\u00f6k\u00fcyor',
  ]) {
    assert.equal(hasEmergencyKeyword(t), true, t);
  }
});

test('ordinary Turkish answers do not open the Emergency screen', () => {
  for (const t of [
    'Yang\u0131n t\u00fcp\u00fcm\u00fcz var',
    'Yang\u0131n merdiveni yok',
    'Gaz vanas\u0131n\u0131n yerini biliyoruz',
    '\u00c7atlaklar \u00e7oktu',
    'Bina \u00e7ok eski',
    '\u00c7\u00f6kme riski var m\u0131?',
    'Kanal\u0131 de\u011fi\u015ftirdik',
  ]) {
    assert.equal(hasEmergencyKeyword(t), false, t);
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
