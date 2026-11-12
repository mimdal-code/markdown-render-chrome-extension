async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const current = document.getElementById('current');
  const open = document.getElementById('open');
  if (tab && tab.url) {
    current.textContent = tab.url;
    if (/\.(md|markdown)(\?|#|$)/i.test(tab.url) || tab.url.startsWith('file:')) {
      open.href = tab.url;
    } else {
      open.style.opacity = '.5';
      open.style.pointerEvents = 'none';
      open.textContent = 'Not a Markdown page';
    }
  }
  document.getElementById('opts').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
document.addEventListener('DOMContentLoaded', init);
