const DEFAULTS = {
  theme: 'light',
  width: 'normal',
  dir: 'auto',
  tag: false,
  size: 16,
  sidebar: true,
  headerLangRTL: 'fa',
  headerLangLTR: 'en',
  fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
  fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};

const $ = (id) => document.getElementById(id);

let optionsLang = 'en';   // language used to render the options page

function applyTranslations(lang) {
  optionsLang = lang;
  const t = (key) => window.I18N.t(key, lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // The whole options page mirrors the chosen language's direction
  document.documentElement.setAttribute('dir', window.I18N.dirOf(lang));
  document.documentElement.setAttribute('lang', lang);
}

// Fill a <select> with languages, filtered by direction (if given).
function populateLangSelect(sel, dir, selected) {
  sel.innerHTML = '';
  const list = dir
    ? window.I18N.languagesByDir(dir)
    : window.I18N.languages();
  list.forEach((l) => {
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = `${l.name} (${l.code})`;
    if (l.code === selected) o.selected = true;
    sel.appendChild(o);
  });
}

function updatePreviews() {
  const rtlVal = $('fontRTL').value.trim();
  const ltrVal = $('fontLTR').value.trim();
  $('previewRTL').style.fontFamily = rtlVal || DEFAULTS.fontRTL;
  $('previewLTR').style.fontFamily = ltrVal || DEFAULTS.fontLTR;
}

function load() {
  chrome.storage.sync.get(DEFAULTS, (s) => {
    // Options page language:
    //   - If the browser locale is an available pack, use it.
    //   - Otherwise use the user's LTR header language (English by default).
    const nav = (navigator.language || 'en').split('-')[0].toLowerCase();
    const available = window.I18N.languages().map((l) => l.code);
    const pageLang = available.includes(nav) ? nav : (s.headerLangLTR || 'en');
    applyTranslations(pageLang);

    // Two header-language dropdowns, each filtered by direction
    populateLangSelect($('headerLangRTL'), 'rtl', s.headerLangRTL);
    populateLangSelect($('headerLangLTR'), 'ltr', s.headerLangLTR);

    $('theme').value = s.theme;
    $('width').value = s.width;
    $('dir').value = s.dir;
    $('tag').checked = !!s.tag;
    $('size').value = s.size;
    $('sidebar').checked = s.sidebar !== false;
    $('fontRTL').value = s.fontRTL;
    $('fontLTR').value = s.fontLTR;
    updatePreviews();
  });
}

function save() {
  const s = {
    theme: $('theme').value,
    width: $('width').value,
    dir: $('dir').value,
    tag: $('tag').checked,
    size: Math.min(24, Math.max(12, +$('size').value || 16)),
    sidebar: $('sidebar').checked,
    headerLangRTL: $('headerLangRTL').value || 'fa',
    headerLangLTR: $('headerLangLTR').value || 'en',
    fontRTL: $('fontRTL').value.trim() || DEFAULTS.fontRTL,
    fontLTR: $('fontLTR').value.trim() || DEFAULTS.fontLTR,
  };
  chrome.storage.sync.set(s, () => {
    $('status').textContent = window.I18N.t('saved', optionsLang);
    setTimeout(() => ($('status').textContent = ''), 1500);
  });
}

$('save').addEventListener('click', save);
$('fontRTL').addEventListener('input', updatePreviews);
$('fontLTR').addEventListener('input', updatePreviews);

// Re-translate the whole options page immediately when the user changes
// the LTR header language (the page mirrors that language's direction).
$('headerLangLTR').addEventListener('change', () => {
  applyTranslations($('headerLangLTR').value);
});

document.addEventListener('DOMContentLoaded', async () => {
  await window.I18N.load();
  load();
});