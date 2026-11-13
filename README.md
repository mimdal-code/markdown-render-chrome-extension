<!-- ============================================================
     Markdown RTL/LTR Reader — GitHub README
     ============================================================ -->

<h1 align="center">Markdown RTL/LTR Reader</h1>

<p align="center">
  <strong>A Chrome extension that renders <code>.md</code> / <code>.markdown</code> files to clean, flat HTML — with first-class RTL (Hebrew / Arabic / Persian) support, interactive Chess PGN/FEN boards, and PDF export.</strong>
</p>

<p align="center">
  <a href="https://github.com/mimdal-code/markdown-render-chrome-extension/releases/latest">
    <img alt="Latest release" src="https://img.shields.io/github/v/release/mimdal-code/markdown-render-chrome-extension?style=flat-square">
  </a>
  <a href="https://github.com/mimdal-code/markdown-render-chrome-extension/releases">
    <img alt="Downloads" src="https://img.shields.io/github/downloads/mimdal-code/markdown-render-chrome-extension/total?style=flat-square">
  </a>
  <a href="https://github.com/mimdal-code/markdown-render-chrome-extension/blob/main/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square">
  </a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/manifest-v3-purple.svg?style=flat-square">
  <img alt="Chrome 114+" src="https://img.shields.io/badge/chrome-%E2%89%A5114-yellow.svg?style=flat-square">
  <img alt="No tracking" src="https://img.shields.io/badge/tracking-none-lightgrey.svg?style=flat-square">
  <img alt="No network" src="https://img.shields.io/badge/network-none-lightgrey.svg?style=flat-square">
</p>

<p align="center">
  <a href="#-download--install"><strong>📥 Download & Install</strong></a> •
  <a href="#features">Features</a> •
  <a href="#chess-support">Chess Support</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a> •
  <a href="#usage">Usage</a> •
  <a href="#settings">Settings</a> •
  <a href="#fonts">Fonts</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#acknowledgements--licenses">Licenses</a>
</p>

---

## 📥 Download & Install

> **The Chrome Web Store version is not published yet** — the $5 developer registration is pending. Until then, install directly from GitHub Releases. It's a 2-minute manual install, works exactly the same, and is 100% free.

### Step 1 — Download the latest release
👉 **[Download the latest release](https://github.com/mimdal-code/markdown-render-chrome-extension/releases/latest)** 👈

### Step 2 — Extract the zip
Unzip the file to a permanent location. **Don't delete this folder** — Chrome loads the extension from this directory on every launch.

### Step 3 — Load it into Chrome
1. Open Chrome and go to `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and select the folder you extracted in Step 2.

### Step 4 — Enable file URL access
If you want to open local `.md` files (`file:///…/README.md`), you must grant one extra permission:
1. On the extension card, click **Details**.
2. Scroll to **"Allow access to file URLs"** and toggle it **on**.

### Step 5 — Verify it works
Open any `.md` file in Chrome. The plain-text page should be replaced by the rendered viewer.

---

## About

**Markdown RTL/LTR Reader** is a lightweight Chrome extension (Manifest V3) that turns any Markdown file you open in the browser into a beautifully rendered HTML document — and gets the *direction* right, every time.

It also natively parses and renders **Chess PGN and FEN blocks**, allowing you to read and step through chess games directly inside your Markdown study notes.

The extension is written in plain JavaScript, uses a small self-contained Markdown parser, and works fully offline on `file://` URLs as well as `http(s)`.

---

## Features

### 📝 Markdown Rendering
- Headings, paragraphs, bold, italic, strikethrough
- Ordered / unordered / nested lists
- **Task lists** — `- [ ]` / `- [x]` render as clickable checkboxes, persisted per file
- Tables with per-cell bidi
- Blockquotes with direction-aware side border
- Fenced code blocks with syntax highlighting (CSS, HTML, JS, Java, SQL, PHP, Go, YAML, TOML, JSON)
- Safe by default: raw HTML in source is escaped (no XSS)

### ♟️ Chess Support (NEW in v2.0)
- **FEN support:** Displays static board diagrams from standard FEN strings.
- **PGN support:** Replays full games. Includes navigation controls (prev/next/flip), a move list, and a "last move" highlight.
- **High-quality SVG pieces:** Uses the classic Cburnett piece set (GPL-licensed). No external network requests.
- **Annotations:** Extracts comments `{...}` and NAGs (`!`, `?`, `!?`). Renders Lichess `[%cal]` (arrows) and `[%csl]` (highlights).
- **Dialect support:** Handles ChessBase `#[...]` captions, Chess.com `[%clk]`, and plain PGN.

### 🌍 RTL / LTR & Localization
- Automatic document direction detection from the first strong character.
- Manual override (Auto / RTL / LTR).
- **Per-block bidi tagging:** Each paragraph, heading, list item, table cell, or chess card gets its own direction.
- **Two UI Languages:** Pick one language for RTL documents (e.g., Persian, Arabic, Hebrew) and one for LTR documents (English). The header automatically switches languages when the document direction changes.

### 🖨 Print / PDF Export
- Full multi-page pagination (no more clipping to one page).
- Full page width, colored headings, syntax-highlighted code, and crisp table borders.
- Hides UI chrome (sidebar, toolbar) and prints link URLs.

### 🔍 In-Page Search & Keyboard Nav
- **Ctrl+F** opens a custom search box.
- Highlights matches, live counter (`3 / 12`), Enter/Shift+Enter to jump.
- **j / k** scroll to next/previous heading.
- **Ctrl+B** toggles the sidebar.

---

## Chess Support (Usage)

You can embed chess boards directly in your Markdown files using standard fenced code blocks tagged with `chess`.

### FEN — Static Diagram
````markdown
```chess
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```
````
Renders a static board with a flip button. Great for puzzles or theoretical positions.

### PGN — Interactive Game
````markdown
```chess
[Event "Caro-Kann Lesson"]
1. e4 {The king's pawn.} c6 {The Caro-Kann.} 2. d4 d5 $1 3. e5 $5
```
````
Renders a fully interactive board with navigation controls, a clickable move list, and the author's comments.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `j` / `k` | Scroll to next / previous heading |
| `g g` | Scroll to top |
| `G` | Scroll to bottom |
| `[` / `Ctrl+B` | Toggle sidebar |
| `Ctrl+F` | Focus search box |
| `Enter` / `Shift+Enter` | Next / previous search match |
| `Esc` | Clear search, or close help modal |
| `?` | Open help modal |
| `Ctrl+P` | Print / Save as PDF |

*(When a Chess block is focused by clicking on it, use `←` / `→` to step through moves, `Home` / `End` to jump).*

---

## Settings

Open **chrome://extensions → Markdown RTL/LTR Reader → Options**.

| Setting | Default | Description |
|---------|---------|-------------|
| UI language (RTL docs) | فارسی | Language for the toolbar when the document is RTL. |
| UI language (LTR docs) | English | Language for the toolbar when the document is LTR. |
| Theme | Light | Light / Dark / Sepia |
| Page width | Normal | Narrow (620px) / Normal (860px) / Wide (95%) |
| Base font size | 16px | 12–24px |
| Direction | Auto | Auto / RTL / LTR |
| Per-block bidi | Off | Tag each paragraph with its own direction. |
| RTL / LTR font stack | Vazirmatn / System-UI | CSS `font-family` lists for text blocks. |

---

## Fonts

**All fonts come from your computer.** This extension never downloads web fonts. 
The default RTL stack expects **Vazirmatn** (for Persian) or **Noto Naskh Arabic**. If you don't have them installed, the browser falls back to system fonts. You can change the font stacks in Options.

---

## How it works

```
┌──────────────────┐
│ Chrome opens a   │
│ .md or .markdown │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ content.js       │  reads raw text from <body><pre>
│ (Content Script) │  (no fetch, no CORS)
└────────┬─────────┘
         │ postMessage
         ▼
┌──────────────────┐
│ viewer.html      │  sandboxed iframe UI
│   ├─ markdown.js │  parses Markdown → HTML
│   ├─ chess.js    │  finds ```chess blocks, renders boards
│   └─ viewer.js   │  TOC, search, keyboard, print, bidi
└────────┬─────────┘
         │ innerHTML
         ▼
┌──────────────────┐
│ Rendered article │
└──────────────────┘
```

- **No external dependencies.** The Markdown parser and syntax highlighter are self-contained.
- **Bidi correctness.** `unicode-bidi: plaintext` lets the browser re-derive direction per block. Chess headers and move lists stay LTR; chess comments follow their own text direction.
- **MV3 CSP Compliant.** No inline scripts. The chess engine is loaded via a dynamically injected external script (`chess-shim.js`).

---

## Acknowledgements & Licenses

This extension is MIT licensed. It bundles the following open-source assets, stored in the `vendor/` directory to ensure offline capability and license compliance:

*   **[chess.js](https://github.com/jhlywa/chess.js)** (v1.4.0) by Jeff Hlywa — Licensed under the **BSD-2-Clause** license. Used for PGN parsing and move generation.
*   **[Cburnett Chess Pieces](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett)** by Colin M.L. Burnett — Licensed under the **GPLv2+** license. Used for the SVG piece sets.
*   **Bidi guidance** from the [Unicode Bidirectional Algorithm](https://www.unicode.org/reports/tr9/).

---

## License

[MIT](LICENSE) © 2026 Mimdal
