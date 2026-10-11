// Fixed checks on the free-text answer. They run in the browser, in both modes, before any
// Claude call. An emergency match always wins: the model may add a flag, never clear one.

const EMERGENCY_PHRASES = [
  /\bsmell(s|ing)? (of )?gas\b/,
  /\bgas (smell|smells|leak|leaks|is leaking)\b/,
  /\bleak(ing|s)? gas\b/,
  /\btrapped\b/,
  /\binjur(ed|y|ies)\b/,
  /\bbleeding\b/,
  /\bon fire\b/,
  /\bfire in\b/,
  /\bcollaps(ed|ing)\b/,
];

// Questions that ask the app to judge the building. Offline, this is the only way the
// free text opens the Honest Panel; live mode adds the model's flag on top.
const VERDICT_PHRASES = [
  /\b(is|are) (my|the|our|this) (building|block|flat|apartment|home|house) (safe|unsafe|strong|ok|okay|risky|dangerous)\b/,
  /\bhow (safe|strong|risky) is (my|the|our|this) (building|block|flat|apartment|home|house)\b/,
  /\bwill (my|the|our|this) (building|block|flat|apartment|home|house) (collapse|fall|survive|hold)\b/,
];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function hasEmergencyKeyword(text) {
  const t = normalize(text);
  return EMERGENCY_PHRASES.some((re) => re.test(t));
}

export function asksForVerdict(text) {
  const t = normalize(text);
  return VERDICT_PHRASES.some((re) => re.test(t));
}

// Live mode: the model's flags can add to the fixed checks, never clear them.
export function combineFlags(text, modelFlags) {
  return {
    emergency: hasEmergencyKeyword(text) || modelFlags?.emergency === true,
    verdict_request: asksForVerdict(text) || modelFlags?.verdict_request === true,
  };
}
