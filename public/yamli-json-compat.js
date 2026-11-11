// Yamli's unchanged SDK calls the global eval with parenthesized JSON responses.
// Install before that SDK: parse data without invoking JavaScript compilation.
// This replaces eval for the whole page. Non-JSON code remains unsupported,
// as it already is under our CSP, which must continue to forbid unsafe-eval.
window.eval = function parseYamliJson(source) {
  if (typeof source !== 'string') return source;
  const json = source.trim();
  return JSON.parse(json.startsWith('(') && json.endsWith(')') ? json.slice(1, -1) : json);
};
