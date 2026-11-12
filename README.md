<!-- ============================================================
     Markdown RTL/LTR Reader — GitHub README
     ============================================================ -->

<h1 align="center">Markdown RTL/LTR Reader</h1>

<p align="center">
  <strong>A Chrome extension that renders <code>.md</code> / <code>.markdown</code> files to clean, flat HTML — with first-class RTL (Hebrew / Arabic / Persian) and LTR support.</strong>
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
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square">
  <img alt="No tracking" src="https://img.shields.io/badge/tracking-none-lightgrey.svg?style=flat-square">
  <img alt="No network" src="https://img.shields.io/badge/network-none-lightgrey.svg?style=flat-square">
</p>

<p align="center">
  <a href="#-download--install"><strong>📥 Download & Install</strong></a> •
  <a href="#features">Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#settings">Settings</a> •
  <a href="#fonts">Fonts</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#development">Development</a>
</p>

---

## 📥 Download & Install

> **The Chrome Web Store version is not published yet** — the $5 developer registration is pending. Until then, install directly from GitHub Releases. It's a 2-minute manual install, works exactly the same, and is 100% free.

### Step 1 — Download the latest release

👉 **[Download the latest release](https://github.com/mimdal-code/markdown-render-chrome-extension/releases/latest)** 👈

On that page, scroll to the **Assets** section and click:

```
md-rtl-reader-1.0.0.zip
```

(Or click any version you want from the [releases page](https://github.com/mimdal-code/markdown-render-chrome-extension/releases).)

### Step 2 — Extract the zip

Unzip the file to a permanent location — for example:

| OS | Suggested path |
|----|----------------|
| Windows | `C:\Users\<you>\Extensions\md-rtl-reader\` |
| macOS | `~/Extensions/md-rtl-reader/` |
| Linux | `~/extensions/md-rtl-reader/` |

> ⚠️ **Don't delete this folder after installing.** Chrome loads the extension from this directory on every launch. If you move or delete it, the extension stops working.

The folder should contain `manifest.json` at its root, plus `src/`, `assets/`.

### Step 3 — Load it into Chrome

1. Open Chrome and go to:
   ```
   chrome://extensions
   ```
2. Toggle **Developer mode** on (top-right corner of the page).
3. Click **Load unpacked**.
4. Select the folder you extracted in Step 2 (the one containing `manifest.json`).

The extension appears in the list, enabled.

### Step 4 — Enable file URL access (for local Markdown)

If you want to open local `.md` files (`file:///…/README.md`), you must grant one extra permission:

1. On the extension card, click **Details**.
2. Scroll to **"Allow access to file URLs"** and toggle it **on**.

Without this step, the extension works on `http(s)` Markdown URLs but not on local files. It's a Chrome security requirement — no extension can bypass it.

### Step 5 — Verify it works

Open any `.md` file in Chrome:

```
file:///path/to/README.md
https://raw.githubusercontent.com/.../README.md
```

The plain-text page should be replaced by the rendered viewer. If it isn't, see **Troubleshooting** below.

### Updating to a newer release

1. Download the newest `.zip` from [Releases](https://github.com/mimdal-code/markdown-render-chrome-extension/releases).
2. Unzip it, **replacing** the contents of your existing folder.
3. Go to `chrome://extensions` and click **Reload** (⟳) on the extension card.
4. Close any open `.md` tabs and reopen them.

### Troubleshooting manual install

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Manifest file is missing or unreadable" | Wrong folder selected | Select the folder that **directly contains** `manifest.json`, not its parent |
| Nothing happens on `.md` files | File URLs not enabled, or stale tab | Enable "Allow access to file URLs"; close and reopen the tab |
| "This extension may have been corrupted" | You moved/deleted the folder after installing | Move it back, or reload via `chrome://extensions` |
| Extension disappears after Chrome restart | Same as above | Re-load unpacked from the same folder |
| "Developer mode extensions" warning on every launch | Normal for side-loaded extensions | Ignore, or use the Web Store version once it's published |

> **Why is this manual?** Publishing to the Chrome Web Store requires a **one-time $5 developer registration fee**. Once that's paid, this extension will be listed and installable with one click. For now, the manual install is functionally identical.

---

## About

**Markdown RTL/LTR Reader** is a lightweight Chrome extension (Manifest V3) that turns any Markdown file you open in the browser into a beautifully rendered HTML document — and gets the *direction* right, every time.

Most Markdown viewers break on mixed-language documents: a Hebrew or Arabic paragraph gets flipped, an English sentence inside a Persian block reads backwards, tables turn into a mess. This extension solves that with:

- **Automatic document direction** detection from the first strong character.
- **Per-block bidi** tagging (each paragraph, heading, list item, table cell gets its own direction).
- **Separate font stacks** for RTL and LTR content, chosen by *you* from fonts installed on *your* computer.
- **Zero network access** — no telemetry, no CDN fonts, no external dependencies.

The extension is written in plain JavaScript, uses a small self-contained Markdown parser and syntax highlighter, and works fully offline on `file://` URLs as well as `http(s)`.

---

## Features

### 📝 Markdown rendering
- Headings (H1–H6), paragraphs, bold, italic, strikethrough
- Ordered / unordered / nested lists
- Tables with per-cell bidi
- Blockquotes with direction-aware side border
- Fenced code blocks with syntax highlighting
- Inline code, links, images, autolinks, horizontal rules
- Safe by default: raw HTML in source is escaped (no XSS)

### 🌍 RTL / LTR support
- Automatic direction detection from document content
- Manual override: **Auto / RTL / LTR**
- Per-block bidi tagging for mixed documents
- Direction-aware fonts (RTL stack and LTR stack applied per block)
- Correct blockquote border side for RTL and LTR
- `<pre>` blocks always render LTR (code reads correctly in RTL documents)

### 🎨 Syntax highlighting
- Supported: `css`, `html`, `js` / `javascript`, `java`, `sql`, `php`, `go`, `yaml` / `yml`, `toml`, `json`
- Unknown languages fall back to escaped plain text
- Per-theme token colors (Light / Dark / Sepia)

### 📋 Copy buttons
- Every code block has a flat **Copy** button in the top corner
- Uses `navigator.clipboard` with `execCommand` fallback
- Shows "Copied" feedback for 1.2s

### 🧭 Sidebar
- Persistent left sidebar (collapsible with **Ctrl+B**)
- **TOC** tab: nested outline by heading level, active-section tracking, smooth scroll
- **Files** tab: placeholder (coming soon)

### 🎛 Layout & themes
- Three page width modes: **Narrow (620px)**, **Normal (860px)**, **Wide (95%)**
- Three themes: **Light**, **Dark**, **Sepia**
- Flat design — no rounded corners, no shadows, no gradients
- Adjustable base font size (14–22px)
- Scrollbar always at the far right of the page (or left in RTL)

### 🔒 Privacy
- **No network requests** at runtime
- **No analytics, no telemetry, no tracking**
- **No external fonts or scripts**
- All settings stored locally in `chrome.storage.sync`

---

## Usage

### Opening a Markdown file

Just navigate Chrome to any `.md` or `.markdown` file:

```
file:///path/to/README.md
https://example.com/docs/guide.md
```

The extension injects the viewer automatically. No clicking, no popup, no address bar tricks.

### Toolbar

| Control | What it does |
|---------|-------------|
| ☰ | Toggle the sidebar (**Ctrl+B**) |
| Title | Document name (no file path shown) |
| **Width** | Narrow / Normal / Wide |
| **Theme** | Light / Dark / Sepia |
| **Direction** | Auto / RTL / LTR |
| **Per-block bidi** | Tag each block with its own direction |
| **Size** | Base font size 14–22px |

### Sidebar

- **TOC** — nested outline built from `h1`–`h6`, active-section highlight, click to scroll.
- **Files** — reserved for a future file browser.

### Code blocks

Every fenced code block gets:

- A **language chip** in the top-left corner (top-right in RTL).
- A **Copy** button in the opposite corner.

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+B** / **Cmd+B** | Toggle sidebar |

---

## Settings

Open **chrome://extensions → Markdown RTL/LTR Reader → Options**, or use the extension popup → **Options**.

| Setting | Default | Description |
|---------|---------|-------------|
| Theme | Light | Light / Dark / Sepia |
| Page width | Normal | Narrow (620px) / Normal (860px) / Wide (95%) |
| Base font size | 16px | 12–24px |
| Show sidebar | On | Collapsible with Ctrl+B |
| Direction | Auto | Auto / RTL / LTR |
| Per-block bidi | Off | Tag each paragraph with its own direction |
| RTL font stack | Vazirmatn, Droid Arabic Naskh, Noto Naskh Arabic, Tahoma | CSS `font-family` list for RTL blocks |
| LTR font stack | system-ui, Segoe UI, Roboto, Arial | CSS `font-family` list for LTR blocks |

All settings are stored in `chrome.storage.sync` and propagate to every Chrome profile you're signed into.

---

## Fonts

**All fonts come from your computer.** This extension never downloads fonts.

The RTL and LTR font stacks are plain CSS `font-family` lists. The browser tries each name in order and falls back to the next one if a font isn't installed. To use a specific font, install it yourself:

### Persian (RTL)

- **Vazirmatn** (recommended, default)
  [github.com/rastikerdar/vazirmatn/releases](https://github.com/rastikerdar/vazirmatn/releases)
- **Sahel**, **Samim**, **Shabnam** — also by Saber Rastikerdar

### Arabic (RTL)

- **Droid Arabic Naskh** — install via your OS package manager, or use **Noto Naskh Arabic** (its direct successor)
- **Noto Naskh Arabic** — [fonts.google.com/noto/specimen/Noto+Naskh+Arabic](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic)
- **Amiri** — [github.com/aliftype/amiri](https://github.com/aliftype/amiri)

### Hebrew (RTL)

- **Noto Sans Hebrew** — [fonts.google.com](https://fonts.google.com/specimen/Noto+Sans+Hebrew)
- **David**, **Miriam** — system fonts on macOS and Windows

### Latin (LTR)

The default LTR stack (`system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`) picks up your operating system's UI font. Change it in Settings if you prefer a specific typeface.

### How to install a font on your OS

- **Windows** — right-click the `.ttf` / `.otf` file → **Install** (or **Install for all users**).
- **macOS** — double-click the font file → **Install Font** in Font Book.
- **Linux** — copy to `~/.local/share/fonts/` (user) or `/usr/share/fonts/` (system), then run `fc-cache -f -v`.

After installing a font, restart Chrome so it picks up the new name.

---

## How it works

```
┌──────────────────┐
│ Chrome opens a   │
│ .md or .markdown │
│ URL              │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ content.js       │  reads the raw text from <body><pre>
│ (Content Script) │  (no fetch, no CORS, no network)
└────────┬─────────┘
         │ postMessage
         ▼
┌──────────────────┐
│ viewer.html      │  sandboxed iframe UI
│   ├─ markdown.js │  parses Markdown → HTML
│   ├─ highlight.js│  tokenizes fenced code blocks
│   ├─ direction.js│  detects first strong character
│   └─ viewer.js   │  TOC, theme, fonts, bidi tagging
└────────┬─────────┘
         │ innerHTML
         ▼
┌──────────────────┐
│ Rendered article │
└──────────────────┘
```

### Key design decisions

- **No `fetch()` anywhere.** Content scripts read the Markdown text directly from the page's `<pre>` element. This bypasses CORS, file-access toggles, and MV3 background-worker constraints entirely.
- **No external dependencies.** The Markdown parser (`src/lib/markdown.js`) and syntax highlighter (`src/lib/highlight.js`) are self-contained, ~500 lines total. No bundler, no `node_modules`, no build step.
- **Bidi correctness.** `<html dir>` is set from the first strong character in the document. `unicode-bidi: plaintext` on every text block lets the browser re-derive direction per paragraph. Optional per-block tagging (`data-dir="rtl|ltr"`) locks direction explicitly for mixed documents.
- **Direction-aware fonts.** CSS custom properties `--font-rtl` and `--font-ltr` are applied to `[data-dir="rtl"]` and `[data-dir="ltr"]` selectors, so a Hebrew paragraph uses Vazirmatn while an English paragraph right next to it uses system-ui.
- **Flat design.** `*, *::before, *::after { border-radius: 0 !important; box-shadow: none !important; }` enforces zero rounded corners and zero shadows across the whole viewer.

---

## Development

### Project layout

```
.
├── manifest.json               MV3 manifest
├── package.sh                  Build .zip for releases
├── README.md
├── LICENSE
├── assets/
│   └── icons/                  16 / 32 / 48 / 128 px PNGs
├── src/
│   ├── background/
│   │   └── service-worker.js   Seeds default settings on install
│   ├── content/
│   │   ├── content.js          Detects .md, reads <pre>, injects viewer
│   │   └── content.css
│   ├── viewer/
│   │   ├── viewer.html         Viewer UI (sidebar + toolbar + article)
│   │   ├── viewer.css          Themes, fonts, layout, token colors
│   │   └── viewer.js           TOC, settings, copy buttons, bidi
│   ├── lib/
│   │   ├── markdown.js         Self-contained Markdown parser
│   │   ├── highlight.js        Self-contained syntax highlighter
│   │   └── direction.js        Unicode bidi first-strong detection
│   ├── options/
│   │   ├── options.html
│   │   └── options.js
│   └── popup/
│       ├── popup.html
│       └── popup.js
└── test/
    └── fixtures/
        ├── english.md
        ├── hebrew.md
        ├── arabic.md
        ├── persian.md
        ├── en-fa-mixed.md
        └── mixed.md
```

### Loading for development

1. `chrome://extensions → Developer mode`
2. **Load unpacked** → select the project root
3. Open any `.md` file in Chrome
4. After editing files:
   - Click **Reload** on the extension card.
   - **Close every `.md` tab** and open a fresh one — Chrome keeps the old content script attached to already-open tabs.

### Debugging

| Where | How |
|-------|-----|
| Content script | Open DevTools on the `.md` tab → Console (filter by `[md-rtl]`) |
| Viewer | Right-click inside the rendered article → **Inspect** → it opens DevTools on `viewer.html` |
| Service worker | `chrome://extensions` → extension card → **Inspect views: service worker** |
| Options page | Right-click on the options page → **Inspect** |

### Extending

- **Add a language to the highlighter** — edit `src/lib/highlight.js`, add keywords and a case in `highlight()`.
- **Add a theme** — add an `html[data-theme="yourtheme"] { … }` block to `src/viewer/viewer.css` and an `<option>` to the theme `<select>` in both `viewer.html` and `options.html`.
- **Replace the Markdown parser** — swap `src/lib/markdown.js` for anything that exposes `MD.render(src) → html`. Keep `MD.esc` for safety.
- **Implement the Files tab** — the placeholder is in `viewer.html`; add a script that lists sibling `.md` files via `chrome.runtime.getURL` + a new message to the service worker.

### Building a release

```bash
./package.sh
```

Produces `markdown-render-chrome-extension-<version>.zip`.

### Automated releases (GitHub Actions)

Push a version tag and the CI workflow in `.github/workflows/release.yaml` packages the extension and attaches it to a new GitHub Release:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

The `.zip` appears on the [Releases page](https://github.com/mimdal-code/markdown-render-chrome-extension/releases) within a minute or two.

---

## Browser support

| Browser | Status |
|---------|--------|
| Chrome 114+ | ✅ Supported (Manifest V3) |
| Edge 114+ | ✅ Supported (Chromium) |
| Brave 1.5x+ | ✅ Supported (Chromium) |
| Opera GX / Opera | ⚠️ Likely works (Chromium) but untested |
| Firefox | ❌ Not supported (uses MV3-specific APIs) |
| Safari | ❌ Not supported |

---

## Roadmap

- [x] v1.0 — Markdown rendering, RTL/LTR, TOC, themes, code highlighting, copy buttons
- [ ] v1.1 — File browser in sidebar (browse sibling `.md` files in the same directory)
- [ ] v1.2 — Export to HTML / PDF
- [ ] v1.3 — Footnotes, task lists, definition lists
- [ ] v1.4 — Custom theme editor
- [ ] v1.5 — Publish to Chrome Web Store (pending $5 developer registration)
- [ ] v2.0 — Firefox port (MV3 compatible)

---

## Contributing

Contributions are welcome. For larger changes, please open an issue first to discuss what you'd like to change.

```bash
# Fork and clone
git clone https://github.com/mimdal-code/markdown-render-chrome-extension.git
cd markdown-render-chrome-extension

# Make changes, then load unpacked in chrome://extensions
# Test with test/fixtures/*.md

# Submit a pull request
```

### Code style

- Plain JavaScript (no TypeScript, no bundler).
- 2-space indentation.
- Single quotes; semicolons.
- No new dependencies unless unavoidable.

---

## FAQ

**Does it work offline?**
Yes — 100% offline. No network requests are made at any point.

**Why isn't it on the Chrome Web Store?**
Publishing requires a one-time $5 developer registration fee. Until that's paid, install directly from [GitHub Releases](#-download--install) — it's free and functionally identical.

**Why does nothing happen when I open a `.md` file?**
Either (a) the extension isn't installed/reloaded, (b) you're on a `file://` URL without "Allow access to file URLs" enabled, or (c) the tab was open before reloading the extension. Close the tab and open a fresh one.

**Why isn't my font showing up?**
Fonts are read from your OS. Install the font first, then restart Chrome. Check the live preview in Options to confirm the browser can see it.

**Can I use it on Firefox?**
Not yet. Firefox's MV3 implementation differs enough that this needs a separate port. Tracked on the roadmap as v2.0.

**How do I report a bug?**
Open an [issue](https://github.com/mimdal-code/markdown-render-chrome-extension/issues) with:
- The Markdown text that broke (redact anything private)
- Your Chrome version
- The expected vs. actual rendering
- A screenshot if possible

---

## License

[MIT](LICENSE) © 2026 Mimdal

---

## Acknowledgements

- Inspired by the classic [Markdown Viewer](https://github.com/simov/markdown-viewer) extension
- Font recommendations: [Vazirmatn](https://github.com/rastikerdar/vazirmatn) by Saber Rastikerdar, [Noto Naskh Arabic](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic) by Google
- Bidi guidance from the [Unicode Bidirectional Algorithm](https://www.unicode.org/reports/tr9/)
```

---

## `LICENSE` (updated copyright holder)

```text
MIT License

Copyright (c) 2026 Mimdal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
