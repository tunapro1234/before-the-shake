// The card as plain data: every line of text the card shows, in order. Pure, no DOM, so the tests
// can check the whole card; app.js only turns this into elements.

import {
  ACTIONS, VARIANTS, WHY, ENGINEER, PROCESS, PROCESS_TITLE, PROCESS_SOURCE, CANNOT_JUDGE, START, ORDER_NOTE,
  FIXED_WORDING_NOTE,
} from './content.js';
import { SOURCES, APP_RULE, tagLabel } from './sources.js';

const tag = (n) => ({ n, label: tagLabel(n) });

export function cardView(card) {
  const { ruleOutput } = card;
  return {
    emergencyLine: START.emergencyLine,
    status: card.fallback ? FIXED_WORDING_NOTE : '',
    orderNote: ORDER_NOTE,
    actions: ruleOutput.actions.map((a) => ({
      id: a.id,
      title: ACTIONS[a.id].title,
      explanation: (card.wording === 'model' && card.explanations?.[a.id]) || ACTIONS[a.id].explanation,
      variants: a.variants.map((id) => ({ id, text: VARIANTS[id] })),
      why: a.why.map((id) => ({ id, text: WHY[id] })),
      ticked: card.ticks?.[a.id] === true,
      source: tag(ACTIONS[a.id].source),
    })),
    engineer: ruleOutput.engineer.map((id) => ({ id, text: ENGINEER[id] })),
    process: ruleOutput.process.length
      ? {
          title: PROCESS_TITLE,
          items: ruleOutput.process.map((id) => ({ id, text: PROCESS[id], source: PROCESS_SOURCE[id] ? tag(PROCESS_SOURCE[id]) : null })),
        }
      : null,
    cannotJudge: CANNOT_JUDGE,
    appRule: `[${APP_RULE}]`,
    sources: SOURCES.map((s) => ({ n: s.n, text: `${s.org}, ${s.title}. `, url: s.url, checked: `. Checked ${s.checked}.` })),
    appRuleNote: `${APP_RULE}: the order and the "because you said" lines come from this app's own logic, not from an official source.`,
  };
}
