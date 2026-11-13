(() => {
  'use strict';

  const DEFAULTS = {
    theme: 'light',
    dir: 'auto',
    tag: false,
    size: 16,
    sidebar: true,
    width: 'normal',
    fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
    fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  };

  const $ = (id) => document.getElementById(id);
  const app          = document.querySelector('.app');
  const mainScroll   = $('main-scroll');
  const content      = $('content');
  const docTitle     = $('doc-title');
  const themeSel     = $('theme');
  const dirSel       = $('dir');
  const tagChk       = $('tag');
  const sizeInput    = $('size');
  const widthSel     = $('width');
  const toc          = $('toc');
  const toggleBtn    = $('toggle-sidebar');
  const sbTabs       = document.querySelectorAll('.sb-tab');
  const paneToc      = document.querySelector('.pane-toc');
  const paneFiles    = document.querySelector('.pane-files');

  const searchWrap   = $('search-wrap');
  const searchInput  = $('search-input');
  const searchCount  = $('search-count');
  const searchPrev   = $('search-prev');
  const searchNext   = $('search-next');
  const searchClear  = $('search-clear');

  const helpBtn      = $('help-btn');
  const helpBackdrop = $('help-backdrop');
  const helpClose    = $('help-close');

  let currentMarkdown = '';
  let currentDocUrl   = '';
  let currentDocKey   = '';

  let matches = [];
  let activeMatch = -1;

  // Force help hidden on load
  if (helpBackdrop) helpBackdrop.hidden = true;

  /* ---------- Settings ---------- */
  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(DEFAULTS, (s) => resolve({ ...DEFAULTS, ...s }));
      } catch { resolve({ ...DEFAULTS }); }
    });
  }
  function saveSettings(patch) {
    try { chrome.storage.sync.set(patch); } catch {}
  }
  function saveLocal(key, value) {
    try { chrome.storage.local.set({ [key]: value }); } catch {}
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
    } else {
      document.documentElement.setAttribute('dir', d);
      document.documentElement.setAttribute('lang', d === 'rtl' ? 'fa' : 'en');
    }
  }
  function applySidebar(v) { app.classList.toggle('sidebar-collapsed', !v); }

  /* ---------- Per-block bidi ---------- */
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

  /* ---------- TOC ---------- */
  function buildToc() {
    toc.innerHTML = '';
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headings.length) {
      const e = document.createElement('div');
      e.className = 'toc-empty';
      e.textContent = 'No headings in this document.';
      toc.appendChild(e);
      return;
    }
    headings.forEach((h) => {
      const level = +h.tagName.slice(1);
      const text = h.querySelector('.heading-text')?.textContent || h.textContent || '';
      const a = document.createElement('a');
      a.className = `toc-item lvl-${level}`;
      a.href = `#${h.id}`;
      a.textContent = text;
      a.dataset.target = h.id;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToHeading(h.id);
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

  function scrollToHeading(id) {
    const h = content.querySelector('#' + CSS.escape(id));
    if (!h) return;
    const offset = h.getBoundingClientRect().top - mainScroll.getBoundingClientRect().top;
    mainScroll.scrollBy({ top: offset - 8, behavior: 'smooth' });
  }

  function headingList() {
    return Array.from(content.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  }

  /* ---------- Render ---------- */
  function render(md) {
    currentMarkdown = md || '';
    clearHighlightsOnly();
    content.innerHTML = window.MD.render(currentMarkdown);

    rewriteRelativeUrls(content);

    content.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });

    restoreTaskStates();
    tagBlocks();
    buildToc();

    if (searchInput.value) {
      runSearch();
    } else {
      updateSearchUI();
    }
  }

  /* ---------- URL rewriting ---------- */
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
      ['img', 'src'], ['img', 'srcset'], ['source', 'src'], ['source', 'srcset'],
      ['video', 'src'], ['audio', 'src'], ['iframe', 'src'], ['object', 'data'],
      ['embed', 'src'], ['link', 'href'], ['script', 'src'], ['a', 'href'],
    ];
    for (const [tag, attr] of attrs) {
      root.querySelectorAll(`${tag}[${attr}]`).forEach((el) => {
        const v = el.getAttribute(attr);
        if (v == null) return;
        if (attr === 'srcset') {
          el.setAttribute(attr, v.split(',').map((p) => {
            const bits = p.trim().split(/\s+/);
            bits[0] = absoluteUrl(bits[0]);
            return bits.join(' ');
          }).join(', '));
        } else {
          el.setAttribute(attr, absoluteUrl(v));
        }
      });
    }
  }

  /* ---------- Task persistence ---------- */
  function taskKey(el) {
    const all = Array.from(content.querySelectorAll('input.task-checkbox[data-task]'));
    const idx = all.indexOf(el);
    return `${currentDocKey}::task::${idx}`;
  }

  function restoreTaskStates() {
    if (!currentDocKey) return;
    const tasks = content.querySelectorAll('input.task-checkbox[data-task]');
    if (!tasks.length) return;
    try {
      chrome.storage.local.get(null, (all) => {
        tasks.forEach((cb) => {
          const key = taskKey(cb);
          if (Object.prototype.hasOwnProperty.call(all, key)) {
            cb.checked = !!all[key];
          }
        });
      });
    } catch {}
  }

  /* ---------- Copy code & heading anchor ---------- */
  content.addEventListener('click', async (e) => {
    const btn = e.target.closest('.code-copy');
    if (btn) {
      const wrap = btn.closest('.code-block');
      const codeEl = wrap && wrap.querySelector('pre code');
      if (!codeEl) return;
      await copyText(codeEl.textContent || '', btn);
      return;
    }

    const anchor = e.target.closest('.heading-anchor');
    if (anchor) {
      const id = anchor.getAttribute('data-anchor');
      const base = currentDocUrl || location.href;
      const url = base.split('#')[0] + '#' + id;
      try {
        await navigator.clipboard.writeText(url);
        const old = anchor.textContent;
        anchor.textContent = '✓';
        anchor.classList.add('copied');
        setTimeout(() => {
          anchor.textContent = old;
          anchor.classList.remove('copied');
        }, 1000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      }
    }
  });

  async function copyText(text, btn) {
    const reset = () => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else { throw new Error('no clipboard'); }
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(reset, 1200);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      btn.textContent = ok ? 'Copied' : 'Failed';
      btn.classList.add('copied');
      setTimeout(reset, 1200);
    }
  }

  /* ---------- Task checkbox handler ---------- */
  content.addEventListener('change', (e) => {
    const cb = e.target.closest('input.task-checkbox[data-task]');
    if (!cb) return;
    const key = taskKey(cb);
    saveLocal(key, cb.checked);
  });

  /* ============================================================
     SEARCH
     ============================================================ */

  function clearHighlightsOnly() {
    content.querySelectorAll('mark.search-hit').forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    matches = [];
    activeMatch = -1;
  }

  function clearSearch() {
    clearHighlightsOnly();
    searchInput.value = '';
    searchCount.textContent = '';
    searchWrap.classList.remove('has-query', 'has-match', 'has-active');
  }

  function updateSearchUI() {
    const total = matches.length;
    if (!searchInput.value) {
      searchCount.textContent = '';
      searchWrap.classList.remove('has-query', 'has-match', 'has-active');
      return;
    }
    searchWrap.classList.add('has-query');
    if (total === 0) {
      searchCount.textContent = '0';
      searchWrap.classList.remove('has-match', 'has-active');
    } else {
      searchCount.textContent = `${activeMatch + 1} / ${total}`;
      searchWrap.classList.add('has-match');
      searchWrap.classList.toggle('has-active', activeMatch >= 0);
    }
  }

  function runSearch() {
    clearHighlightsOnly();
    const q = searchInput.value;
    if (!q) { updateSearchUI(); return; }

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('.code-copy, .heading-anchor, .task-checkbox, .task-label input')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    const lower = q.toLowerCase();
    const ranges = [];
    nodes.forEach((textNode) => {
      const hay = textNode.nodeValue.toLowerCase();
      let from = 0;
      while (true) {
        const idx = hay.indexOf(lower, from);
        if (idx === -1) break;
        const r = document.createRange();
        r.setStart(textNode, idx);
        r.setEnd(textNode, idx + q.length);
        ranges.push(r);
        from = idx + q.length;
      }
    });

    ranges.forEach((range, i) => {
      try {
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.dataset.index = String(i);
        range.surroundContents(mark);
        matches.push({ range: null, mark, parent: mark.parentNode });
      } catch {}
    });

    matches.sort((a, b) => {
      const pos = a.mark.compareDocumentPosition(b.mark);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    matches.forEach((m, i) => (m.mark.dataset.index = String(i)));

    if (matches.length) {
      activeMatch = 0;
      scrollToMatch(0);
    }
    updateSearchUI();
  }

  function scrollToMatch(i) {
    if (i < 0 || i >= matches.length) return;
    const mark = matches[i].mark;
    mark.classList.add('search-active');
    const offset = mark.getBoundingClientRect().top - mainScroll.getBoundingClientRect().top;
    mainScroll.scrollBy({ top: offset - mainScroll.clientHeight * 0.35, behavior: 'smooth' });
  }

  function activateMatch(i) {
    if (!matches.length) return;
    if (activeMatch >= 0 && matches[activeMatch]) {
      matches[activeMatch].mark.classList.remove('search-active');
    }
    activeMatch = (i + matches.length) % matches.length;
    scrollToMatch(activeMatch);
    updateSearchUI();
  }

  function nextMatch() { if (matches.length) activateMatch(activeMatch + 1); }
  function prevMatch() { if (matches.length) activateMatch(activeMatch - 1); }

  searchInput.addEventListener('input', runSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) prevMatch(); else nextMatch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearSearch();
      searchInput.blur();
    }
  });

  searchNext.addEventListener('click', nextMatch);
  searchPrev.addEventListener('click', prevMatch);
  searchClear.addEventListener('click', () => {
    clearSearch();
    searchInput.focus();
  });

  /* ============================================================
     HELP MODAL
     ============================================================ */

  function openHelp() {
    helpBackdrop.hidden = false;
    helpClose.focus();
    try {
      const v = chrome.runtime.getManifest().version;
      const el = $('help-version');
      if (el) el.textContent = v;
    } catch {}
  }
  function closeHelp() {
    helpBackdrop.hidden = true;
  }
  helpBtn.addEventListener('click', openHelp);
  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', (e) => {
    if (e.target === helpBackdrop) closeHelp();
  });

  /* ============================================================
     GLOBAL KEYBOARD
     ============================================================ */

  let lastKey = '';
  let lastKeyTime = 0;

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (e.key === 'Escape') {
      if (!helpBackdrop.hidden) {
        e.preventDefault();
        closeHelp();
        return;
      }
      if (document.activeElement === searchInput) {
        e.preventDefault();
        clearSearch();
        searchInput.blur();
        return;
      }
      return;
    }

    const tag = (e.target && e.target.tagName) || '';
    const isFormField =
      tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' ||
      (e.target && e.target.isContentEditable);
    if (isFormField) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;

    if (key === '?') {
      e.preventDefault();
      openHelp();
      return;
    }

    if (key === 'j' || key === 'k') {
      e.preventDefault();
      const headings = headingList();
      if (!headings.length) return;
      const y = mainScroll.getBoundingClientRect().top + 8;
      if (key === 'j') {
        const next = headings.find((h) => h.getBoundingClientRect().top > y + 8);
        if (next) scrollToHeading(next.id);
      } else {
        const prev = [...headings].reverse().find((h) => h.getBoundingClientRect().top < y - 8);
        if (prev) scrollToHeading(prev.id);
      }
      return;
    }

    if (key === 'G') {
      e.preventDefault();
      mainScroll.scrollTo({ top: mainScroll.scrollHeight, behavior: 'smooth' });
      return;
    }
    if (key === 'g') {
      const now = Date.now();
      if (lastKey === 'g' && now - lastKeyTime < 500) {
        e.preventDefault();
        mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        lastKey = '';
      } else {
        lastKey = 'g';
        lastKeyTime = now;
      }
      return;
    }

    if (key === '[') {
      e.preventDefault();
      toggleBtn.click();
      return;
    }

    if (key === 'n') {
      if (matches.length) { e.preventDefault(); nextMatch(); }
      return;
    }
    if (key === 'N') {
      if (matches.length) { e.preventDefault(); prevMatch(); }
      return;
    }
  });

  /* ============================================================
     MESSAGE / INIT
     ============================================================ */

  window.addEventListener('message', async (e) => {
    if (!e.data || e.data.type !== 'MD_RTL_RENDER') return;

    currentDocUrl = e.data.url || '';
    currentDocKey = currentDocUrl || ('doc:' + (e.data.title || 'untitled'));

    docTitle.textContent = e.data.title || 'Markdown';
    docTitle.title = e.data.title || '';

    render(e.data.markdown);

    const s = await loadSettings();
    themeSel.value = s.theme;
    dirSel.value = s.dir;
    tagChk.checked = !!s.tag;
    sizeInput.value = s.size;
    widthSel.value = s.width;

    applyTheme(s.theme);
    applyWidth(s.width);
    applyDir(s.dir);
    applySize(s.size);
    applySidebar(s.sidebar);
    applyFonts(s.fontRTL, s.fontLTR);
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
  });
  tagChk.addEventListener('change', () => {
    saveSettings({ tag: tagChk.checked });
    tagBlocks();
  });
  sizeInput.addEventListener('input', () => {
    applySize(sizeInput.value);
    saveSettings({ size: +sizeInput.value });
  });

  /* ---------- Init ---------- */
  (async () => {
    const s = await loadSettings();
    themeSel.value = s.theme;
    dirSel.value = s.dir;
    tagChk.checked = !!s.tag;
    sizeInput.value = s.size;
    widthSel.value = s.width;
    applyTheme(s.theme);
    applyWidth(s.width);
    applyDir(s.dir);
    applySize(s.size);
    applySidebar(s.sidebar);
    applyFonts(s.fontRTL, s.fontLTR);

    if (helpBackdrop) helpBackdrop.hidden = true;
  })();
})();