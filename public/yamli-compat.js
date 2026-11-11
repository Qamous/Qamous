// Yamli's unchanged SDK calls the global eval with parenthesized JSON responses.
// Install before that SDK: parse data without invoking JavaScript compilation.
// This replaces eval for the whole page. Non-JSON code remains unsupported,
// as it already is under our CSP, which must continue to forbid unsafe-eval.
window.eval = function parseYamliJson(source) {
  if (typeof source !== 'string') return source;
  const json = source.trim();
  return JSON.parse(json.startsWith('(') && json.endsWith(')') ? json.slice(1, -1) : json);
};

// Adapt Yamli's event helper without changing the vendor script or native event
// APIs. Its unload callback syncs settings and destroys typing controls. Leave
// those controls intact when pagehide.persisted means Back can restore them.
(function () {
  let installedFor;
  function installLifecycleAdapter() {
    const events = window.Yamli?.I;
    if (!events || events === installedFor || typeof events.addEvent !== 'function' || typeof events.removeEvent !== 'function') return;
    installedFor = events;
    const add = events.addEvent, remove = events.removeEvent;
    const handlers = new WeakMap();
    function pageHideHandler(callback, capture) {
      let pair = handlers.get(callback);
      if (!pair) { pair = []; handlers.set(callback, pair); }
      const index = capture ? 1 : 0;
      if (!pair[index]) pair[index] = function (event) {
        if (!event.persisted) {
          if (typeof callback === 'function') callback.call(this, event);
          else callback.handleEvent(event);
        }
      };
      return pair[index];
    }
    events.addEvent = function (target, type, callback, capture) {
      return target === window && type === 'unload'
        ? add.call(this, target, 'pagehide', pageHideHandler(callback, capture), capture)
        : add.apply(this, arguments);
    };
    events.removeEvent = function (target, type, callback, capture) {
      if (target === window && type === 'unload') {
        const handler = handlers.get(callback)?.[capture ? 1 : 0];
        return handler ? remove.call(this, target, 'pagehide', handler, capture) : true;
      }
      return remove.apply(this, arguments);
    };
  }
  document.querySelector('script[src="https://api.yamli.com/js/yamli_api.js"]')?.addEventListener('load', installLifecycleAdapter, {once:true});
  installLifecycleAdapter();
})();
