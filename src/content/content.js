// Runs ONLY on .md / .markdown pages.
// Reads the raw markdown DIRECTLY from the page's <pre> element.
// No fetch → no CORS → works on file:// out of the box.
(() => {
  'use strict';

  const MD_EXT = /\.(md|markdown)(?:[?#]|$)/i;

  function isMarkdownUrl() {
    try {
      const u = new URL(location.href);
      return MD_EXT.test(u.pathname);
    } catch {
      return MD_EXT.test(location.href);
    }
  }

  function extractRawText() {
    const pre = document.querySelector('body > pre');
    if (pre && pre.textContent) return pre.textContent;

    const body = document.body;
    if (body && body.children.length <= 1) {
      return body.innerText || body.textContent || '';
    }
    return '';
  }

  function fileNameFromUrl(url) {
    try {
      const u = new URL(url);
      const last = u.pathname.substring(u.pathname.lastIndexOf('/') + 1);
      return decodeURIComponent(last) || 'Markdown';
    } catch {
      const clean = String(url).split('#')[0].split('?')[0];
      const last = clean.substring(clean.lastIndexOf('/') + 1);
      try { return decodeURIComponent(last) || 'Markdown'; }
      catch { return 'Markdown'; }
    }
  }

  function renderViewer(text) {
    if (document.getElementById('md-rtl-viewer-root')) return;

    const root = document.createElement('div');
    root.id = 'md-rtl-viewer-root';
    root.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;background:#fff;overflow:auto;';

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('src/viewer/viewer.html');
    iframe.style.cssText = 'border:0;width:100%;height:100%;display:block;';
    iframe.setAttribute('title', 'Markdown viewer');

    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage(
        {
          type: 'MD_RTL_RENDER',
          markdown: text,
          title: fileNameFromUrl(location.href),
          url: location.href,
        },
        '*'
      );
    });

    root.appendChild(iframe);
    document.documentElement.innerHTML = '';
    document.documentElement.appendChild(root);
  }

  function init() {
    // Only run on Markdown files — never on other file types.
    if (!isMarkdownUrl()) return;
    if (document.getElementById('md-rtl-viewer-root')) return;

    const text = extractRawText();
    if (!text || !text.trim()) {
      console.warn('[md-rtl] no markdown text found on page');
      return;
    }
    renderViewer(text);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();