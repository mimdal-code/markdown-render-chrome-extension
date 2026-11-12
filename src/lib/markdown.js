// Tiny, dependency-free Markdown → HTML renderer.
// Safe by default: raw HTML in source is escaped before our renderer runs.
// Fenced code blocks are highlighted by window.HL if it's loaded
// (src/lib/highlight.js) and get a flat "Copy" button.
(function (global) {
  'use strict';

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

  function inline(text) {
    // Protect code spans first
    const codes = [];
    text = text.replace(/`([^`]+)`/g, (_, c) => {
      codes.push(`<code>${esc(c)}</code>`);
      return `\u0000CODE${codes.length - 1}\u0000`;
    });

    // Images ![alt](src)
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (_, alt, src, title) =>
        `<img src="${esc(src)}" alt="${esc(alt)}"${title ? ` title="${esc(title)}"` : ''}>`);

    // Links [text](href)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (_, t, href, title) =>
        `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''} rel="noopener noreferrer">${t}</a>`);

    // Autolinks <http://...>
    text = text.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (_, u) =>
      `<a href="${esc(u)}" rel="noopener noreferrer">${esc(u)}</a>`);

    // Bold, italic, strike
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    text = text.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Restore code spans
    text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => codes[+i]);
    return text;
  }

  function render(src) {
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;

    const isBlank = (l) => /^\s*$/.test(l);

    while (i < lines.length) {
      let line = lines[i];

      // Fenced code block
      const fence = line.match(/^\s*(```+|~~~+)\s*([\w-]*)\s*$/);
      if (fence) {
        const marker = fence[1][0];
        const lang = fence[2] || '';
        const buf = [];
        i++;
        while (i < lines.length && !new RegExp('^\\s*' + marker + '{3,}\\s*$').test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        const raw = buf.join('\n');
        const hl = (global.HL && typeof global.HL.highlight === 'function')
          ? global.HL.highlight(raw, lang)
          : esc(raw);
        out.push(
          `<div class="code-block" data-lang="${esc(lang || '')}">`
          + `<button class="code-copy" type="button" title="Copy" aria-label="Copy code">Copy</button>`
          + `<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${hl}</code></pre>`
          + `</div>`
        );
        continue;
      }

      // ATX heading
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        const lvl = h[1].length;
        out.push(`<h${lvl}>${inline(h[2].trim())}</h${lvl}>`);
        i++;
        continue;
      }

      // Horizontal rule
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
        out.push('<hr>');
        i++;
        continue;
      }

      // Blockquote
      if (/^\s*>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push(`<blockquote>${render(buf.join('\n'))}</blockquote>`);
        continue;
      }

      // Table (GFM)
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
        const header = splitRow(line);
        const align = splitRow(lines[i + 1]).map((c) => {
          const t = c.trim();
          if (/^:-+:$/.test(t)) return 'center';
          if (/^-+:$/.test(t)) return 'right';
          if (/^:-+$/.test(t)) return 'left';
          return '';
        });
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        let t = '<table><thead><tr>';
        header.forEach((c, idx) => {
          t += `<th${align[idx] ? ` style="text-align:${align[idx]}"` : ''}>${inline(c.trim())}</th>`;
        });
        t += '</tr></thead><tbody>';
        rows.forEach((r) => {
          t += '<tr>';
          for (let k = 0; k < header.length; k++) {
            t += `<td${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline((r[k] || '').trim())}</td>`;
          }
          t += '</tr>';
        });
        t += '</tbody></table>';
        out.push(t);
        continue;
      }

      // Unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        const buf = [];
        const indent = line.match(/^\s*/)[0].length;
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i]) &&
               lines[i].match(/^\s*/)[0].length >= indent) {
          buf.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
          i++;
        }
        out.push('<ul>' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ul>');
        continue;
      }

      // Ordered list
      if (/^\s*\d+[.)]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
          i++;
        }
        out.push('<ol>' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ol>');
        continue;
      }

      // Paragraph
      if (!isBlank(line)) {
        const buf = [line];
        i++;
        while (i < lines.length && !isBlank(lines[i]) &&
               !/^(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|```|~~~|>|\s*([-*_])(\s*\1){2,}\s*$)/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        out.push(`<p>${inline(buf.join(' '))}</p>`);
        continue;
      }

      i++;
    }

    return out.join('\n');
  }

  function splitRow(line) {
    return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
  }

  global.MD = { render, esc };
})(typeof window !== 'undefined' ? window : self);