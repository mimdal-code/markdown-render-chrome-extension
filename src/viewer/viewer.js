(() => {
  'use strict';

  const DEFAULTS = {
    theme: 'light',
    dir: 'auto',
    tag: false,
    size: 16,
    sidebar: true,
    width: 'normal',
    headerLangRTL: 'fa',
    headerLangLTR: 'en',
    fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
    fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  };

  const app         = document.querySelector('.app');
  const toolbar     = document.querySelector('.toolbar');
  const sidebar     = document.querySelector('.sidebar');
  const mainScroll  = document.getElementById('main-scroll');
  const content     = document.getElementById('content');
  const docTitle    = document.getElementById('doc-title');
  const themeSel    = document.getElementById('theme');
  const dirSel      = document.getElementById('dir');
  const tagChk      = document.getElementById('tag');
  const sizeInput   = document.getElementById('size');
  const widthSel    = document.getElementById('width');
  const toc         = document.getElementById('toc');
  const toggleBtn   = document.getElementById('toggle-sidebar');
  const sbTabs      = document.querySelectorAll('.sb-tab');
  const paneToc     = document.querySelector('.pane-toc');
  const paneFiles   = document.querySelector('.pane-files');
  const helpBtn     = document.getElementById('help-btn');

  const searchInput = document.getElementById('search-input');
  const searchCount = document.getElementById('search-count');
  const searchPrev  = document.getElementById('search-prev');
  const searchNext  = document.getElementById('search-next');
  const searchClear = document.getElementById('search-clear');

  let currentMarkdown = '';
  let currentDocUrl = '';
  let settings = { ...DEFAULTS };

  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(DEFAULTS, (s) => resolve({ ...DEFAULTS, ...s }));
      } catch {
        resolve({ ...DEFAULTS });
      }
    });
  }
  function saveSettings(patch) {
    Object.assign(settings, patch);
    try { chrome.storage.sync.set(patch); } catch {}
  }

  /* ---------- Task-list state ---------- */
  const TASK_PREFIX = 'md-rtl-task:';

  function taskStorageKey(li) {
    const list = li.closest('ul');
    if (!list) return null;
    const allLists = Array.from(content.querySelectorAll('ul'));
    const listIdx = allLists.indexOf(list);
    const itemIdx = li.dataset.taskIndex;
    if (listIdx < 0 || itemIdx == null) return null;
    const docKey = (currentDocUrl || location.href).split('#')[0];
    return `${TASK_PREFIX}${docKey}:${listIdx}:${itemIdx}`;
  }

  function restoreTaskState() {
    content.querySelectorAll('li.task-item').forEach((li) => {
      const key = taskStorageKey(li);
      if (!key) return;
      let stored = null;
      try { stored = localStorage.getItem(key); } catch {}
      if (stored === null) return;
      const checked = stored === '1';
      const cb = li.querySelector('input.task-checkbox');
      if (cb) cb.checked = checked;
      li.classList.toggle('task-done', checked);
    });
  }

  function saveTaskState(li, checked) {
    const key = taskStorageKey(li);
    if (!key) return;
    try { localStorage.setItem(key, checked ? '1' : '0'); } catch {}
  }

  /* ---------- Locale switching ---------- */
  function currentHeaderDir() {
    return toolbar.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
  }
  function langForDir(dir) {
    return dir === 'rtl' ? settings.headerLangRTL : settings.headerLangLTR;
  }

  function applyHeaderLocale() {
    const dir = currentHeaderDir();
    const lang = langForDir(dir);
    const t = (key) => window.I18N.t(key, lang);

    toolbar.setAttribute('dir', dir);
    toolbar.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    const setAttr = (el, name, key) => { if (el) el.setAttribute(name, t(key)); };
    setAttr(toggleBtn, 'title', 'toggle_sidebar');
    setAttr(toggleBtn, 'aria-label', 'toggle_sidebar');
    setAttr(searchInput, 'placeholder', 'search_placeholder');
    setAttr(searchInput, 'aria-label', 'search_placeholder');
    setAttr(searchPrev, 'title', 'search_prev');
    setAttr(searchPrev, 'aria-label', 'search_prev');
    setAttr(searchNext, 'title', 'search_next');
    setAttr(searchNext, 'aria-label', 'search_next');
    setAttr(searchClear, 'title', 'search_clear');
    setAttr(searchClear, 'aria-label', 'search_clear');
    setAttr(helpBtn, 'title', 'help');
    setAttr(helpBtn, 'aria-label', 'help');

    sidebar.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    if (searchMatches.length) updateSearchCount();
  }

  /* ---------- Apply settings ---------- */
  function applyTheme(t)  { document.documentElement.setAttribute('data-theme', t); }
  function applyWidth(w)  {
    const valid = ['narrow', 'normal', 'wide'].includes(w) ? w : 'normal';
    document.documentElement.setAttribute('data-width', valid);
  }
  function applySize(n)   { document.documentElement.style.setProperty('--fs', n + 'px'); }
  function applyFonts(r, l) {
    const root = document.documentElement;
    if (r && r.trim()) root.style.setProperty('--font-rtl', r);
    if (l && l.trim()) root.style.setProperty('--font-ltr', l);
  }
  function applyDir(d) {
    if (d === 'auto') {
      const primary = window.Dir.detectDocumentDir(currentMarkdown);
      document.documentElement.setAttribute('dir', primary);
      document.documentElement.setAttribute('lang', primary === 'rtl' ? 'fa' : 'en');
      toolbar.setAttribute('dir', primary);
    } else {
      document.documentElement.setAttribute('dir', d);
      document.documentElement.setAttribute('lang', d === 'rtl' ? 'fa' : 'en');
      toolbar.setAttribute('dir', d);
    }
    applyHeaderLocale();
  }
  function applySidebar(v) { app.classList.toggle('sidebar-collapsed', !v); }

  /* ---------- Per-block bidi tagging ---------- */
  function tagBlocks() {
    if (!tagChk.checked) {
      content.querySelectorAll('[data-dir]').forEach((el) => el.removeAttribute('data-dir'));
      return;
    }
    const blocks = content.querySelectorAll(
      'p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, figcaption'
    );
    blocks.forEach((el) => {
      const d = window.Dir.dirOfElement(el);
      if (d === 'rtl' || d === 'ltr') el.setAttribute('data-dir', d);
      else el.removeAttribute('data-dir');
    });
  }

  function tagHeadings() {
    content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      const d = window.Dir.firstStrong(h.textContent || '');
      if (d === 'rtl' || d === 'ltr') h.setAttribute('data-dir', d);
      else h.removeAttribute('data-dir');
    });
  }

  /* ---------- URL resolution ---------- */
  function absoluteUrl(rel) {
    if (!rel) return rel;
    const s = String(rel).trim();
    if (!s) return rel;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
    if (s.startsWith('//')) return s;
    if (s.startsWith('#')) return s;
    try { return new URL(s, currentDocUrl || location.href).href; }
    catch { return s; }
  }

  function rewriteRelativeUrls(root) {
    const attrs = [
      ['img', 'src'], ['img', 'srcset'],
      ['source', 'src'], ['source', 'srcset'],
      ['video', 'src'], ['audio', 'src'],
      ['iframe', 'src'], ['object', 'data'], ['embed', 'src'],
      ['link', 'href'], ['script', 'src'], ['a', 'href'],
    ];
    for (const [tag, attr] of attrs) {
      root.querySelectorAll(`${tag}[${attr}]`).forEach((el) => {
        const v = el.getAttribute(attr);
        if (v == null) return;
        if (attr === 'srcset') {
          el.setAttribute(attr, v.split(',').map((part) => {
            const bits = part.trim().split(/\s+/);
            bits[0] = absoluteUrl(bits[0]);
            return bits.join(' ');
          }).join(', '));
        } else {
          el.setAttribute(attr, absoluteUrl(v));
        }
      });
    }
  }

  /* ---------- TOC ---------- */
  function buildToc() {
    toc.innerHTML = '';
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headings.length) {
      const e = document.createElement('div');
      e.className = 'toc-empty';
      e.textContent = window.I18N.t('no_headings', langForDir(currentHeaderDir()));
      toc.appendChild(e);
      return;
    }
    headings.forEach((h) => {
      const level = +h.tagName.slice(1);
      const text = h.textContent || '';
      const a = document.createElement('a');
      a.className = `toc-item lvl-${level}`;
      a.href = `#${h.id}`;
      a.textContent = text;
      a.dataset.target = h.id;
      a.setAttribute('dir', 'auto');
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const offset = h.getBoundingClientRect().top - mainScroll.getBoundingClientRect().top;
        mainScroll.scrollBy({ top: offset - 8, behavior: 'smooth' });
        setActiveToc(h.id);
      });
      toc.appendChild(a);
    });
    observeHeadings(headings);
  }

  let io = null;
  function observeHeadings(headings) {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    const visible = new Map();
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) visible.set(en.target.id, en.intersectionRatio);
          else visible.delete(en.target.id);
        });
        if (!visible.size) return;
        let bestId = null, bestTop = Infinity;
        headings.forEach((h) => {
          if (!visible.has(h.id)) return;
          const top = h.getBoundingClientRect().top;
          if (top < bestTop) { bestTop = top; bestId = h.id; }
        });
        if (bestId) setActiveToc(bestId);
      },
      { root: mainScroll, rootMargin: '-10% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    headings.forEach((h) => io.observe(h));
  }

  function setActiveToc(id) {
    toc.querySelectorAll('.toc-item').forEach((a) => {
      a.classList.toggle('active', a.dataset.target === id);
    });
    const active = toc.querySelector('.toc-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- Render ---------- */
  function render(md) {
    currentMarkdown = md || '';
    content.innerHTML = window.MD.render(currentMarkdown);

    // Mount chess blocks (FEN + PGN) from ```chess fenced code blocks
    if (window.ChessBlocks && typeof window.ChessBlocks.mountAll === 'function') {
      try { window.ChessBlocks.mountAll(content); }
      catch (e) { console.warn('[md-rtl] chess mount failed', e); }
    }

    tagHeadings();
    rewriteRelativeUrls(content);
    content.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
    tagBlocks();
    buildToc();
    restoreTaskState();

    const lang = langForDir(currentHeaderDir());
    content.querySelectorAll('.code-copy').forEach((btn) => {
      if (!btn.textContent || btn.textContent === 'Copy') {
        btn.textContent = window.I18N.t('copy', lang);
      }
    });
  }

  /* ---------- Search ---------- */
  let searchMatches = [];
  let searchIndex = -1;
  let searchDebounce = null;

  function clearSearchHighlight() {
    content.querySelectorAll('mark.search-hit').forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    searchMatches = [];
    searchIndex = -1;
    searchCount.textContent = '';
  }

  function runSearch(query) {
    clearSearchHighlight();
    const q = (query || '').trim();
    if (!q) return;

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    const lowerQ = q.toLowerCase();
    textNodes.forEach((node) => {
      const text = node.nodeValue || '';
      const lower = text.toLowerCase();
      let idx = 0;
      const ranges = [];
      while ((idx = lower.indexOf(lowerQ, idx)) !== -1) {
        ranges.push([idx, idx + q.length]);
        idx += q.length;
      }
      if (!ranges.length) return;

      const frag = document.createDocumentFragment();
      let last = 0;
      ranges.forEach(([s, e]) => {
        if (s > last) frag.appendChild(document.createTextNode(text.slice(last, s)));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = text.slice(s, e);
        frag.appendChild(mark);
        last = e;
      });
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });

    searchMatches = Array.from(content.querySelectorAll('mark.search-hit'));
    if (!searchMatches.length) {
      searchCount.textContent = window.I18N.t('search_no_results', langForDir(currentHeaderDir()));
      searchIndex = -1;
      return;
    }
    searchIndex = 0;
    updateSearchCount();
    focusMatch(0);
  }

  function updateSearchCount() {
    if (!searchMatches.length) { searchCount.textContent = ''; return; }
    const lang = langForDir(currentHeaderDir());
    searchCount.textContent = window.I18N.tReplace('search_results',
      { n: searchIndex + 1, total: searchMatches.length }, lang);
  }

  function focusMatch(i) {
    if (!searchMatches.length) return;
    if (i < 0) i = searchMatches.length - 1;
    if (i >= searchMatches.length) i = 0;
    searchIndex = i;
    searchMatches.forEach((m, idx) => m.classList.toggle('active', idx === i));
    const el = searchMatches[i];
    const offset = el.getBoundingClientRect().top - mainScroll.getBoundingClientRect().top;
    mainScroll.scrollBy({ top: offset - 80, behavior: 'smooth' });
    updateSearchCount();
  }

  function nextMatch() { if (searchMatches.length) focusMatch(searchIndex + 1); }
  function prevMatch() { if (searchMatches.length) focusMatch(searchIndex - 1); }

  searchInput.addEventListener('input', () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => runSearch(searchInput.value), 180);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) prevMatch();
      else nextMatch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearSearchHighlight();
      searchInput.value = '';
      searchInput.blur();
    }
  });

  searchPrev.addEventListener('click', prevMatch);
  searchNext.addEventListener('click', nextMatch);
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchHighlight();
    searchInput.focus();
  });

  /* ---------- Delegated content clicks ---------- */
  content.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.code-copy');
    const anchorBtn = e.target.closest('.heading-anchor');

    if (anchorBtn) {
      const id = anchorBtn.getAttribute('data-anchor');
      const url = currentDocUrl ? `${currentDocUrl.split('#')[0]}#${id}` : `#${id}`;
      try { await navigator.clipboard.writeText(url); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      }
      const old = anchorBtn.textContent;
      anchorBtn.textContent = '✓';
      setTimeout(() => { anchorBtn.textContent = old; }, 900);
      return;
    }

    if (!copyBtn) return;

    const wrap = copyBtn.closest('.code-block');
    const codeEl = wrap && wrap.querySelector('pre code');
    if (!codeEl) return;

    const lang = langForDir(currentHeaderDir());
    const text = codeEl.textContent || '';
    const reset = () => {
      copyBtn.textContent = window.I18N.t('copy', lang);
      copyBtn.classList.remove('copied');
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('no clipboard');
      }
      copyBtn.textContent = window.I18N.t('copied', lang);
      copyBtn.classList.add('copied');
      setTimeout(reset, 1200);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      if (ok) {
        copyBtn.textContent = window.I18N.t('copied', lang);
        copyBtn.classList.add('copied');
        setTimeout(reset, 1200);
      } else {
        copyBtn.textContent = window.I18N.t('copy_failed', lang);
        setTimeout(reset, 1200);
      }
    }
  });

  /* ---------- Task checkbox changes ---------- */
  content.addEventListener('change', (e) => {
    const cb = e.target.closest('input.task-checkbox');
    if (!cb) return;
    const li = cb.closest('li.task-item');
    if (!li) return;
    li.classList.toggle('task-done', cb.checked);
    saveTaskState(li, cb.checked);
  });

  /* ---------- Help modal ---------- */
  function showHelp() {
    const existing = document.getElementById('help-modal');
    if (existing) { existing.remove(); return; }

    const dir = currentHeaderDir();
    const lang = langForDir(dir);
    const t = (key) => window.I18N.t(key, lang);

    const overlay = document.createElement('div');
    overlay.id = 'help-modal';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;';

    const box = document.createElement('div');
    box.style.cssText =
      'max-width:520px;width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--bd);padding:22px 24px;font-size:14px;line-height:1.6;';
    box.setAttribute('dir', dir);

    const title = document.createElement('h3');
    title.style.cssText = 'margin:0 0 14px;font-size:1.05rem;';
    title.textContent = t('help_title');

    const body = document.createElement('pre');
    body.style.cssText =
      'margin:0;font-family:var(--font-mono);font-size:13px;white-space:pre-wrap;color:var(--fg-soft);background:var(--card);padding:12px 14px;border:1px solid var(--bd);';
    body.textContent = t('help_body');

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText =
      'margin-top:16px;padding:8px 16px;background:var(--accent);color:#fff;border:0;font-weight:600;cursor:pointer;float:inline-end;';
    closeBtn.onclick = () => overlay.remove();

    box.appendChild(title);
    box.appendChild(body);
    box.appendChild(closeBtn);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }
  helpBtn.addEventListener('click', showHelp);

  /* ---------- Message handler ---------- */
  window.addEventListener('message', async (e) => {
    if (!e.data || e.data.type !== 'MD_RTL_RENDER') return;
    currentDocUrl = e.data.url || '';
    docTitle.textContent = e.data.title || 'Markdown';
    docTitle.title = e.data.title || '';

    settings = await loadSettings();
    await window.I18N.load();

    render(e.data.markdown);

    themeSel.value = settings.theme;
    dirSel.value = settings.dir;
    tagChk.checked = !!settings.tag;
    sizeInput.value = settings.size;
    widthSel.value = settings.width;

    applyTheme(settings.theme);
    applyWidth(settings.width);
    applySize(settings.size);
    applySidebar(settings.sidebar);
    applyFonts(settings.fontRTL, settings.fontLTR);
    applyDir(settings.dir);
    tagBlocks();
  });

  /* ---------- Sidebar ---------- */
  toggleBtn.addEventListener('click', () => {
    const collapsed = app.classList.toggle('sidebar-collapsed');
    saveSettings({ sidebar: !collapsed });
  });

  sbTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      sbTabs.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const pane = btn.dataset.pane;
      paneToc.hidden = pane !== 'toc';
      paneFiles.hidden = pane !== 'files';
    });
  });

  /* ---------- Controls ---------- */
  themeSel.addEventListener('change', () => {
    applyTheme(themeSel.value);
    saveSettings({ theme: themeSel.value });
  });
  widthSel.addEventListener('change', () => {
    applyWidth(widthSel.value);
    saveSettings({ width: widthSel.value });
  });
  dirSel.addEventListener('change', () => {
    applyDir(dirSel.value);
    saveSettings({ dir: dirSel.value });
    tagBlocks();
    const lang = langForDir(currentHeaderDir());
    content.querySelectorAll('.code-copy').forEach((btn) => {
      if (!btn.classList.contains('copied')) btn.textContent = window.I18N.t('copy', lang);
    });
    if (searchMatches.length) updateSearchCount();
  });
  tagChk.addEventListener('change', () => {
    saveSettings({ tag: tagChk.checked });
    tagBlocks();
  });
  sizeInput.addEventListener('input', () => {
    applySize(sizeInput.value);
    saveSettings({ size: +sizeInput.value });
  });

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleBtn.click();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      const article = content;
      const scrollBox = mainScroll;
      console.log('[md-rtl] Ctrl+P print requested', {
        docUrl: currentDocUrl,
        theme: document.documentElement.getAttribute('data-theme'),
        width: document.documentElement.getAttribute('data-width'),
        articleHeight: article ? article.scrollHeight : null,
        articleWidth: article ? article.scrollWidth : null,
        scrollBoxHeight: scrollBox ? scrollBox.clientHeight : null,
        scrollBoxScrollHeight: scrollBox ? scrollBox.scrollHeight : null,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        pageCount: article && scrollBox
          ? Math.ceil(scrollBox.scrollHeight / scrollBox.clientHeight)
          : null,
      });
    }
    if (typing) return;
    if (e.key === '?') {
      e.preventDefault();
      showHelp();
    }
  });

  /* ---------- Init ---------- */
  (async () => {
    settings = await loadSettings();
    await window.I18N.load();

    themeSel.value = settings.theme;
    dirSel.value = settings.dir;
    tagChk.checked = !!settings.tag;
    sizeInput.value = settings.size;
    widthSel.value = settings.width;

    applyTheme(settings.theme);
    applyWidth(settings.width);
    applySize(settings.size);
    applySidebar(settings.sidebar);
    applyFonts(settings.fontRTL, settings.fontLTR);
    applyDir(settings.dir);
  })();
})();