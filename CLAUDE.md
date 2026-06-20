# RotBash - Rotate and Bash

A single-page ROT-N / Atbash brute-forcer for geocaching puzzles. Generates every rotation of the
input (optionally also Reversed, Atbash, and Atbash+Reversed variants), scores each candidate, and
lists them with a details pane.

## Architecture split (non-obvious)

- **`rotbash-logic.js`** — pure, DOM-free core, the source of truth: `RotX`, `Atbash`,
  `generateSequences`, `englishChiSquared`, and the keyword/pattern helpers
  (`GetKeywordsInString`, `GetKeywordsArrayInString`, `GetPatternsInString`). Dual-exports for
  browser **and** Node so `test.html` runs headless.
- **`index.html`** — thin DOM glue only (`OnAction` reads checkboxes → `generateSequences` →
  `renderResults` → `#lbSequences`). Rendering/sorting/clipboard stay here, not in the logic file.
- **`test.html`** — calls the logic directly; 25 assertions. Run after any logic change.
- The keyword functions used to live in a separate `genanal.js` (now deleted, folded into the logic
  file). `GetPatternsInString` is exported and tested but **not wired into the UI** — it's a
  ready-to-use signal for a future "flag repeated substrings" feature.

## `generateSequences` order & counts (tests depend on this)

Blocks are emitted in a fixed order: **Normal, Reversed, Atbash, Atbash+reversed** — only the enabled
ones. Each block is the base text followed by rot-1..rot-(alphabetLength-1), so each block is
`alphabetLength` entries (26 for A–Z). `toUpper` is applied **before** any rotation. Entry 0 is always
the untransformed input.

## Scoring (two modes, mutually exclusive at runtime)

- **English-likeness** (`englishChiSquared`, the auto-solver): χ² distance to English letter
  frequencies, **lower = more English**. All candidates share length, so raw χ² compares directly
  across rotations. When the "Score by English-likeness" box is checked it **takes precedence over**
  keyword scoring; `renderResults` sorts ascending (best first) and auto-selects index 0.
- **Keyword**: score = `GetKeywordsInString(text, kw).join().length` — i.e. the *character length* of
  the comma-joined matches (legacy behavior, over-weights long keywords; preserved deliberately).
  Sorts descending.
- **Gotcha — χ² is reverse-invariant**: reversing a string leaves its letter counts unchanged, so
  English scoring **cannot** distinguish a string from its reverse (test 25 documents this). To
  surface a Reversed plaintext you must use keyword scoring, not English scoring — that's why
  Sample 3 (reverse demo) uses keywords.

## List entry format

Option text is `SCORE->desc-> text` (5-digit zero-padded score prefix when a score mode is on, e.g.
`00012->Normal+rot-3-> ...`). `ShowSelectDetails` recovers the candidate text via
`lastIndexOf("->") + 2`, so the literal `-> ` separator before the payload must stay intact.

## Caveats

- `rotx/` is a legacy VB6 project (the original desktop version) — unrelated to the web tool, leave
  it untouched.
- The built-in default sample decrypts at **rot-5** ("FIVE EIGHTY …"); the test smoke-checks that.
- Entirely client-side, no persistence. Styling follows the shared "Now Listen To Me" theme — see the
  `nltm-style` skill, not here.
