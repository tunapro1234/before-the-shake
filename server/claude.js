// The three Claude tasks. Each returns { result } or { error }; it never throws.
// The four failure forms all end in { error }: an API error, a stop for refusal or max_tokens,
// text that does not parse, and JSON that parses but fails the fence in validate.js.

import Anthropic from '@anthropic-ai/sdk';
import { FOLLOWUPS } from '../public/lib/questions.js';
import { ACTIONS, VARIANTS, WHY } from '../public/lib/content.js';
import { checkCardText, checkFollowupText, checkFlags } from '../public/lib/validate.js';
import { FOLLOWUP_SYSTEM, FOLLOWUP_SCHEMA, FLAGS_SYSTEM, FLAGS_SCHEMA, CARD_SYSTEM, cardSchema } from './prompts.js';

const FAST_TIMEOUT = 8000;
const CARD_TIMEOUT = 30000;

export function createClaude({ client, env = process.env } = {}) {
  const sdk = client ?? new Anthropic();
  const fastModel = env.CLAUDE_MODEL_FAST || 'claude-haiku-5-5';
  const cardModel = env.CLAUDE_MODEL_CARD || 'claude-opus-5-5';
  // Learner change C2: the fast model gets effort "low" only if it accepts it.
  let fastEffort = 'low';

  async function call({ model, effort, system, user, schema, maxTokens, timeout }) {
    const output_config = { format: { type: 'json_schema', schema } };
    if (effort) output_config.effort = effort;
    const res = await sdk.messages.create(
      { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }], output_config },
      { timeout },
    );
    if (res.stop_reason !== 'end_turn') return { error: 'stopped' };
    const text = res.content.find((b) => b.type === 'text')?.text;
    try {
      return { json: JSON.parse(text) };
    } catch {
      return { error: 'unparseable' };
    }
  }

  async function fast(params) {
    try {
      return await call({ ...params, model: fastModel, effort: fastEffort, timeout: FAST_TIMEOUT, maxTokens: 1024 });
    } catch (err) {
      if (fastEffort && err instanceof Anthropic.BadRequestError && /effort/i.test(err.message)) {
        fastEffort = null;
        return fast(params);
      }
      throw err;
    }
  }

  async function run(task) {
    try {
      return await task();
    } catch {
      return { error: 'api' };
    }
  }

  return {
    followup: ({ followupId } = {}) =>
      run(async () => {
        const f = FOLLOWUPS[followupId];
        if (!f) return { error: 'bad_request' };
        const out = await fast({ system: FOLLOWUP_SYSTEM, schema: FOLLOWUP_SCHEMA, user: `Context: ${f.reason}\nQuestion: ${f.text}` });
        if (out.error) return out;
        return checkFollowupText(out.json?.question) && Object.keys(out.json).length === 1
          ? { result: { question: out.json.question.trim() } }
          : { error: 'invalid' };
      }),

    flags: ({ text } = {}) =>
      run(async () => {
        if (typeof text !== 'string' || !text.trim()) return { error: 'bad_request' };
        const out = await fast({ system: FLAGS_SYSTEM, schema: FLAGS_SCHEMA, user: text.slice(0, 2000) });
        if (out.error) return out;
        return checkFlags(out.json) ? { result: out.json } : { error: 'invalid' };
      }),

    card: ({ ruleOutput } = {}) =>
      run(async () => {
        const actions = ruleOutput?.actions;
        const known = Array.isArray(actions) && actions.length > 0 && actions.every(
          (a) => ACTIONS[a?.id] && Array.isArray(a.variants) && a.variants.every((v) => VARIANTS[v]) && Array.isArray(a.why) && a.why.every((w) => WHY[w]),
        );
        if (!known) return { error: 'bad_request' };
        const ids = actions.map((a) => a.id);
        // The model sees only text the app wrote: titles, household lines and why lines.
        const input = actions.map((a) => ({
          id: a.id,
          title: ACTIONS[a.id].title,
          lines: [...a.variants.map((v) => VARIANTS[v]), ...a.why.map((w) => WHY[w])],
        }));
        const out = await call({
          model: cardModel,
          effort: 'medium',
          system: CARD_SYSTEM,
          schema: cardSchema(ids),
          user: JSON.stringify({ actions: input }),
          maxTokens: 4096,
          timeout: CARD_TIMEOUT,
        });
        if (out.error) return out;
        return checkCardText({ actions }, out.json) ? { result: out.json } : { error: 'invalid' };
      }),
  };
}
