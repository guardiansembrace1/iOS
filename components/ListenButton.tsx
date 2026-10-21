"use client";
// Listen: reads a passage aloud with the phone's built-in voice (the free
// Speech Synthesis API, no account or API key). This is the free version of the
// Speechify idea from the 2026-10-14 meeting; a paid voice can replace useSpeech
// later without changing how pages use this button.
//
// Use it on any screen that has verse text:
//   <ListenButton verses={["In the beginning...", "And the earth..."]} onVerse={setReadingIndex} />
// onVerse gets the index of the verse being read (or null), so the page can mark it.
import { useEffect } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useSpeech } from "@/lib/useSpeech";

const chip =
  "inline-flex items-center justify-center gap-1.5 h-11 min-w-11 px-4 rounded-full text-sm font-medium " +
  "bg-[var(--color-card-muted)] text-[var(--color-ink)] transition-colors active:bg-[var(--color-border)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold-dark)]";

export default function ListenButton({
  verses,
  onVerse,
}: {
  verses: string[];
  onVerse?: (index: number | null) => void;
}) {
  const speech = useSpeech();
  const { current } = speech;

  useEffect(() => {
    onVerse?.(current);
  }, [current, onVerse]);

  // A phone or browser without the speech API gets no button rather than a broken one.
  if (!speech.supported || verses.length === 0) return null;

  if (speech.status === "idle") {
    return (
      <button type="button" className={chip} onClick={() => speech.play(verses)}>
        <Volume2 size={16} aria-hidden /> Listen
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Reading aloud">
      {speech.status === "playing" ? (
        <button type="button" className={chip} onClick={speech.pause} aria-label="Pause reading">
          <Pause size={16} aria-hidden /> Pause
        </button>
      ) : (
        <button type="button" className={chip} onClick={speech.resume} aria-label="Resume reading">
          <Play size={16} aria-hidden /> Resume
        </button>
      )}
      <button type="button" className={`${chip} !px-0`} onClick={speech.stop} aria-label="Stop reading">
        <Square size={14} aria-hidden />
      </button>
      {speech.current != null && (
        <span className="text-xs text-[var(--color-ink-muted)]" aria-live="polite">
          Verse {speech.current + 1} of {verses.length}
        </span>
      )}
    </div>
  );
}
