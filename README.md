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
  <a href="#keyboard-shortcuts">Shortcuts</a> •
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
md-rtl-reader-<version>.zip
```

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

### Step 4 — Enable file URL access (for local Markdown)

If you want to open local `.md` files (`file:///…/README.md`), you must grant one extra permission:

1. On the extension card, click **Details**.
2. Scroll to **"Allow access to file URLs"** and toggle it **on**.

### Step 5 — Verify it works

Open any `.md` file in Chrome:

```
file:///path/to/README.md
https://raw.githubusercontent.com/.../README.md
```

The plain-text page should be replaced by the rendered viewer.

### Updating to a newer release

1. Download the newest `.zip` from [Releases](https://github.com/mimdal-code/markdown-render-chrome-extension/releases).
2. Unzip it, **replacing** the contents of your existing folder.
3. Go to `chrome://extensions` and click **Reload** (⟳) on the extension card.
4. Close any open `.md` tabs and reopen them.

### Troubleshooting manual install

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Manifest file is missing or unreadable" | Wrong folder selected | Select the folder that **directly contains** `manifest.json` |
| Nothing happens on `.md` files | File URLs not enabled, or stale tab | Enable "Allow access to file URLs"; close and reopen the tab |
| "This extension may have been corrupted" | You moved/deleted the folder after installing | Move it back, or reload via `chrome://extensions` |
| Extension disappears after Chrome restart | Same as above | Re-load unpacked from the same folder |

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
- **Task lists** — `- [ ]` / `- [x]` render as clickable checkboxes, persisted per file
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
- Colors preserved in print and PDF export

### 🖨 Print / PDF export
- **Full multi-page pagination** — the article is no longer clipped to one page
- **Full page width** — print output spans the whole page, not the narrow screen column
- **Colored headings** — navy blue family across all six levels
- **Syntax-highlighted code** — keywords, strings, functions, comments keep their colors in print
- **Link decoration** — every external link gets a `↗` icon before it and its full URL in parentheses after
- **Tables** — light-gray header rows, zebra striping, crisp borders
- **Task lists as glyphs** — `○` for open, `●` in blue for done
- **Page-break control** — headings never orphan, code blocks and tables never split across pages
- Works for RTL and LTR documents

### 🔍 In-page search
- Always-visible search box in the toolbar
- **Ctrl+F** focuses it (replaces the browser's find dialog)
- **Exact substring matching** — highlights every occurrence in yellow, active match in orange
- Live counter shows `N / M` (current position / total matches)
- **Enter** / **n** → next match, **Shift+Enter** / **N** → previous
- **Esc** → clears highlights and returns to normal view
- Auto-scrolls the active match into view
- Works with Persian, Arabic, and Hebrew text

### 🧭 Sidebar
- Persistent left sidebar (collapsible with **Ctrl+B** or `[`)
- **TOC** tab: nested outline by heading level, active-section tracking, smooth scroll
- **Files** tab: placeholder (coming soon)

### 🔗 Heading anchors
- Hover any heading → a small `#` appears
- Click it to copy a permalink (`file://…/README.md#section-id`) to the clipboard
- Same anchor IDs are used by the TOC — links stay consistent

### ⌨️ Keyboard navigation
- `j` / `k` → next / previous heading
- `g g` → scroll to top, `G` → scroll to bottom
- `[` → toggle sidebar
- `Ctrl+F` → search, `Esc` → clear
- `?` → open help modal
- `Ctrl+B` → toggle sidebar

### ❓ Help modal
- Press `?` anywhere in the article to open
- Lists all keyboard shortcuts, search controls, print behavior
- Includes notes about fonts, privacy, and settings storage
- Shows the current version and links to GitHub
- Close with `Esc`, the **✕** button, or by clicking outside the modal

### 📋 Copy buttons
- Every code block has a flat **Copy** button in the top corner
- Uses `navigator.clipboard` with `execCommand` fallback
- Shows "Copied" feedback for 1.2s

### 🎛 Layout & themes
- Three page width modes: **Narrow (620px)**, **Normal (860px)**, **Wide (95%)**
- Three themes: **Light**, **Dark**, **Sepia**
- Flat design — no rounded corners, no shadows, no gradients
- Adjustable base font size (14–22px)
- Scrollbar always at the far right of the page (or left in RTL)
- Table rows highlight on hover

### 🔒 Privacy
- **No network requests** at runtime
- **No analytics, no telemetry, no tracking**
- **No external fonts or scripts**
- Settings stored in `chrome.storage.sync`, task states in `chrome.storage.local`

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `j` | Scroll to next heading |
| `k` | Scroll to previous heading |
| `g g` | Scroll to top (press `g` twice within 500ms) |
| `G` | Scroll to bottom |
| `[` | Toggle sidebar |
| `Ctrl+B` / `Cmd+B` | Toggle sidebar |
| `Ctrl+F` / `Cmd+F` | Focus the search box |
| `Enter` | Jump to next search match |
| `Shift+Enter` | Jump to previous search match |
| `n` / `N` | Next / previous match (when search has a query) |
| `Esc` | Clear search, or close help modal |
| `?` | Open help modal |
| `Ctrl+P` / `Cmd+P` | Print / Save as PDF |

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
| ☰ | Toggle the sidebar |
| Title | Document name (no file path shown) |
| **Search** | In-page search (see shortcuts above) |
| **Width** | Narrow / Normal / Wide |
| **Theme** | Light / Dark / Sepia |
| **Direction** | Auto / RTL / LTR |
| **Per-block bidi** | Tag each block with its own direction |
| **Size** | Base font size 14–22px |
| **?** | Open the help modal |

### Sidebar

- **TOC** — nested outline built from `h1`–`h6`, active-section highlight, click to scroll.
- **Files** — reserved for a future file browser.

### Code blocks

Every fenced code block gets:

- A **language chip** in the top-left corner (top-right in RTL).
- A **Copy** button in the opposite corner.

### Task lists

```markdown
- [ ] Buy milk
- [x] Buy bread
- [ ] Call the plumber
```

Render as clickable checkboxes. Checked items get a strikethrough and muted color. State is saved per file — reopen the document later and your checkmarks are still there.

### Printing to PDF

1. Press **Ctrl+P** in the viewer.
2. In the print dialog, expand **More settings** and check **Background graphics** (Chrome doesn't print backgrounds by default).
3. Choose **Save as PDF**.

The resulting PDF:
- Spans the full page width
- Contains every page of the document
- Keeps colored headings, syntax-highlighted code, table styling, and link icons
- Shows URLs after every external link
- Has proper page breaks between sections

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
│   └─ viewer.js   │  TOC, search, keyboard, print, bidi
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
- **Print-safe.** The `@media print` block flattens every `height: 100vh` / `overflow: hidden` container so content paginates naturally, then applies its own color palette (dark ink, navy headings, GitHub-style token colors) and link decoration.

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
│   │   ├── viewer.html         Viewer UI (sidebar + toolbar + article + help)
│   │   ├── viewer.css          Themes, fonts, layout, token colors, print
│   │   └── viewer.js           TOC, search, keyboard, tasks, anchors, help
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
        ├── persian-english-mixed.md
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
| Viewer | Right-click inside the rendered article → **Inspect** |
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

Produces `md-rtl-reader-<version>.zip`.

### Automated releases (GitHub Actions)

Push a version tag and the CI workflow in `.github/workflows/release.yaml` packages the extension and attaches it to a new GitHub Release:

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
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
- [x] v1.1 — Print/PDF export, heading anchors, keyboard nav, task lists, in-page search, help modal
- [ ] v1.2 — File browser in sidebar (browse sibling `.md` files in the same directory)
- [ ] v1.3 — Export to standalone HTML
- [ ] v1.4 — Footnotes, definition lists
- [ ] v1.5 — Custom theme editor
- [ ] v1.6 — Publish to Chrome Web Store (pending $5 developer registration)
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

**Why does the print preview show only one page?**
Make sure the extension was reloaded and you opened a **fresh** `.md` tab after reloading — Chrome caches the CSS per tab. If it still clips, verify the extension is on the latest release (the `@media print` block was fixed in v1.1).

**Why don't my PDF colors show?**
Chrome doesn't print background colors by default. In the print dialog, expand **More settings** and check **Background graphics**. The extension forces `print-color-adjust: exact` on everything inside `@media print`, so colors should appear once that box is checked.

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
