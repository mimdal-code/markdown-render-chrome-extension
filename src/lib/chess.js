// Renders ```chess fenced code blocks as interactive chess widgets.
// Read-only: navigation only (prev/next/flip/jump). No input, no engine.
(function (global) {
  'use strict';

  const FEN_RE = /^(?:[rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s+[wb]\s+[KQkq-]+\s+[a-h1-8-]+\s+\d+\s+\d+\s*$/;
  const DEFAULT_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const PIECE_FILES = {
    p: 'bP.svg', n: 'bN.svg', b: 'bB.svg', r: 'bR.svg', q: 'bQ.svg', k: 'bK.svg',
    P: 'wP.svg', N: 'wN.svg', B: 'wB.svg', R: 'wR.svg', Q: 'wQ.svg', K: 'wK.svg',
  };

  const NAG_GLYPHS = {
    1:  { glyph: '!',   cls: 'nag-good',        title: 'Good move' },
    2:  { glyph: '?',   cls: 'nag-mistake',     title: 'Mistake' },
    3:  { glyph: '!!',  cls: 'nag-brilliant',   title: 'Brilliant' },
    4:  { glyph: '??',  cls: 'nag-blunder',     title: 'Blunder' },
    5:  { glyph: '!?',  cls: 'nag-interesting', title: 'Interesting' },
    6:  { glyph: '?!',  cls: 'nag-dubious',     title: 'Dubious' },
    7:  { glyph: '□',   cls: 'nag-forced',      title: 'Forced move' },
    10: { glyph: '=',   cls: 'nag-equal',       title: 'Equal' },
    13: { glyph: '∞',   cls: 'nag-unclear',     title: 'Unclear' },
    14: { glyph: '±',   cls: 'nag-white-better',title: 'White slightly better' },
    15: { glyph: '∓',   cls: 'nag-black-better',title: 'Black slightly better' },
    18: { glyph: '+−',  cls: 'nag-white-winning',title: 'White winning' },
    19: { glyph: '−+',  cls: 'nag-black-winning',title: 'Black winning' },
    146:{ glyph: 'N',   cls: 'nag-novelty',     title: 'Novelty' },
  };

  function mountAll(root) {
    if (!root) return;

    if (!window.Chess) {
      if (!window.__chessMountQueue) window.__chessMountQueue = [];
      window.__chessMountQueue.push(root);
      return;
    }

    if (window.__chessMountQueue && window.__chessMountQueue.length) {
      const queued = window.__chessMountQueue;
      window.__chessMountQueue = [];
      queued.forEach((r) => { if (r && r.isConnected) mountAll(r); });
    }

    root.querySelectorAll('.chess-block').forEach((el) => {
      if (el._chessMounted) return;
      const src = el.nextElementSibling;
      if (!src || !src.classList || !src.classList.contains('chess-src')) return;
      const raw = src.textContent || '';
      el._chessMounted = true;
      try { mountOne(el, raw); }
      catch (err) { console.warn('[md-rtl] chess mount failed', err); }
    });

    root.querySelectorAll('pre > code.language-chess').forEach((code) => {
      const pre = code.parentElement;
      if (!pre || pre.closest('.chess-block')) return;
      if (pre._chessMounted) return;
      pre._chessMounted = true;
      try { mountOne(pre, code.textContent || ''); }
      catch (err) { console.warn('[md-rtl] chess mount failed (legacy)', err); }
    });
  }

  function sanitizeForChessJs(text) {
    return String(text)
      .replace(/\[[^\]]*\]\s*/g, '')
      .replace(/#\[[^\]]*\]/g, '')
      .replace(/\b(1-0|0-1|1\/2-1\/2|\*)\s*$/g, '')
      .trim();
  }

  function classify(raw) {
    const text = String(raw).trim();
    if (!text) return { kind: 'error', error: 'Empty chess block' };

    if (!text.includes('\n') && FEN_RE.test(text)) {
      return { kind: 'fen', fen: text };
    }

    try {
      const g = new (getChessCtor())();
      g.loadPgn(text);
      return { kind: 'pgn', pgn: text };
    } catch (e) {
      try {
        const cleaned = sanitizeForChessJs(text);
        const g = new (getChessCtor())();
        g.loadPgn(cleaned);
        return { kind: 'pgn', pgn: text };
      } catch (e2) {
        try {
          global.ChessFEN.parseFen(text);
          return { kind: 'fen', fen: text };
        } catch {
          return { kind: 'error', error: 'Not a valid FEN or PGN' };
        }
      }
    }
  }

  function getChessCtor() {
    const C = global.Chess;
    if (!C) throw new Error('chess.js not loaded');
    return C.Chess || C;
  }

  function buildBoardDom(host) {
    host.innerHTML = '';
    
    const wrap = document.createElement('div');
    wrap.className = 'chess-board-wrap';
    
    const ranks = document.createElement('div');
    ranks.className = 'chess-coords-ranks';
    
    const grid = document.createElement('div');
    grid.className = 'chess-board-grid';
    const squareEls = {};
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const sq = document.createElement('div');
        sq.className = 'chess-square';
        const isDark = (file + rank) % 2 === 0;
        sq.classList.add(isDark ? 'dark' : 'light');
        sq.dataset.file = String(file);
        sq.dataset.rank = String(rank);
        grid.appendChild(sq);
        squareEls[`${file},${rank}`] = sq;
      }
    }
    
    const files = document.createElement('div');
    files.className = 'chess-coords-files';

    const boardAndFiles = document.createElement('div');
    boardAndFiles.className = 'chess-board-inner';
    boardAndFiles.append(grid, files);

    wrap.append(ranks, boardAndFiles);
    host.appendChild(wrap);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'chess-overlay');
    svg.setAttribute('viewBox', '0 0 8 8');
    svg.setAttribute('preserveAspectRatio', 'none');
    grid.appendChild(svg);

    return { grid, squareEls, svg, ranks, files };
  }

  function updateCoordinates(ranksEl, filesEl, orientation) {
    ranksEl.innerHTML = '';
    filesEl.innerHTML = '';
    
    const rankStr = orientation === 'w' ? '87654321' : '12345678';
    const fileStr = orientation === 'w' ? 'abcdefgh' : 'hgfedcba';
    
    for (let i = 0; i < 8; i++) {
      const r = document.createElement('span');
      r.textContent = rankStr[i];
      ranksEl.appendChild(r);
      
      const f = document.createElement('span');
      f.textContent = fileStr[i];
      filesEl.appendChild(f);
    }
  }

  function renderPosition(boardEl, grid, squareEls, sideToMove, orientation) {
    for (const k of Object.keys(squareEls)) squareEls[k].innerHTML = '';
    
    const wrap = boardEl.querySelector('.chess-board-wrap');
    if (wrap) {
       updateCoordinates(
         wrap.querySelector('.chess-coords-ranks'), 
         wrap.querySelector('.chess-coords-files'), 
         orientation
       );
    }

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = grid[r][f];
        if (!piece) continue;
        const rank = 7 - r;
        const visualRank = orientation === 'w' ? rank : 7 - rank;
        const visualFile = orientation === 'w' ? f : 7 - f;
        const cell = squareEls[`${visualFile},${visualRank}`];
        
      if (cell) {
          const img = document.createElement('img');
          // Point to the new versioned vendor path
          img.src = chrome.runtime.getURL('vendor/cburnett/1.0.0/pieces/' + PIECE_FILES[piece]);
          img.className = 'chess-piece';
          img.draggable = false;
          img.setAttribute('aria-hidden', 'true');
          cell.appendChild(img);
        }
      }
    }
    boardEl.dataset.side = sideToMove;
  }

  function coordToView(file, rank, orientation) {
    const vf = orientation === 'w' ? file : 7 - file;
    const vr = orientation === 'w' ? (7 - rank) : rank;
    return { x: vf + 0.5, y: vr + 0.5 };
  }

  const COLOR_HEX = {
    green: '#22c55e', red: '#ef4444', yellow: '#eab308',
    blue: '#3b82f6', orange: '#f97316',
  };

  function drawOverlay(svg, annotations, orientation) {
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';

    for (const h of annotations.highlights || []) {
      const { x, y } = coordToView(h.square.file, h.square.rank, orientation);
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', String(x - 0.5));
      rect.setAttribute('y', String(y - 0.5));
      rect.setAttribute('width', '1');
      rect.setAttribute('height', '1');
      rect.setAttribute('fill', COLOR_HEX[h.color] || '#22c55e');
      rect.setAttribute('fill-opacity', '0.35');
      svg.appendChild(rect);
    }

    for (const a of annotations.arrows || []) {
      const from = coordToView(a.from.file, a.from.rank, orientation);
      const to = coordToView(a.to.file, a.to.rank, orientation);
      const stroke = COLOR_HEX[a.color] || '#22c55e';
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const startX = from.x + ux * 0.15;
      const startY = from.y + uy * 0.15;
      const endX = to.x - ux * 0.3;
      const endY = to.y - uy * 0.3;

      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS(ns, 'defs');
        svg.appendChild(defs);
      }
      const markerId = `arrowhead-${a.color}`;
      if (!svg.querySelector(`#${markerId}`)) {
        const marker = document.createElementNS(ns, 'marker');
        marker.setAttribute('id', markerId);
        marker.setAttribute('markerWidth', '4');
        marker.setAttribute('markerHeight', '4');
        marker.setAttribute('refX', '2');
        marker.setAttribute('refY', '2');
        marker.setAttribute('orient', 'auto');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M0,0 L4,2 L0,4 Z');
        path.setAttribute('fill', stroke);
        marker.appendChild(path);
        defs.appendChild(marker);
      }

      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(startX));
      line.setAttribute('y1', String(startY));
      line.setAttribute('x2', String(endX));
      line.setAttribute('y2', String(endY));
      line.setAttribute('stroke', stroke);
      line.setAttribute('stroke-width', '0.12');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('marker-end', `url(#${markerId})`);
      svg.appendChild(line);
    }
  }

  function mountFenBlock(host, raw) {
    const { grid, side } = global.ChessFEN.parseFen(raw);
    let orientation = 'w';
    let boardEl;
    let board;

    const bar = document.createElement('div');
    bar.className = 'chess-controls';
    const flip = makeBtn('⟲', 'Flip board');
    flip.addEventListener('click', () => {
      orientation = orientation === 'w' ? 'b' : 'w';
      renderPosition(boardEl, grid, board.squareEls, side, orientation);
    });
    bar.appendChild(flip);
    host.appendChild(bar);

    boardEl = document.createElement('div');
    boardEl.className = 'chess-board';
    host.appendChild(boardEl);
    board = buildBoardDom(boardEl);
    renderPosition(boardEl, grid, board.squareEls, side, orientation);

    host.tabIndex = 0;
  }

  function mountPgnBlock(host, raw) {
    const Game = getChessCtor();

    let cleanPgn = raw;
    try {
      const test = new Game();
      test.loadPgn(cleanPgn);
    } catch {
      cleanPgn = sanitizeForChessJs(raw);
    }

    const parseGame = new Game();
    parseGame.loadPgn(cleanPgn);
    const allMoves = parseGame.history({ verbose: true });

    const startFen = allMoves.length > 0 ? allMoves[0].before : DEFAULT_START_FEN;
    const startParsed = global.ChessFEN.parseFen(startFen);
    const commentsByMove = extractCommentsByMove(raw);

    const positions = [{ grid: startParsed.grid, side: startParsed.side }];
    const moves = [];

    const replay = new Game();
    replay.load(startFen);
    for (let idx = 0; idx < allMoves.length; idx++) {
      const mv = allMoves[idx];
      replay.move(mv.san);
      const fen = replay.fen();
      const parsed = global.ChessFEN.parseFen(fen);
      positions.push({ grid: parsed.grid, side: parsed.side });
      moves.push({
        ply: idx + 1,
        san: mv.san,
        color: mv.color,
        from: mv.from,
        to: mv.to,
        annotation: commentsByMove[idx + 1] || { text: '', arrows: [], highlights: [], nag: null },
      });
    }

    let ply = 0;
    let orientation = 'w';
    let boardEl;
    let board;
    let barEl, prevBtn, nextBtn, moveListEl, cardEls;

       function refresh() {
      const pos = positions[ply];
      renderPosition(boardEl, pos.grid, board.squareEls, pos.side, orientation);

      const annot = ply > 0 ? moves[ply - 1].annotation : { arrows: [], highlights: [] };
      drawOverlay(board.svg, annot, orientation);

      // Highlight the last move
      highlightLastMove(ply);

      updateCards();
      updateMoveList();
      updateControls();
    }

    function highlightLastMove(currentPly) {
      // Clear any existing highlights
      board.squareEls && Object.values(board.squareEls).forEach(sq => {
        sq.classList.remove('last-move-from', 'last-move-to');
      });

      if (currentPly === 0) return;

      const m = moves[currentPly - 1];
      if (!m) return;

      const parseSquare = (sq) => {
        const file = 'abcdefgh'.indexOf(sq[0]);
        const rank = parseInt(sq[1], 10) - 1;
        return { file, rank };
      };

      const from = parseSquare(m.from);
      const to = parseSquare(m.to);

      const getVisualCoords = (f, r) => {
        const vf = orientation === 'w' ? f : 7 - f;
        const vr = orientation === 'w' ? r : 7 - r;
        return `${vf},${vr}`;
      };

      const fromKey = getVisualCoords(from.file, from.rank);
      const toKey = getVisualCoords(to.file, to.rank);

      if (board.squareEls[fromKey]) board.squareEls[fromKey].classList.add('last-move-from');
      if (board.squareEls[toKey]) board.squareEls[toKey].classList.add('last-move-to');
    }
    
    function findLastMove(color) {
      for (let i = ply - 1; i >= 0; i--) {
        if (moves[i].color === color) return moves[i];
      }
      return null;
    }

    function fillCard(el, color, move) {
      el.classList.toggle('active', move && move.ply === ply);
      const sanEl = el.querySelector('.chess-card-san');
      const nagEl = el.querySelector('.chess-card-nag');
      const textEl = el.querySelector('.chess-card-text');
      const headEl = el.querySelector('.chess-card-head');
      if (!move) {
        sanEl.textContent = '—';
        nagEl.textContent = '';
        textEl.textContent = '';
        headEl.textContent = color === 'w' ? 'WHITE' : 'BLACK';
        return;
      }
      const moveNum = Math.ceil(move.ply / 2);
      headEl.textContent = `${color === 'w' ? 'WHITE' : 'BLACK'} · move ${moveNum}`;
      sanEl.textContent = move.san;
      const nag = move.annotation.nag;
      if (nag && NAG_GLYPHS[nag]) {
        nagEl.textContent = NAG_GLYPHS[nag].glyph;
        nagEl.className = 'chess-card-nag ' + NAG_GLYPHS[nag].cls;
        nagEl.title = NAG_GLYPHS[nag].title;
      } else {
        nagEl.textContent = '';
        nagEl.className = 'chess-card-nag';
      }
      textEl.textContent = move.annotation.text || '';
    }

    function updateCards() {
      fillCard(cardEls.white, 'w', findLastMove('w'));
      fillCard(cardEls.black, 'b', findLastMove('b'));
    }

    function updateMoveList() {
      moveListEl.querySelectorAll('.chess-move').forEach((el, idx) => {
        el.classList.toggle('active', idx + 1 === ply);
      });
    }

    function updateControls() {
      const san = barEl.querySelector('.chess-current-san');
      const counter = barEl.querySelector('.chess-counter');
      if (ply === 0) {
        san.textContent = 'start';
      } else {
        const m = moves[ply - 1];
        san.textContent = (m.color === 'w' ? Math.ceil(m.ply / 2) + '. ' : Math.ceil(m.ply / 2) + '… ') + m.san;
      }
      counter.textContent = `${ply} / ${moves.length}`;
      prevBtn.disabled = ply === 0;
      nextBtn.disabled = ply === moves.length;
    }

    function stepBack() { if (ply > 0) { ply--; refresh(); } }
    function stepFwd()  { if (ply < moves.length) { ply++; refresh(); } }
    function goStart()  { ply = 0; refresh(); }
    function goEnd()    { ply = moves.length; refresh(); }

    barEl = document.createElement('div');
    barEl.className = 'chess-controls';
    const flip = makeBtn('⟲', 'Flip board');
    flip.addEventListener('click', () => { orientation = orientation === 'w' ? 'b' : 'w'; refresh(); });
    prevBtn = makeBtn('◀', 'Previous move');
    prevBtn.addEventListener('click', stepBack);
    nextBtn = makeBtn('▶', 'Next move');
    nextBtn.addEventListener('click', stepFwd);
    const sanSpan = document.createElement('span');
    sanSpan.className = 'chess-current-san';
    const counterSpan = document.createElement('span');
    counterSpan.className = 'chess-counter';
    barEl.append(flip, prevBtn, nextBtn, sanSpan, counterSpan);
    host.appendChild(barEl);

    boardEl = document.createElement('div');
    boardEl.className = 'chess-board';
    host.appendChild(boardEl);
    board = buildBoardDom(boardEl);

    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'chess-cards';
    cardEls = { white: makeCard('WHITE'), black: makeCard('BLACK') };
    cardsWrap.append(cardEls.white, cardEls.black);
    host.appendChild(cardsWrap);

    moveListEl = document.createElement('div');
    moveListEl.className = 'chess-move-list';
    moves.forEach((mv, i) => {
      const m = document.createElement('span');
      m.className = 'chess-move';
      const num = Math.ceil(mv.ply / 2);
      const prefix = mv.color === 'w' ? num + '. ' : num + '… ';
      m.textContent = prefix + mv.san;
      if (mv.annotation.nag && NAG_GLYPHS[mv.annotation.nag]) {
        const g = document.createElement('span');
        g.className = 'chess-move-nag ' + NAG_GLYPHS[mv.annotation.nag].cls;
        g.textContent = NAG_GLYPHS[mv.annotation.nag].glyph;
        g.title = NAG_GLYPHS[mv.annotation.nag].title;
        m.appendChild(document.createTextNode(' '));
        m.appendChild(g);
      }
      m.addEventListener('click', () => { ply = i + 1; refresh(); });
      moveListEl.appendChild(m);
    });
    host.appendChild(moveListEl);

    host.tabIndex = 0;
    host.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); stepBack(); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); stepFwd(); }
      else if (ev.key === 'Home') { ev.preventDefault(); goStart(); }
      else if (ev.key === 'End') { ev.preventDefault(); goEnd(); }
    });

    refresh();
  }

  function extractCommentsByMove(rawPgn) {
    const out = {};
    const tokens = tokenizePgn(rawPgn);
    let ply = 0;
    let lastWasMove = false;
    for (const t of tokens) {
      if (t.type === 'san') {
        ply++;
        lastWasMove = true;
        out[ply] = out[ply] || { text: '', arrows: [], highlights: [], nag: null };
      } else if (t.type === 'comment' && lastWasMove && ply > 0) {
        const parsed = global.ChessAnnotations.parseComment(t.value);
        out[ply] = Object.assign(out[ply] || { text: '', arrows: [], highlights: [], nag: null }, {
          text: parsed.text,
          arrows: parsed.arrows,
          highlights: parsed.highlights,
        });
      } else if (t.type === 'nag' && lastWasMove && ply > 0) {
        out[ply] = out[ply] || { text: '', arrows: [], highlights: [], nag: null };
        out[ply].nag = t.value;
      }
    }
    return out;
  }

  function tokenizePgn(raw) {
    const tokens = [];
    let s = String(raw);
    s = s.replace(/#\[([^\]]*)\]/g, '{**$1**}');
    s = s.replace(/\[[^\]]*\]\s*/g, '');
    let guard = 0;
    while (/\([^()]*\)/.test(s) && guard++ < 50) {
      s = s.replace(/\([^()]*\)/g, ' ');
    }
    const re = /\{([^}]*)\}|\$(\d+)|\b([a-hRNBQK][^\s{}]*)\b|\b(1-0|0-1|1\/2-1\/2|\*)\b/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1] !== undefined) tokens.push({ type: 'comment', value: m[1] });
      else if (m[2] !== undefined) tokens.push({ type: 'nag', value: +m[2] });
      else if (m[3] !== undefined) {
        const san = m[3];
        if (/^[a-hRNBQK]/.test(san) && !/^\d+$/.test(san)) {
          tokens.push({ type: 'san', value: san });
        }
      }
    }
    return tokens;
  }

  function makeBtn(text, title) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chess-btn';
    b.textContent = text;
    b.title = title;
    b.setAttribute('aria-label', title);
    return b;
  }

  function makeCard(label) {
    const card = document.createElement('div');
    card.className = 'chess-card';
    const head = document.createElement('div');
    head.className = 'chess-card-head';
    head.textContent = label;
    const row = document.createElement('div');
    row.className = 'chess-card-row';
    const san = document.createElement('span');
    san.className = 'chess-card-san';
    const nag = document.createElement('span');
    nag.className = 'chess-card-nag';
    row.append(san, nag);
    const text = document.createElement('div');
    text.className = 'chess-card-text';
    card.append(head, row, text);
    return card;
  }

  function mountOne(host, raw) {
    const cls = classify(raw);
    if (cls.kind === 'error') {
      console.warn('[md-rtl] chess block not parsed:', cls.error);
      return;
    }
    if (cls.kind === 'fen') mountFenBlock(host, cls.fen);
    else mountPgnBlock(host, cls.pgn);
  }

  global.ChessBlocks = { mountAll, classify };
})(typeof window !== 'undefined' ? window : self);