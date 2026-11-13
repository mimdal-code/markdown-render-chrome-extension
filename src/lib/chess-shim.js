// src/lib/chess-shim.js
// Provides the CommonJS `module` / `exports` globals that chess.js's CJS
// build expects, dynamically loads chess.js, publishes the Chess class
// onto window.Chess, then retries any pending mount requests.
//
// Why this exists: Chrome MV3 forbids inline <script> in extension pages.
// chess.js 1.4.0 ships only CJS/ESM builds, no UMD. So we provide the
// globals, load the CJS file, then move `module.exports.Chess` onto
// `window.Chess`.
(function () {
  'use strict';

  window.module = { exports: {} };
  window.exports = window.module.exports;

  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('vendor/chess.js/1.4.0/chess.js');
  script.async = false;
  script.onload = function () {
    try {
      var exp = window.module && window.module.exports;
      var Ctor = exp && (exp.Chess || (typeof exp === 'function' ? exp : null));
      if (Ctor) {
        window.Chess = Ctor;
      } else {
        console.warn('[md-rtl] chess.js loaded but no Chess class found');
      }
    } finally {
      try { delete window.module; } catch (e) {}
      try { delete window.exports; } catch (e) {}
    }

    // chess.js (our wrapper) is loaded AFTER this shim, so on the very
    // first load window.ChessBlocks may not exist yet. If it does, drain
    // the queue; if it doesn't, do nothing — chess.js will drain the
    // queue on its own first mountAll() call.
    if (window.ChessBlocks && typeof window.ChessBlocks.mountAll === 'function') {
      var content = document.getElementById('content');
      if (content) {
        try { window.ChessBlocks.mountAll(content); }
        catch (e) { console.warn('[md-rtl] chess retry failed', e); }
      }
    }
  };
  script.onerror = function () {
    console.warn('[md-rtl] failed to load vendor/chess.js/chess.js');
  };
  document.head.appendChild(script);
})();