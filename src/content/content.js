(() => {
  'use strict';

  function looksLikeMarkdownPage() {
    const url = location.href;
    if (/\.(md|markdown)(\?|#|$)/i.test(url)) return true;
    if (location.protocol === 'file:') return true;
    return false;
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
      const clean = url.split('#')[0].split('?')[0];
      const last = clean.substring(clean.lastIndexOf('/') + 1);
      return decodeURIComponent(last) || 'Markdown';
    } catch {
      return 'Markdown';
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
          // Header shows ONLY the file name — no URL
          title: fileNameFromUrl(location.href),
          url: location.href
        },
        '*'
      );
    });

    root.appendChild(iframe);
    document.documentElement.innerHTML = '';
    document.documentElement.appendChild(root);
  }

  function init() {
    if (!looksLikeMarkdownPage()) return;
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