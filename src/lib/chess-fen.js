// Minimal FEN parser — extracts the board grid and side-to-move.
// Only fields 1 and 2 are needed for rendering. Castling, en passant,
// halfmove, and fullmove counters are ignored by this module.
(function (global) {
  'use strict';

  const PIECES = {
    p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
    P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
  };

  function parseFen(fen) {
    const fields = String(fen).trim().split(/\s+/);
    if (fields.length < 2) throw new Error('FEN needs at least 2 fields');

    const ranks = fields[0].split('/');
    if (ranks.length !== 8) throw new Error('FEN rank 1 must have 8 ranks');

    const grid = []; // grid[0] = rank 8, grid[7] = rank 1
    for (const rankStr of ranks) {
      const row = [];
      for (const ch of rankStr) {
        if (/[1-8]/.test(ch)) {
          const n = +ch;
          for (let i = 0; i < n; i++) row.push(null);
        } else if (PIECES[ch]) {
          row.push(ch);
        } else {
          throw new Error(`Unknown FEN piece: ${ch}`);
        }
      }
      if (row.length !== 8) throw new Error(`FEN rank has ${row.length} squares`);
      grid.push(row);
    }

    const side = fields[1];
    if (side !== 'w' && side !== 'b') throw new Error('FEN side must be w or b');

    return { grid, side, raw: String(fen).trim() };
  }

  global.ChessFEN = { parseFen, PIECES };
})(typeof window !== 'undefined' ? window : self);