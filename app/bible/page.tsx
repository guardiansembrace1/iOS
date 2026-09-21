"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BiblePage() {
  const [noteText, setNoteText] = useState("");
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [savedNotes, setSavedNotes] = useState<{ id: string; note_text: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const currentVerseRef = "Psalm 82:3";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        loadNotes(data.user.id);
      }
    });
  }, []);

  async function loadNotes(uid: string) {
    const { data } = await supabase
      .from("notes")
      .select("id, note_text")
      .eq("user_id", uid)
      .eq("verse_ref", currentVerseRef)
      .order("created_at", { ascending: false });
    if (data) setSavedNotes(data as { id: string; note_text: string }[]);
  }

  async function saveNote() {
    if (!userId || !noteText.trim()) return;
    const { error } = await supabase.from("notes").insert({
      user_id: userId,
      verse_ref: currentVerseRef,
      note_text: noteText.trim(),
    });
    if (!error) {
      setNoteText("");
      setShowNoteBox(false);
      loadNotes(userId);
    }
  }

  return (
    <div className="p-5 pb-10">
      <div className="flex justify-between items-center mb-1">
        <button className="flex items-center text-sm text-[var(--color-gold)] font-semibold">
          <ChevronLeft size={16} /> Psalms 82
        </button>
        <div className="flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card-muted)] font-medium">
            KJV
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card-muted)] font-medium">
            Aa
          </span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-ink-muted)] italic mb-5">A Psalm of Asaph</p>

      <p className="font-[family-name:var(--font-heading)] text-[17px] leading-[1.9] text-[var(--color-ink)] mb-5">
        <sup className="text-[var(--color-gold)] font-sans font-semibold text-xs">1</sup> God
        standeth in the congregation of the mighty; he judgeth among the gods.{" "}
        <sup className="text-[var(--color-gold)] font-sans font-semibold text-xs">2</sup> How long
        will ye judge unjustly, and accept the persons of the wicked?{" "}
        <mark
          className="bg-[var(--color-card-muted)] rounded px-0.5 cursor-pointer"
          onClick={() => userId && setShowNoteBox(true)}
          title={userId ? "Tap to add a note" : "Sign in to add notes"}
        >
          <sup className="text-[var(--color-gold)] font-sans font-semibold text-xs">3</sup> Defend
          the poor and fatherless: do justice to the afflicted and needy.
        </mark>{" "}
        <sup className="text-[var(--color-gold)] font-sans font-semibold text-xs">4</sup> Deliver
        the poor and needy: rid them out of the hand of the wicked.{" "}
        <sup className="text-[var(--color-gold)] font-sans font-semibold text-xs">5</sup> They
        know not, neither will they understand; they walk on in darkness.
      </p>

      {!userId && (
        <p className="text-xs text-[var(--color-ink-muted)] mb-5">
          <a href="/sign-in" className="text-[var(--color-gold)] font-semibold">
            Sign in
          </a>{" "}
          to save notes and highlights.
        </p>
      )}

      {showNoteBox && (
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 mb-4">
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">Note on {currentVerseRef}</p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
            rows={3}
            placeholder="Write your note…"
          />
          <div className="flex gap-2">
            <button
              onClick={saveNote}
              className="text-sm px-4 py-1.5 rounded-full bg-[var(--color-gold)] text-white font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setShowNoteBox(false)}
              className="text-sm px-4 py-1.5 rounded-full bg-[var(--color-card-muted)] text-[var(--color-ink)] font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {savedNotes.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Your notes
          </p>
          {savedNotes.map((n) => (
            <div
              key={n.id}
              className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-3 text-sm text-[var(--color-ink)]"
            >
              {n.note_text}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-[var(--color-ink-muted)] font-medium mb-5">
        <button className="flex items-center gap-1">
          <ChevronLeft size={16} /> Psalms 81
        </button>
        <button className="flex items-center gap-1">
          Psalms 83 <ChevronRight size={16} />
        </button>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 flex items-center gap-3">
        <WifiOff size={18} color="var(--color-ink-muted)" />
        <div>
          <p className="font-semibold text-[var(--color-ink)] text-sm">Works without signal</p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            All 1,189 chapters stored on the phone
          </p>
        </div>
      </div>
    </div>
  );
}