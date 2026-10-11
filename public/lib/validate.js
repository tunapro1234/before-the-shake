// The fence around the model. The model only writes wording; these checks decide whether that
// wording may be shown. Any failure means the page uses the fixed text from content.js.

const BLOCKED = ['safe building', 'building is safe', 'unsafe', 'risk score', 'percent', 'guarantee'];

// Reassurance is a verdict too, even without a number or the word "safe". The one fixed use of
// "sturdy" is furniture in Drop, Cover, Hold On, so that phrase is taken out before the check.
const REASSURANCE = [/\bhold(s)? up\b/, /\bshould be fine\b/, /\bsturdy\b/, /\bsolid\b/, /\bnothing to worry\b/];
const FURNITURE = /\bsturdy (table|desk)s?\b/g;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function cleanText(text, max) {
  if (typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 1 || t.length > max) return false;
  if (/[0-9%]/.test(t)) return false;
  const lower = t.toLowerCase();
  if (BLOCKED.some((phrase) => lower.includes(phrase))) return false;
  const rest = lower.replace(FURNITURE, ' ');
  return !REASSURANCE.some((re) => re.test(rest));
}

// Passes only if the model kept every action of the rule output, in the same order, added none,
// and each explanation is short plain text without numbers or verdict words.
export function checkCardText(ruleOutput, json) {
  if (!isObject(json) || !Array.isArray(json.actions)) return false;
  if (Object.keys(json).some((k) => k !== 'actions')) return false;
  const want = ruleOutput.actions.map((a) => a.id);
  if (json.actions.length !== want.length) return false;
  return json.actions.every(
    (a, i) =>
      isObject(a) &&
      Object.keys(a).every((k) => k === 'id' || k === 'explanation') &&
      a.id === want[i] &&
      cleanText(a.explanation, 240),
  );
}

export function checkFollowupText(text) {
  return cleanText(text, 160) && text.trim().endsWith('?');
}

export function checkFlags(json) {
  return (
    isObject(json) &&
    Object.keys(json).length === 2 &&
    typeof json.emergency === 'boolean' &&
    typeof json.verdict_request === 'boolean'
  );
}
