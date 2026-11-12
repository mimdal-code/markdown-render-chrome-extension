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

  const app         = document.querySelector('.app');
  const mainScroll  = document.getElementById('main-scroll');
  const content     = document.getElementById('content');
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

  let currentMarkdown = '';

  /* ---------- Settings ---------- */
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
    try { chrome.storage.sync.set(patch); } catch {}
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

  /* ---------- TOC ---------- */
  function slugify(text, used) {
    const base = text.toLowerCase().trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'section';
    let slug = base;
    let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    return slug;
  }

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
    const used = new Set();
    headings.forEach((h) => {
      const level = +h.tagName.slice(1);
      const text = h.textContent || '';
      if (!h.id) h.id = slugify(text, used);
      const a = document.createElement('a');
      a.className = `toc-item lvl-${level}`;
      a.href = `#${h.id}`;
      a.textContent = text;
      a.dataset.target = h.id;
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
        let bestId = null;
        let bestTop = Infinity;
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

let currentDocUrl = '';

function absoluteUrl(rel) {
  if (!rel) return rel;
  const s = String(rel).trim();
  if (!s) return rel;
  // Leave absolute schemes and data URIs alone
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  if (s.startsWith('//')) return s;
  if (s.startsWith('#')) return s;
  try {
    return new URL(s, currentDocUrl || location.href).href;
  } catch {
    return s;
  }
}

function rewriteRelativeUrls(root) {
  const attrs = [
    ['img', 'src'],
    ['img', 'srcset'],
    ['source', 'src'],
    ['source', 'srcset'],
    ['video', 'src'],
    ['audio', 'src'],
    ['iframe', 'src'],
    ['object', 'data'],
    ['embed', 'src'],
    ['link', 'href'],
    ['script', 'src'],
    ['a', 'href'],
  ];
  for (const [tag, attr] of attrs) {
    root.querySelectorAll(`${tag}[${attr}]`).forEach((el) => {
      const v = el.getAttribute(attr);
      if (v == null) return;
      if (attr === 'srcset') {
        // "url1 1x, url2 2x" → rewrite each URL
        const rewritten = v.split(',').map((part) => {
          const bits = part.trim().split(/\s+/);
          bits[0] = absoluteUrl(bits[0]);
          return bits.join(' ');
        }).join(', ');
        el.setAttribute(attr, rewritten);
      } else {
        el.setAttribute(attr, absoluteUrl(v));
      }
    });
  }
}

function render(md) {
  currentMarkdown = md || '';
  content.innerHTML = window.MD.render(currentMarkdown);

  // Resolve every relative URL against the original document URL
  rewriteRelativeUrls(content);

  // External links open in a new tab
  content.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });

  tagBlocks();
  buildToc();
} 
  /* ---------- Copy button (delegated) ---------- */
  content.addEventListener('click', async (e) => {
    const btn = e.target.closest('.code-copy');
    if (!btn) return;

    const wrap = btn.closest('.code-block');
    const codeEl = wrap && wrap.querySelector('pre code');
    if (!codeEl) return;

    const text = codeEl.textContent || '';
    const reset = () => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('no clipboard');
      }
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(reset, 1200);
    } catch {
      // Fallback: hidden textarea + execCommand
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
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(reset, 1200);
      } else {
        btn.textContent = 'Failed';
        setTimeout(reset, 1200);
      }
    }
  });

  /* ---------- Message from content script ---------- */
  window.addEventListener('message', async (e) => {
    if (!e.data || e.data.type !== 'MD_RTL_RENDER') return;
    currentDocUrl = e.data.url || '';      // <-- NEW: capture source URL
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

  /* ---------- Keyboard shortcut ---------- */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleBtn.click();
    }
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
  })();
})();