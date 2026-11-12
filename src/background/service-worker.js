chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      theme: 'light',
      width: 'normal',
      dir: 'auto',
      tag: false,
      size: 16,
      sidebar: true,
      fontRTL: '"Vazirmatn", "Droid Arabic Naskh", "Noto Naskh Arabic", "Tahoma", sans-serif',
      fontLTR: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    });
  }
});