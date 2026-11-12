// Minimal, dependency-free syntax highlighter.
// Supported languages: css, html, js, javascript, java, sql, php, go, yaml, yml, toml, json
// Anything unknown falls back to plain escaped text.
(function (global) {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  // ---- Shared token helpers ----
  // We build HTML directly to avoid repeated escaping passes.
  const T = {
    com: (s) => `<span class="tok-com">${esc(s)}</span>`,
    str: (s) => `<span class="tok-str">${esc(s)}</span>`,
    num: (s) => `<span class="tok-num">${esc(s)}</span>`,
    kw:  (s) => `<span class="tok-kw">${esc(s)}</span>`,
    bi:  (s) => `<span class="tok-bi">${esc(s)}</span>`,
    fn:  (s) => `<span class="tok-fn">${esc(s)}</span>`,
    tag: (s) => `<span class="tok-tag">${esc(s)}</span>`,
    att: (s) => `<span class="tok-att">${esc(s)}</span>`,
    prop:(s) => `<span class="tok-prop">${esc(s)}</span>`,
    punct:(s)=> `<span class="tok-punct">${esc(s)}</span>`,
    txt: (s) => esc(s),
  };

  // ---------- C-like language highlighter ----------
  // Used by: js, javascript, java, go, php, sql (with per-language tweaks)
  function highlightCLike(src, opts) {
    const kw = new Set(opts.keywords || []);
    const bi = new Set(opts.builtins || []);
    const comLine = opts.lineComment || '//';
    const blockOpen = opts.blockOpen || '/*';
    const blockClose = opts.blockClose || '*/';
    const hashComment = !!opts.hashComment;

    let out = '';
    let i = 0;
    const n = src.length;

    const isIdStart = (c) => /[A-Za-z_$]/.test(c);
    const isId = (c) => /[A-Za-z0-9_$]/.test(c);
    const isDigit = (c) => /[0-9]/.test(c);

    while (i < n) {
      const c = src[i];

      // Whitespace
      if (/\s/.test(c)) { out += c; i++; continue; }

      // Line comment
      if (src.startsWith(comLine, i)) {
        let j = i;
        while (j < n && src[j] !== '\n') j++;
        out += T.com(src.slice(i, j));
        i = j;
        continue;
      }
      // Hash comment (php, yaml, toml sometimes)
      if (hashComment && c === '#') {
        let j = i;
        while (j < n && src[j] !== '\n') j++;
        out += T.com(src.slice(i, j));
        i = j;
        continue;
      }
      // Block comment
      if (src.startsWith(blockOpen, i)) {
        let j = src.indexOf(blockClose, i + blockOpen.length);
        j = j === -1 ? n : j + blockClose.length;
        out += T.com(src.slice(i, j));
        i = j;
        continue;
      }

      // Strings: " ' ` (php also supports #? we skip heredoc for simplicity)
      if (c === '"' || c === "'" || c === '`') {
        const q = c;
        let j = i + 1;
        while (j < n) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === q) { j++; break; }
          if (src[j] === '\n' && q !== '`') { j++; break; }
          j++;
        }
        out += T.str(src.slice(i, j));
        i = j;
        continue;
      }

      // Numbers
      if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
        let j = i;
        while (j < n && /[0-9a-fA-FxXoObB._]/.test(src[j])) j++;
        out += T.num(src.slice(i, j));
        i = j;
        continue;
      }

      // Identifiers / keywords / builtins
      if (isIdStart(c)) {
        let j = i;
        while (j < n && isId(src[j])) j++;
        const word = src.slice(i, j);
        // Function call? look ahead for '('
        let k = j;
        while (k < n && /\s/.test(src[k])) k++;
        const isCall = src[k] === '(';
        if (kw.has(word)) out += T.kw(word);
        else if (bi.has(word)) out += T.bi(word);
        else if (isCall && !bi.has(word)) out += T.fn(word);
        else out += T.txt(word);
        i = j;
        continue;
      }

      // Punctuation
      if (/[{}()[\];,.]/.test(c)) { out += T.punct(c); i++; continue; }

      // Operators and everything else
      out += T.txt(c);
      i++;
    }
    return out;
  }

  // ---------- JSON ----------
  function highlightJSON(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { out += c; i++; continue; }
      if (c === '"') {
        let j = i + 1;
        while (j < n) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '"') { j++; break; }
          j++;
        }
        // Is it a key? (next non-space char is ':')
        let k = j;
        while (k < n && /\s/.test(src[k])) k++;
        if (src[k] === ':') out += T.prop(src.slice(i, j));
        else out += T.str(src.slice(i, j));
        i = j;
        continue;
      }
      if (/[0-9-]/.test(c)) {
        let j = i;
        while (j < n && /[0-9.eE+\-]/.test(src[j])) j++;
        out += T.num(src.slice(i, j));
        i = j;
        continue;
      }
      if (/[a-z]/i.test(c)) {
        let j = i;
        while (j < n && /[a-z]/i.test(src[j])) j++;
        const w = src.slice(i, j);
        if (w === 'true' || w === 'false' || w === 'null') out += T.kw(w);
        else out += T.txt(w);
        i = j;
        continue;
      }
      out += T.txt(c);
      i++;
    }
    return out;
  }

  // ---------- YAML / TOML ----------
  function highlightYAML(src) {
    const lines = src.split('\n');
    return lines.map((line) => {
      // Whole-line comment
      if (/^\s*#/.test(line)) return T.com(line);
      // key: value
      const m = line.match(/^(\s*)([A-Za-z0-9_.-]+)(\s*:\s*)(.*)$/);
      if (m) {
        const [, ws, key, sep, rest] = m;
        return ws + T.prop(key) + sep + highlightInlineScalar(rest);
      }
      // list item "- x"
      const li = line.match(/^(\s*-\s+)(.*)$/);
      if (li) {
        return li[1] + highlightInlineScalar(li[2]);
      }
      return highlightInlineScalar(line);
    }).join('\n');
  }

  function highlightTOML(src) {
    const lines = src.split('\n');
    return lines.map((line) => {
      if (/^\s*#/.test(line)) return T.com(line);
      const sec = line.match(/^(\s*\[\[?)([^\]]+)(\]\]?.*)$/);
      if (sec) return sec[1] + T.tag(sec[2]) + sec[3];
      const m = line.match(/^(\s*)([A-Za-z0-9_.-]+)(\s*=\s*)(.*)$/);
      if (m) return m[1] + T.prop(m[2]) + m[3] + highlightInlineScalar(m[4]);
      return highlightInlineScalar(line);
    }).join('\n');
  }

  function highlightInlineScalar(s) {
    // strings, numbers, booleans, comments
    let out = '';
    let i = 0;
    const n = s.length;
    while (i < n) {
      const c = s[i];
      if (c === '#') { out += T.com(s.slice(i)); break; }
      if (c === '"' || c === "'") {
        const q = c;
        let j = i + 1;
        while (j < n) {
          if (s[j] === '\\') { j += 2; continue; }
          if (s[j] === q) { j++; break; }
          j++;
        }
        out += T.str(s.slice(i, j));
        i = j;
        continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9.eE+\-xXa-fA-F_]/.test(s[j])) j++;
        out += T.num(s.slice(i, j));
        i = j;
        continue;
      }
      if (/[a-z]/i.test(c)) {
        let j = i;
        while (j < n && /[a-z0-9_]/i.test(s[j])) j++;
        const w = s.slice(i, j);
        if (/^(true|false|null|yes|no|on|off|~)$/i.test(w)) out += T.kw(w);
        else out += T.txt(w);
        i = j;
        continue;
      }
      out += T.txt(c);
      i++;
    }
    return out;
  }

  // ---------- CSS ----------
  function highlightCSS(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    let inBlock = false;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { out += c; i++; continue; }
      if (src.startsWith('/*', i)) {
        let j = src.indexOf('*/', i + 2);
        j = j === -1 ? n : j + 2;
        out += T.com(src.slice(i, j)); i = j; continue;
      }
      if (c === '{') { inBlock = true; out += T.punct(c); i++; continue; }
      if (c === '}') { inBlock = false; out += T.punct(c); i++; continue; }
      if (c === '"' || c === "'") {
        const q = c;
        let j = i + 1;
        while (j < n) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === q) { j++; break; }
          j++;
        }
        out += T.str(src.slice(i, j)); i = j; continue;
      }
      if (c === '@') {
        let j = i + 1;
        while (j < n && /[a-zA-Z-]/.test(src[j])) j++;
        out += T.kw(src.slice(i, j)); i = j; continue;
      }
      if (inBlock) {
        // property: value;
        let j = i;
        while (j < n && /[A-Za-z-]/.test(src[j])) j++;
        if (j > i) {
          const word = src.slice(i, j);
          let k = j;
          while (k < n && /\s/.test(src[k])) k++;
          if (src[k] === ':') out += T.prop(word);
          else out += T.txt(word);
          i = j; continue;
        }
        if (/[0-9]/.test(c)) {
          let j2 = i;
          while (j2 < n && /[0-9.%a-zA-Z]/.test(src[j2])) j2++;
          out += T.num(src.slice(i, j2)); i = j2; continue;
        }
        if (c === '#' || /[a-z-]/i.test(c)) {
          // hex color / keyword
          let j2 = i;
          if (c === '#') j2++;
          while (j2 < n && /[0-9a-fA-F]/.test(src[j2])) j2++;
          if (j2 > i + 1) { out += T.num(src.slice(i, j2)); i = j2; continue; }
        }
      } else {
        // selector
        let j = i;
        while (j < n && !/[{}\n]/.test(src[j])) j++;
        out += T.tag(src.slice(i, j)); i = j; continue;
      }
      out += T.txt(c); i++;
    }
    return out;
  }

  // ---------- HTML ----------
  function highlightHTML(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '<') {
        // Comment
        if (src.startsWith('<!--', i)) {
          let j = src.indexOf('-->', i + 4);
          j = j === -1 ? n : j + 3;
          out += T.com(src.slice(i, j)); i = j; continue;
        }
        // Tag
        let j = i + 1;
        if (src[j] === '/') j++;
        while (j < n && /[A-Za-z0-9:-]/.test(src[j])) j++;
        out += '<' + src.slice(i + 1, j > i + 1 && src[i + 1] === '/' ? i + 1 : i + 1);
        // Simpler: rebuild tag manually
        // (fall back to full-tag walker below)
        i = i;
        // Full walker:
        let k = i + 1;
        if (src[k] === '/') k++;
        let nameStart = k;
        while (k < n && /[A-Za-z0-9:-]/.test(src[k])) k++;
        const name = src.slice(nameStart, k);
        out += (src[i + 1] === '/' ? '/' : '') === '/' ? '<span class="tok-punct">/</span>' : '<span class="tok-punct">&lt;</span>';
        out += T.tag(name);
        // attributes
        while (k < n && src[k] !== '>') {
          if (/\s/.test(src[k])) { out += src[k]; k++; continue; }
          if (src[k] === '/') { out += T.punct('/'); k++; continue; }
          let attrStart = k;
          while (k < n && /[A-Za-z0-9:-]/.test(src[k])) k++;
          if (k > attrStart) out += T.att(src.slice(attrStart, k));
          if (src[k] === '=') {
            out += T.punct('='); k++;
            if (src[k] === '"' || src[k] === "'") {
              const q = src[k]; let v = k + 1;
              while (v < n && src[v] !== q) v++;
              v = v < n ? v + 1 : n;
              out += T.str(src.slice(k, v)); k = v;
            }
          }
        }
        if (src[k] === '>') { out += T.punct('>'); k++; }
        i = k;
        continue;
      }
      // Text content
      let j = i;
      while (j < n && src[j] !== '<') j++;
      out += T.txt(src.slice(i, j));
      i = j;
    }
    return out;
  }

  // ---------- Dispatch ----------
  const KEYWORDS = {
    js: ['break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield','async','await','of','static','get','set'],
    java: ['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','final','finally','float','for','goto','if','implements','import','instanceof','int','interface','long','native','new','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while','true','false','null','record','sealed','permits','var','yield'],
    go: ['break','case','chan','const','continue','default','defer','else','fallthrough','for','func','go','goto','if','import','interface','map','package','range','return','select','struct','switch','type','var','true','false','nil','make','new','len','cap','append','copy','delete'],
    sql: ['select','from','where','insert','into','values','update','set','delete','create','table','drop','alter','add','column','primary','key','foreign','references','join','inner','left','right','outer','on','group','by','order','having','limit','offset','as','and','or','not','null','is','in','like','between','distinct','union','all','case','when','then','else','end','index','view','database','if','exists','default','unique','check','constraint','asc','desc'],
    php: ['abstract','and','array','as','break','callable','case','catch','class','clone','const','continue','declare','default','do','echo','else','elseif','empty','enddeclare','endfor','endforeach','endif','endswitch','endwhile','eval','exit','extends','final','finally','fn','for','foreach','function','global','goto','if','implements','include','include_once','instanceof','insteadof','interface','isset','list','match','namespace','new','or','print','private','protected','public','readonly','require','require_once','return','static','switch','throw','trait','try','unset','use','var','while','xor','yield','true','false','null','int','float','string','bool','void','mixed','iterable','object','self','parent'],
  };

  const BUILTINS = {
    js: ['console','window','document','Math','JSON','Object','Array','String','Number','Boolean','Promise','Map','Set','Symbol','Error','Date','RegExp','parseInt','parseFloat','isNaN','isFinite','setTimeout','setInterval','clearTimeout','clearInterval','fetch','require','module','exports'],
    java: ['System','String','Integer','Long','Double','Float','Boolean','Character','Object','List','Map','Set','ArrayList','HashMap','HashSet','IOException','Exception','RuntimeException','Thread','Math'],
    go: ['fmt','os','io','strings','strconv','errors','sync','time','context','http','json','bytes','bufio','sort','math','regexp','unicode'],
    php: ['echo','print','isset','empty','unset','count','strlen','strpos','substr','strtolower','strtoupper','trim','explode','implode','array_map','array_filter','array_merge','array_keys','array_values','json_encode','json_decode','file_get_contents','file_put_contents','var_dump','print_r'],
    sql: ['count','sum','avg','min','max','coalesce','cast','convert','now','current_date','current_timestamp','upper','lower','length','substring','trim','round','floor','ceil'],
  };

  function detectLanguage(lang) {
    if (!lang) return null;
    const l = lang.toLowerCase();
    if (l === 'js' || l === 'javascript' || l === 'jsx' || l === 'ts' || l === 'typescript' || l === 'tsx') return 'js';
    if (l === 'css' || l === 'scss' || l === 'less') return 'css';
    if (l === 'html' || l === 'xml' || l === 'xhtml') return 'html';
    if (l === 'json') return 'json';
    if (l === 'yaml' || l === 'yml') return 'yaml';
    if (l === 'toml') return 'toml';
    if (l === 'java') return 'java';
    if (l === 'sql') return 'sql';
    if (l === 'php') return 'php';
    if (l === 'go' || l === 'golang') return 'go';
    return null;
  }

  function highlight(code, lang) {
    const l = detectLanguage(lang);
    if (!l) return esc(code);
    try {
      switch (l) {
        case 'json': return highlightJSON(code);
        case 'yaml': return highlightYAML(code);
        case 'toml': return highlightTOML(code);
        case 'css':  return highlightCSS(code);
        case 'html': return highlightHTML(code);
        case 'js':   return highlightCLike(code, { keywords: KEYWORDS.js, builtins: BUILTINS.js });
        case 'java': return highlightCLike(code, { keywords: KEYWORDS.java, builtins: BUILTINS.java });
        case 'go':   return highlightCLike(code, { keywords: KEYWORDS.go, builtins: BUILTINS.go, blockOpen: '/*', blockClose: '*/' });
        case 'sql':  return highlightCLike(code, {
          keywords: KEYWORDS.sql, builtins: BUILTINS.sql,
          lineComment: '--', blockOpen: '/*', blockClose: '*/',
        });
        case 'php':  return highlightCLike(code, {
          keywords: KEYWORDS.php, builtins: BUILTINS.php,
          lineComment: '//', blockOpen: '/*', blockClose: '*/',
          hashComment: true,
        });
        default:     return esc(code);
      }
    } catch {
      return esc(code);
    }
  }

  global.HL = { highlight, detectLanguage };
})(typeof window !== 'undefined' ? window : self);