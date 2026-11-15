const DEFAULTS = {
  theme: 'light',
  width: 'normal',
  dir: 'auto',
  tag: false,
  size: 16,
  sidebar: true,
  headerLangRTL: 'fa',
  headerLangLTR: 'en',
  chessPieceStyle: 'cburnett',
  chessBoardStyle: 'cream',
  fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
  fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};

const $ = (id) => document.getElementById(id);
let optionsLang = 'en';

const PREVIEW_PIECES = {
  4: 'K',
  8: 'P',
  55: 'q',
  57: 'n'
};

function updatePreview() {
  const pieceStyle = $('chessPieceStyle').value;
  const boardStyle = $('chessBoardStyle').value;

  const wrap = $('previewWrap');
  wrap.className = 'preview-board-wrap board-' + boardStyle;

  const grid = $('previewGrid');
  grid.innerHTML = '';

  for (let i = 0; i < 64; i++) {
    const sq = document.createElement('div');
    sq.className = 'preview-sq';

    const file = i % 8;
    const rank = Math.floor(i / 8);
    const isDark = (file + rank) % 2 === 0;
    sq.classList.add(isDark ? 'dark' : 'light');

    const pieceChar = PREVIEW_PIECES[i];
    if (pieceChar) {
      const isWhite = pieceChar === pieceChar.toUpperCase();
      const pieceName = (isWhite ? 'w' : 'b') + pieceChar.toUpperCase();
      const img = document.createElement('img');
      img.src = chrome.runtime.getURL('vendor/' + pieceStyle + '/1.0.0/pieces/' + pieceName + '.svg');
      img.alt = '';
      sq.appendChild(img);
    }
    grid.appendChild(sq);
  }

  const ranks = $('previewRanks');
  const files = $('previewFiles');
  ranks.innerHTML = '';
  files.innerHTML = '';
  const rankStr = '87654321';
  const fileStr = 'abcdefgh';
  for (let i = 0; i < 8; i++) {
    const r = document.createElement('span'); r.textContent = rankStr[i]; ranks.appendChild(r);
    const f = document.createElement('span'); f.textContent = fileStr[i]; files.appendChild(f);
  }
}

function applyTranslations(lang) {
  optionsLang = lang;
  const t = (key) => window.I18N.t(key, lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.documentElement.setAttribute('dir', window.I18N.dirOf(lang));
  document.documentElement.setAttribute('lang', lang);
}

function populateLangSelect(sel, dir, selected) {
  sel.innerHTML = '';
  const list = dir ? window.I18N.languagesByDir(dir) : window.I18N.languages();
  list.forEach((l) => {
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = l.name + ' (' + l.code + ')';
    if (l.code === selected) o.selected = true;
    sel.appendChild(o);
  });
}

function updateFontPreviews() {
  const rtlVal = $('fontRTL').value.trim();
  const ltrVal = $('fontLTR').value.trim();
  $('previewRTL').style.fontFamily = rtlVal || DEFAULTS.fontRTL;
  $('previewLTR').style.fontFamily = ltrVal || DEFAULTS.fontLTR;
}

function load() {
  chrome.storage.sync.get(DEFAULTS, (s) => {
    const nav = (navigator.language || 'en').split('-')[0].toLowerCase();
    const available = window.I18N.languages().map((l) => l.code);
    const pageLang = available.includes(nav) ? nav : (s.headerLangLTR || 'en');
    applyTranslations(pageLang);

    populateLangSelect($('headerLangRTL'), 'rtl', s.headerLangRTL);
    populateLangSelect($('headerLangLTR'), 'ltr', s.headerLangLTR);

    $('theme').value = s.theme;
    $('width').value = s.width;
    $('dir').value = s.dir;
    $('tag').checked = !!s.tag;
    $('size').value = s.size;
    $('sidebar').checked = s.sidebar !== false;

    $('chessPieceStyle').value = s.chessPieceStyle || DEFAULTS.chessPieceStyle;
    $('chessBoardStyle').value = s.chessBoardStyle || DEFAULTS.chessBoardStyle;

    $('fontRTL').value = s.fontRTL;
    $('fontLTR').value = s.fontLTR;

    updateFontPreviews();
    updatePreview();
  });
}

function save() {
  const s = {
    theme: $('theme').value,
    width: $('width').value,
    dir: $('dir').value,
    tag: $('tag').checked,
    size: Math.min(24, Math.max(12, Number($('size').value) || 16)),
    sidebar: $('sidebar').checked,
    headerLangRTL: $('headerLangRTL').value || 'fa',
    headerLangLTR: $('headerLangLTR').value || 'en',
    chessPieceStyle: $('chessPieceStyle').value || DEFAULTS.chessPieceStyle,
    chessBoardStyle: $('chessBoardStyle').value || DEFAULTS.chessBoardStyle,
    fontRTL: $('fontRTL').value.trim() || DEFAULTS.fontRTL,
    fontLTR: $('fontLTR').value.trim() || DEFAULTS.fontLTR,
  };
  chrome.storage.sync.set(s, () => {
    $('status').textContent = window.I18N.t('saved', optionsLang);
    setTimeout(() => { $('status').textContent = ''; }, 1500);
  });
}

$('save').addEventListener('click', save);
$('fontRTL').addEventListener('input', updateFontPreviews);
$('fontLTR').addEventListener('input', updateFontPreviews);
$('chessPieceStyle').addEventListener('change', updatePreview);
$('chessBoardStyle').addEventListener('change', updatePreview);

$('headerLangLTR').addEventListener('change', () => {
  applyTranslations($('headerLangLTR').value);
});

document.addEventListener('DOMContentLoaded', async () => {
  await window.I18N.load();
  load();
});