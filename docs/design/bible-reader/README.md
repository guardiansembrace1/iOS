# Bible reader: rough screens

Rough screens for the Bible reader, as promised in the team chat on 2026-10-13. They build on what's in the app now
(the KJV chapter view, verse notes, the KJV and Aa chips) and use the app's own look: cream page, black header, gold
accent, Playfair for headings and scripture, Inter for the interface. Shown at iPhone width (390 pt).

| Screen | What it does |
|---|---|
| `01-reader.jpg` | One chapter. The title is the chapter switcher (tap it). Search, Listen, KJV and Aa sit above the text. Verse numbers are small and gold; a highlighted verse keeps its colour. Previous / next chapter buttons sit at the end of the chapter and carry across books. |
| `02-book-picker.jpg` | Tap the chapter title: books split into Old and New Testament, each with its chapter count. Opens scrolled to the book you're in. |
| `03-chapter-grid.jpg` | Pick a book, then a chapter from a grid of large targets. "All books" goes back. |
| `04-reading-settings.jpg` | Aa: text size (4 steps), line spacing, serif or sans, with a live preview line. Saved on the device. |
| `05-verse-actions.jpg` | Tap any verse: highlight in four colours (or remove it), write a note (needs an account), copy, share. |
| `06-search.jpg` | Search the whole Bible by words or a reference like "John 3:16"; matches are marked; tap a result to jump to the verse. |

Behaviour notes for building it:
- Remember the last chapter read and open there next time.
- The whole KJV is public domain and small enough (about 4.2 MB) to ship inside the app, so reading works with no signal.
  Load one book at a time.
- Listen reads the open chapter aloud and marks the verse being read: `components/ListenButton.tsx` on this branch does
  that with the phone's free built-in voice. Pass it the chapter's verses.
- Notes need a free account; highlights can stay on the device until there's a table for them.
- 44 pt touch targets, and a visible focus ring for keyboard users only.
