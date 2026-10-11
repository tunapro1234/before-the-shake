// Saved state in this browser only. One localStorage key, one JSON object:
// { mode, step, answers, flags, card: { ruleOutput, explanations, wording, ticks } }.
// Every read and write is wrapped: private windows and blocked storage just mean nothing is kept.

export const KEY = 'before-the-shake.v1';

export function emptyState(mode = 'offline') {
  return { mode, step: null, answers: {}, flags: { emergency: false, verdict_request: false }, card: null };
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function validCard(card) {
  if (!isObject(card) || !isObject(card.ruleOutput)) return false;
  const { actions, engineer, process } = card.ruleOutput;
  return Array.isArray(actions) && Array.isArray(engineer) && Array.isArray(process) && isObject(card.ticks ?? {});
}

// Returns the saved state, or null when there is nothing usable.
export function load(storage) {
  let data;
  try {
    data = JSON.parse(storage.getItem(KEY));
  } catch {
    return null;
  }
  if (!isObject(data) || !isObject(data.answers)) return null;
  const state = emptyState(data.mode === 'live' ? 'live' : 'offline');
  state.answers = data.answers;
  state.step = typeof data.step === 'string' ? data.step : null;
  if (isObject(data.flags)) state.flags = { emergency: data.flags.emergency === true, verdict_request: data.flags.verdict_request === true };
  if (validCard(data.card)) {
    state.card = {
      ruleOutput: data.card.ruleOutput,
      explanations: isObject(data.card.explanations) ? data.card.explanations : {},
      wording: data.card.wording === 'live' ? 'live' : 'fixed',
      ticks: data.card.ticks ?? {},
    };
  }
  return state;
}

export function save(storage, state) {
  const { mode, step, answers, flags, card } = state;
  try {
    storage.setItem(KEY, JSON.stringify({ mode, step, answers, flags, card }));
  } catch {
    // Storage full or blocked: the app keeps working, it just will not remember.
  }
}

// "Start over": nothing but the mode is kept.
export function startOver(storage, state) {
  const fresh = emptyState(state.mode);
  save(storage, fresh);
  return fresh;
}

// "Clear my answers": the key is removed entirely.
export function clear(storage, mode) {
  try {
    storage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  return emptyState(mode);
}
