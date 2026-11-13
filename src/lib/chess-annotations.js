// Parses PGN comment tags from Lichess, Chess.com, and Fritz/ChessBase.
// Extracts arrows and highlights, drops clock/eval/timestamp metadata,
// preserves the human-readable text, and prefixes ChessBase # captions
// as **bold** Markdown-style.
(function (global) {
  'use strict';

  const TAG_RE = /\[%(\w+)\s+([^\]]+)\]/g;

  // File letters a..h → 0..7, ranks 1..8 → 0..7 (internal 0-based from a1).
  function fileIdx(ch) { return 'abcdefgh'.indexOf(ch); }
  function rankIdx(ch) { return '12345678'.indexOf(ch); }

  // Parse a square token. Accepts "e5" or "6" + "5" split via fromTo.
  // Lichess numeric format uses two-char "62" meaning file=6 (g), rank=2 (rank 3? no —
  // Lichess's "G621" means from=62, to=1 in their internal indexing where
  // a1=11, h1=18, a8=81, h8=88. We decode that below.)
  function parseLichessSquare(s) {
    // Standard: two-char coordinate like "f6" or "g7"
    if (/^[a-h][1-8]$/.test(s)) {
      return { file: fileIdx(s[0]), rank: rankIdx(s[1]) };
    }
    // Lichess legacy numeric: two digits where first=file (1-8), second=rank (1-8)
    if (/^[1-8][1-8]$/.test(s)) {
      return { file: +s[0] - 1, rank: +s[1] - 1 };
    }
    return null;
  }

  // Arrow string: one color letter + 4 chars (from/to) or 4 digits (legacy).
  // e.g. "Gf6g7" or "G621" (with two digits per square — legacy 4 chars)
  const ARROW_COLORS = {
    G: 'green', R: 'red', Y: 'yellow', B: 'blue', O: 'orange',
  };
  const HIGHLIGHT_COLORS = {
    G: 'green', R: 'red', Y: 'yellow', B: 'blue', O: 'orange',
  };

  function parseArrowToken(tok) {
    if (tok.length < 5) return null;
    const c = tok[0];
    const color = ARROW_COLORS[c];
    if (!color) return null;
    // Try coordinate format: "Gf6g7"
    if (/^[a-h][1-8][a-h][1-8]$/.test(tok.slice(1))) {
      const from = parseLichessSquare(tok.slice(1, 3));
      const to = parseLichessSquare(tok.slice(3, 5));
      if (from && to) return { color, from, to };
    }
    // Try legacy numeric: "G621" → from file=6 rank=2, to file=1 rank=1
    if (/^[1-8]{4}$/.test(tok.slice(1))) {
      const from = parseLichessSquare(tok.slice(1, 3));
      const to = parseLichessSquare(tok.slice(3, 5));
      if (from && to) return { color, from, to };
    }
    return null;
  }

  function parseHighlightToken(tok) {
    if (tok.length < 3) return null;
    const c = tok[0];
    const color = HIGHLIGHT_COLORS[c];
    if (!color) return null;
    const sq = parseLichessSquare(tok.slice(1, 3));
    if (!sq) return null;
    return { color, square: sq };
  }

  function parseCalList(value) {
    // Multiple arrows are comma-separated tokens, but each token is a
    // single arrow (colour + 4 chars). Some exports use space-separated.
    const out = [];
    const parts = value.split(/[,\s]+/).filter(Boolean);
    for (const p of parts) {
      const a = parseArrowToken(p);
      if (a) out.push(a);
    }
    return out;
  }

  function parseCslList(value) {
    const out = [];
    const parts = value.split(/[,\s]+/).filter(Boolean);
    for (const p of parts) {
      const h = parseHighlightToken(p);
      if (h) out.push(h);
    }
    return out;
  }

  // ChessBase caption: "#[caption]" or "#" or "#[caption with spaces]"
  function extractChessBaseCaption(text) {
    // Captions can contain spaces; match #[...] non-greedy
    const re = /#\[([^\]]*)\]|#/g;
    let caption = null;
    text = text.replace(re, (m, cap) => {
      if (cap && caption == null) caption = cap;
      return '';
    });
    return { text, caption };
  }

  function parseComment(raw) {
    if (!raw) return { text: '', arrows: [], highlights: [] };

    let text = String(raw);
    const arrows = [];
    const highlights = [];

    // Extract and strip all %-tags
    text = text.replace(TAG_RE, (_, name, value) => {
      const n = name.toLowerCase();
      if (n === 'cal') arrows.push(...parseCalList(value));
      else if (n === 'csl') highlights.push(...parseCslList(value));
      // clk, eval, timestamp, anything else → dropped
      return '';
    });

    // ChessBase caption markers
    const cb = extractChessBaseCaption(text);
    text = cb.text;

    // Collapse leftover whitespace but keep intentional line breaks
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim();

    if (cb.caption) {
      text = text ? `**${cb.caption}** ${text}` : `**${cb.caption}**`;
    }

    return { text, arrows, highlights };
  }

  global.ChessAnnotations = { parseComment };
})(typeof window !== 'undefined' ? window : self);