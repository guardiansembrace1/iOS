"use client";
// Reads a chapter aloud with the browser's free Speech Synthesis API,
// one verse at a time so the reader can mark the verse being read.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type SpeechStatus = "idle" | "playing" | "paused";

const noopSubscribe = () => () => {};

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-US" && v.localService) ??
    voices.find((v) => v.lang?.startsWith("en") && v.localService) ??
    voices.find((v) => v.lang?.startsWith("en"))
  );
}

export function useSpeech() {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    () => false
  );
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [current, setCurrent] = useState<number | null>(null);
  const run = useRef(0);

  const stop = useCallback(() => {
    run.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrent(null);
  }, []);

  const play = useCallback((verses: string[], start = 0) => {
    const synth = window.speechSynthesis;
    run.current += 1;
    const token = run.current;
    synth.cancel();
    const voice = pickVoice();

    const speakFrom = (i: number) => {
      if (token !== run.current) return;
      if (i >= verses.length) {
        setStatus("idle");
        setCurrent(null);
        return;
      }
      const u = new SpeechSynthesisUtterance(verses[i]);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-US";
      u.rate = 0.95;
      u.onstart = () => token === run.current && setCurrent(i);
      u.onend = () => speakFrom(i + 1);
      u.onerror = (e) => {
        // "interrupted"/"canceled" come from our own stop(); anything else ends playback.
        if (token !== run.current) return;
        if (e.error === "interrupted" || e.error === "canceled") return;
        setStatus("idle");
        setCurrent(null);
      };
      setCurrent(i);
      synth.speak(u);
    };

    setStatus("playing");
    speakFrom(start);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setStatus("playing");
  }, []);

  useEffect(() => {
    return () => {
      run.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return { supported, status, current, play, pause, resume, stop };
}
