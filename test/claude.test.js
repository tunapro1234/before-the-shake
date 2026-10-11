// Live mode without a key: the SDK client is a stub, so these tests never touch the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import Anthropic from '@anthropic-ai/sdk';
import { createClaude } from '../server/claude.js';
import { createHandler } from '../server/server.js';
import { buildCard } from '../public/lib/rules.js';
import { combineFlags } from '../public/lib/emergency.js';

const ruleOutput = buildCard({ Q1: ['child_under_5', 'needs_help'], Q2: 'floor_3_to_6', Q3: 'not_fixed', F1: 'yes', Q6: 'no' });
const ids = ruleOutput.actions.map((a) => a.id);
const env = { CLAUDE_MODEL_FAST: 'fast-model', CLAUDE_MODEL_CARD: 'card-model' };

// A stub client: each call takes the next reply; a reply that is an Error is thrown.
function stub(...replies) {
  const calls = [];
  return {
    calls,
    messages: {
      create: async (params, opts) => {
        calls.push({ params, opts });
        const r = replies.shift();
        if (r instanceof Error) throw r;
        return r;
      },
    },
  };
}
const reply = (json, stop_reason = 'end_turn') => ({
  stop_reason,
  content: [{ type: 'text', text: typeof json === 'string' ? json : JSON.stringify(json) }],
});
const goodCard = { actions: ids.map((id) => ({ id, explanation: 'Do this calmly with everyone at home this week.' })) };

test('card: a good response passes and the request carries the schema and effort', async () => {
  const client = stub(reply(goodCard));
  const out = await createClaude({ client, env }).card({ ruleOutput });
  assert.deepEqual(out, { result: goodCard });
  const { params, opts } = client.calls[0];
  assert.equal(params.model, 'card-model');
  assert.equal(params.output_config.effort, 'medium');
  assert.equal(params.output_config.format.type, 'json_schema');
  assert.deepEqual(params.output_config.format.schema.properties.actions.items.properties.id.enum, ids);
  assert.equal(opts.timeout, 30000);
  // The model sees the app's own text, not the person's answers.
  assert.ok(!params.messages[0].content.includes('child_under_5'));
});

test('card: failure form 1, an API error', async () => {
  const client = stub(new Anthropic.APIConnectionError({ message: 'connection refused' }));
  assert.deepEqual(await createClaude({ client, env }).card({ ruleOutput }), { error: 'api' });
});

test('card: failure form 2, a refusal or max_tokens stop', async () => {
  for (const stop of ['refusal', 'max_tokens']) {
    const client = stub(reply(goodCard, stop));
    assert.deepEqual(await createClaude({ client, env }).card({ ruleOutput }), { error: 'stopped' }, stop);
  }
});

test('card: failure form 3, text that does not parse', async () => {
  const client = stub(reply('{"actions": [ {"id": "A1", "expl'));
  assert.deepEqual(await createClaude({ client, env }).card({ ruleOutput }), { error: 'unparseable' });
});

test('card: failure form 4, JSON that parses but fails the check', async () => {
  const reordered = { actions: [...goodCard.actions].reverse() };
  const withDigit = { actions: goodCard.actions.map((a, i) => (i ? a : { ...a, explanation: 'Fix 2 wardrobes.' })) };
  const verdict = { actions: goodCard.actions.map((a, i) => (i ? a : { ...a, explanation: 'Your building is safe.' })) };
  for (const bad of [reordered, withDigit, verdict]) {
    const client = stub(reply(bad));
    assert.deepEqual(await createClaude({ client, env }).card({ ruleOutput }), { error: 'invalid' });
  }
});

test('card: unknown action ids from the browser never reach the model', async () => {
  const client = stub(reply(goodCard));
  const out = await createClaude({ client, env }).card({ ruleOutput: { actions: [{ id: 'A9', variants: [], why: [] }] } });
  assert.deepEqual(out, { error: 'bad_request' });
  assert.equal(client.calls.length, 0);
});

test('followup: good wording passes, a broken one fails', async () => {
  const client = stub(reply({ question: 'Does your child sleep in a room with that furniture?' }), reply({ question: 'Is the child 4?' }));
  const claude = createClaude({ client, env });
  assert.deepEqual(await claude.followup({ followupId: 'F1' }), { result: { question: 'Does your child sleep in a room with that furniture?' } });
  assert.deepEqual(await claude.followup({ followupId: 'F1' }), { error: 'invalid' });
  assert.equal(client.calls[0].params.model, 'fast-model');
  assert.equal(client.calls[0].opts.timeout, 8000);
});

test('fast tasks drop effort if the fast model rejects it (C2)', async () => {
  const rejected = new Anthropic.BadRequestError(400, { error: { message: 'effort is not supported' } }, 'output_config.effort: not supported', new Headers());
  const client = stub(rejected, reply({ emergency: false, verdict_request: false }), reply({ emergency: false, verdict_request: true }));
  const claude = createClaude({ client, env });
  assert.deepEqual(await claude.flags({ text: 'we have a gas stove' }), { result: { emergency: false, verdict_request: false } });
  assert.equal(client.calls[0].params.output_config.effort, 'low');
  assert.equal(client.calls[1].params.output_config.effort, undefined);
  await claude.flags({ text: 'is my building ok' });
  assert.equal(client.calls[2].params.output_config.effort, undefined);
});

test('the keyword emergency still wins when the model says there is no emergency', async () => {
  const client = stub(reply({ emergency: false, verdict_request: false }));
  const text = 'I smell gas';
  const out = await createClaude({ client, env }).flags({ text });
  assert.equal(out.result.emergency, false);
  assert.equal(combineFlags(text, out.result).emergency, true);
  assert.equal(combineFlags(text, null).emergency, true);
  assert.equal(combineFlags('we have a gas stove', { emergency: true, verdict_request: false }).emergency, true);
});

async function withServer(options, fn) {
  const server = createServer(createHandler(options)).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    server.close();
  }
}
const post = (base, body) => fetch(`${base}/api/claude`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });

test('server: with no key /api/claude returns 503 and /api/mode says offline', async () => {
  await withServer({ live: () => false, claude: createClaude({ client: stub(), env }) }, async (base) => {
    const res = await post(base, { task: 'card', payload: { ruleOutput } });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'offline' });
    assert.deepEqual(await (await fetch(`${base}/api/mode`)).json(), { mode: 'offline' });
  });
});

test('server: live tasks, unknown task, broken body and the size limit', async () => {
  const claude = createClaude({ client: stub(reply(goodCard), new Anthropic.APIConnectionError({ message: 'down' })), env });
  await withServer({ live: () => true, claude }, async (base) => {
    let res = await post(base, { task: 'card', payload: { ruleOutput } });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { result: goodCard });
    res = await post(base, { task: 'card', payload: { ruleOutput } });
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { error: 'api' });
    assert.equal((await post(base, { task: 'poem' })).status, 400);
    assert.equal((await post(base, '{broken')).status, 400);
    assert.equal((await post(base, { task: 'flags', payload: { text: 'x'.repeat(17000) } })).status, 413);
  });
});
