// First-strong-character direction detection (Unicode bidi classes).
(function (global) {
  'use strict';

  // RTL: Hebrew, Arabic, Syriac, Thaana, NKo, Samaritan, Arabic Ext,
  // Presentation forms, etc.
  const RTL_RE = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF\u{10800}-\u{10FFF}]/u;
  // LTR: Latin, Greek, Cyrillic, Armenian, Georgian, etc.
  const LTR_RE = /[A-Za-z\u00C0-\u024F\u0370-\u04FF\u0530-\u058F\u10A0-\u10FF]/;

  function firstStrong(text) {
    for (const ch of text) {
      if (RTL_RE.test(ch)) return 'rtl';
      if (LTR_RE.test(ch)) return 'ltr';
    }
    return 'neutral';
  }

  function dirOfNode(node) {
    const t = node.nodeValue;
    if (!t) return 'neutral';
    return firstStrong(t);
  }

  // Recursive walk that skips .heading-anchor buttons.
  function dirOfElementDeep(el) {
    for (const n of el.childNodes) {
      if (n.nodeType === 3) {
        const d = dirOfNode(n);
        if (d !== 'neutral') return d;
      }
    }
    for (const n of el.childNodes) {
      if (n.nodeType === 1) {
        if (n.classList && n.classList.contains('heading-anchor')) continue;
        const d = dirOfElementDeep(n);
        if (d !== 'neutral') return d;
      }
    }
    return 'neutral';
  }

  function dirOfElement(el) {
    return dirOfElementDeep(el);
  }

  function detectDocumentDir(text) {
    return firstStrong(text || '') === 'rtl' ? 'rtl' : 'ltr';
  }

  global.Dir = { firstStrong, dirOfNode, dirOfElement, detectDocumentDir };
})(typeof window !== 'undefined' ? window : self);