// i18n loader. Exposes I18N.t(key, lang), I18N.dirOf(lang), I18N.languages(),
// I18N.directionOf(lang). Keeps the full pack in memory after load.
(function (global) {
  'use strict';

  let all = {};
  let ready = null;

  function load() {
    if (ready) return ready;
    ready = fetch(chrome.runtime.getURL('src/locales.json'))
      .then((r) => r.json())
      .then((json) => { all = json; return json; })
      .catch(() => { all = {}; return {}; });
    return ready;
  }

  function packOf(lang) {
    return all[lang] || all.en || {};
  }

  function t(key, lang) {
    const pack = packOf(lang || 'en');
    const v = pack[key];
    if (v != null) return v;
    const en = all.en || {};
    return en[key] != null ? en[key] : key;
  }

  function tReplace(key, vars, lang) {
    let s = t(key, lang);
    if (vars) {
      Object.keys(vars).forEach((k) => {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      });
    }
    return s;
  }

  function dirOf(lang) {
    const pack = packOf(lang || 'en');
    return pack.dir === 'rtl' ? 'rtl' : 'ltr';
  }

  function nameOf(lang) {
    const pack = packOf(lang || 'en');
    return pack.name || lang;
  }

  // Returns [{ code, name, dir }] for every loaded language.
  function languages() {
    return Object.keys(all).map((code) => ({
      code,
      name: all[code].name || code,
      dir: all[code].dir === 'rtl' ? 'rtl' : 'ltr',
    }));
  }

  // Filtered lists for the options page.
  function languagesByDir(dir) {
    return languages().filter((l) => l.dir === dir);
  }

  // Picks a sensible starting language for the options page:
  //   navigator.language if it's an available pack, else 'en'.
  function detectBrowserLang() {
    const nav = (global.navigator && global.navigator.language) || 'en';
    const base = nav.split('-')[0].toLowerCase();
    return all[base] ? base : 'en';
  }

  global.I18N = {
    load,
    t,
    tReplace,
    dirOf,
    nameOf,
    languages,
    languagesByDir,
    detectBrowserLang,
  };
})(typeof window !== 'undefined' ? window : self);