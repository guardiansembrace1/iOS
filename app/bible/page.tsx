"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Type, WifiOff, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BookPicker from "@/components/bible/BookPicker";
import {
  BOOKS,
  TOTAL_CHAPTERS,
  getBook,
  loadChapter,
  referenceFor,
  stepChapter,
  verseText,
  type Book,
  type Verse,
} from "@/lib/bible";

const PLACE_KEY = "ge.bible.place";
const SIZE_KEY = "ge.bible.size";

const SIZES = [
  { label: "S", text: "text-[15px]", leading: "leading-[1.8]" },
  { label: "M", text: "text-[17px]", leading: "leading-[1.9]" },
  { label: "L", text: "text-[20px]", leading: "leading-[1.95]" },
];

const DEFAULT_BOOK = getBook("psalms")!;
const DEFAULT_CHAPTER = 82;

interface Note {
  id: string;
  verse_ref: string;
  note_text: string;
}

export default function BiblePage() {
  const [book, setBook] = useState<Book>(DEFAULT_BOOK);
  const [chapter, setChapter] = useState(DEFAULT_CHAPTER);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Chapter text and notes are stored against the reference they belong to, so
  // "still loading" is derived rather than set — switching chapters cannot
  // briefly show the previous chapter's text under the new heading.
  const place = `${book.slug}:${chapter}`;
  const [result, setResult] = useState<{
    place: string;
    verses?: Verse[];
    error?: string;
  } | null>(null);
  const [notesFor, setNotesFor] = useState<{ place: string; notes: Note[] } | null>(null);

  const verses = result?.place === place ? result.verses : undefined;
  const error = result?.place === place ? result.error : undefined;
  const notes = userId && notesFor?.place === place ? notesFor.notes : [];

  const scroller = useRef<HTMLDivElement>(null);

  /*
   * Restore where the reader left off. This has to run after mount rather than
   * in a state initialiser: the page is prerendered at build time, where there
   * is no localStorage, so reading it during render would mismatch hydration.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLACE_KEY);
      if (saved) {
        const { slug, chapter: savedChapter } = JSON.parse(saved);
        const savedBook = getBook(slug);
        if (savedBook && savedChapter >= 1 && savedChapter <= savedBook.chapters) {
          setBook(savedBook);
          setChapter(savedChapter);
        }
      }
      // Number(null) is 0, so check the raw value before parsing it —
      // otherwise a reader who has never set a size gets the smallest one.
      const savedSize = localStorage.getItem(SIZE_KEY);
      if (savedSize !== null) {
        const size = Number(savedSize);
        if (Number.isInteger(size) && size >= 0 && size < SIZES.length) {
          setSizeIndex(size);
        }
      }
    } catch {
      // Private browsing or blocked storage — the defaults are fine.
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  // Load the chapter whenever book or chapter changes.
  useEffect(() => {
    let active = true;

    loadChapter(book, chapter)
      .then((loaded) => {
        if (active) setResult({ place, verses: loaded });
      })
      .catch(() => {
        if (active) {
          setResult({ place, error: "Could not load this chapter. Please try again." });
        }
      });

    try {
      localStorage.setItem(PLACE_KEY, JSON.stringify({ slug: book.slug, chapter }));
    } catch {
      // Private browsing or blocked storage — losing the bookmark is fine.
    }
    scroller.current?.scrollTo({ top: 0 });

    return () => {
      active = false;
    };
  }, [book, chapter, place]);

  // Bumped after saving a note, to pull the chapter's notes again.
  const [notesVersion, setNotesVersion] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    (async () => {
      const { data } = await supabase
        .from("notes")
        .select("id, verse_ref, note_text")
        .eq("user_id", userId)
        .like("verse_ref", `${referenceFor(book, chapter)}:%`)
        .order("created_at", { ascending: false });
      if (active) setNotesFor({ place, notes: (data as Note[]) ?? [] });
    })();

    return () => {
      active = false;
    };
  }, [userId, book, chapter, place, notesVersion]);

  function go(direction: 1 | -1) {
    const next = stepChapter(book, chapter, direction);
    if (!next) return;
    setBook(next.book);
    setChapter(next.chapter);
  }

  function cycleSize() {
    const next = (sizeIndex + 1) % SIZES.length;
    setSizeIndex(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      // Not fatal.
    }
  }

  async function saveNote() {
    if (!userId || !activeVerse || !draft.trim()) return;
    setSaving(true);
    const { error: saveError } = await supabase.from("notes").insert({
      user_id: userId,
      verse_ref: referenceFor(book, chapter, activeVerse.number),
      note_text: draft.trim(),
    });
    setSaving(false);
    if (!saveError) {
      setDraft("");
      setActiveVerse(null);
      setNotesVersion((v) => v + 1);
    }
  }

  const size = SIZES[sizeIndex];
  const previous = stepChapter(book, chapter, -1);
  const next = stepChapter(book, chapter, 1);
  const notedVerses = new Set(notes.map((n) => n.verse_ref));

  return (
    <div className="relative h-full">
      {pickerOpen && (
        <BookPicker
          current={book}
          currentChapter={chapter}
          onSelect={(b, c) => {
            setBook(b);
            setChapter(c);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div ref={scroller} className="h-full overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1 font-[family-name:var(--font-heading)] text-lg text-[var(--color-ink)]"
          >
            {referenceFor(book, chapter)}
            <ChevronRight size={16} color="var(--color-gold)" />
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-card-muted)] px-2.5 py-1 text-xs font-medium">
              KJV
            </span>
            <button
              onClick={cycleSize}
              aria-label="Change text size"
              className="flex items-center gap-1 rounded-full bg-[var(--color-card-muted)] px-2.5 py-1 text-xs font-medium"
            >
              <Type size={13} /> {size.label}
            </button>
          </div>
        </div>

        <div className="px-5 pb-10 pt-5">
          {error && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
          )}

          {!verses && !error && (
            <div className="animate-pulse space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-[var(--color-card-muted)]" />
              ))}
            </div>
          )}

          {verses && (
            <p
              className={`font-[family-name:var(--font-heading)] text-[var(--color-ink)] ${size.text} ${size.leading}`}
            >
              {verses.map((verse) => {
                const ref = referenceFor(book, chapter, verse.number);
                const hasNote = notedVerses.has(ref);
                return (
                  <span key={verse.number}>
                    {verse.paragraph && verse.number !== 1 && (
                      <span className="block h-4" aria-hidden />
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => userId && setActiveVerse(verse)}
                      onKeyDown={(e) => {
                        if (userId && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setActiveVerse(verse);
                        }
                      }}
                      className={`${userId ? "cursor-pointer" : ""} ${
                        hasNote ? "rounded bg-[var(--color-card-muted)] px-0.5" : ""
                      }`}
                    >
                      <sup className="font-sans text-xs font-semibold text-[var(--color-gold)]">
                        {verse.number}
                      </sup>{" "}
                      {verse.segments.map((segment, i) =>
                        segment.italic ? (
                          <em key={i} className="italic">
                            {segment.text}
                          </em>
                        ) : (
                          <span key={i}>{segment.text}</span>
                        )
                      )}
                    </span>{" "}
                  </span>
                );
              })}
            </p>
          )}

          {!userId && verses && (
            <p className="mt-6 text-xs text-[var(--color-ink-muted)]">
              <a href="/sign-in" className="font-semibold text-[var(--color-gold)]">
                Sign in
              </a>{" "}
              to save notes on any verse.
            </p>
          )}

          {notes.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Your notes on this chapter
              </p>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"
                >
                  <p className="mb-1 text-xs font-semibold text-[var(--color-gold)]">
                    {note.verse_ref}
                  </p>
                  <p className="text-sm text-[var(--color-ink)]">{note.note_text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between text-sm font-medium text-[var(--color-ink-muted)]">
            <button
              onClick={() => go(-1)}
              disabled={!previous}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              {previous ? referenceFor(previous.book, previous.chapter) : "Start"}
            </button>
            <button
              onClick={() => go(1)}
              disabled={!next}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              {next ? referenceFor(next.book, next.chapter) : "End"}
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
            <WifiOff size={18} color="var(--color-ink-muted)" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Works without signal
              </p>
              <p className="text-xs text-[var(--color-ink-muted)]">
                All {TOTAL_CHAPTERS.toLocaleString()} chapters across {BOOKS.length} books
                are stored on the phone
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeVerse && (
        <div className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-2xl">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-gold)]">
                {referenceFor(book, chapter, activeVerse.number)}
              </p>
              <p className="line-clamp-2 text-xs text-[var(--color-ink-muted)]">
                {verseText(activeVerse)}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveVerse(null);
                setDraft("");
              }}
              aria-label="Close"
              className="shrink-0 p-1"
            >
              <X size={18} color="var(--color-ink-muted)" />
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Write your note…"
            className="mb-3 w-full rounded-xl border border-[var(--color-border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          />
          <button
            onClick={saveNote}
            disabled={saving || !draft.trim()}
            className="w-full rounded-xl bg-[var(--color-gold)] p-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>
      )}
    </div>
  );
}
