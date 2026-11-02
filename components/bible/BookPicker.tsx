"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { BOOKS, type Book } from "@/lib/bible";

interface BookPickerProps {
  current: Book;
  currentChapter: number;
  onSelect: (book: Book, chapter: number) => void;
  onClose: () => void;
}

/**
 * Full-screen sheet: pick a book, then a chapter. Opens on the book list with
 * a search box, because scrolling to Habakkuk is tedious.
 */
export default function BookPicker({
  current,
  currentChapter,
  onSelect,
  onClose,
}: BookPickerProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BOOKS;
    return BOOKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  const oldTestament = results.filter((b) => b.testament === "OT");
  const newTestament = results.filter((b) => b.testament === "NT");

  if (book) {
    return (
      <Sheet
        title={book.name}
        subtitle={`${book.chapters} ${book.chapters === 1 ? "chapter" : "chapters"}`}
        onBack={() => setBook(null)}
        onClose={onClose}
      >
        <div className="grid grid-cols-5 gap-2 p-5">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => {
            const active = book.slug === current.slug && n === currentChapter;
            return (
              <button
                key={n}
                onClick={() => onSelect(book, n)}
                className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--color-gold)] text-white"
                    : "bg-[var(--color-card)] text-[var(--color-ink)] border border-[var(--color-border)]"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Books" onClose={onClose}>
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          />
        </div>
      </div>

      <div className="px-5 pb-8">
        {results.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-ink-muted)]">
            No book matches “{query.trim()}”.
          </p>
        )}
        <BookGroup label="Old Testament" books={oldTestament} current={current} onPick={setBook} />
        <BookGroup label="New Testament" books={newTestament} current={current} onPick={setBook} />
      </div>
    </Sheet>
  );
}

function BookGroup({
  label,
  books,
  current,
  onPick,
}: {
  label: string;
  books: Book[];
  current: Book;
  onPick: (book: Book) => void;
}) {
  if (books.length === 0) return null;
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}
      </h3>
      <ul>
        {books.map((b) => (
          <li key={b.slug}>
            <button
              onClick={() => onPick(b)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                b.slug === current.slug
                  ? "font-semibold text-[var(--color-gold)]"
                  : "text-[var(--color-ink)]"
              }`}
            >
              {b.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Sheet({
  title,
  subtitle,
  onBack,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[var(--color-bg)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        {onBack && (
          <button onClick={onBack} aria-label="Back to books" className="-ml-1 p-1">
            <ChevronLeft size={20} color="var(--color-gold)" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-[family-name:var(--font-heading)] text-lg text-[var(--color-ink)]">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--color-ink-muted)]">{subtitle}</p>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" className="p-1">
          <X size={20} color="var(--color-ink-muted)" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
