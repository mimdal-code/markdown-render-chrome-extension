const DEFAULTS = {
  theme: 'light',
  width: 'normal',
  dir: 'auto',
  tag: false,
  size: 16,
  sidebar: true,
  fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
  fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};

const $ = (id) => document.getElementById(id);

function load() {
  chrome.storage.sync.get(DEFAULTS, (s) => {
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

function updatePreviews() {
  const rtlVal = $('fontRTL').value.trim();
  const ltrVal = $('fontLTR').value.trim();
  $('previewRTL').style.fontFamily = rtlVal || DEFAULTS.fontRTL;
  $('previewLTR').style.fontFamily = ltrVal || DEFAULTS.fontLTR;
}

function save() {
  const s = {
    theme: $('theme').value,
    width: $('width').value,
    dir: $('dir').value,
    tag: $('tag').checked,
    size: Math.min(24, Math.max(12, +$('size').value || 16)),
    sidebar: $('sidebar').checked,
    fontRTL: $('fontRTL').value.trim() || DEFAULTS.fontRTL,
    fontLTR: $('fontLTR').value.trim() || DEFAULTS.fontLTR,
  };
  chrome.storage.sync.set(s, () => {
    $('status').textContent = 'Saved ✓';
    setTimeout(() => ($('status').textContent = ''), 1500);
  });
}

$('save').addEventListener('click', save);
$('fontRTL').addEventListener('input', updatePreviews);
$('fontLTR').addEventListener('input', updatePreviews);
document.addEventListener('DOMContentLoaded', load);