import { useState, useEffect, useRef, useCallback } from "react";

export type EmotionTag = "neutral" | "soft" | "happy" | "sad" | "serious";

export interface SpeechSegment {
  text: string;
  emotion: EmotionTag;
  startOffset: number;
  endOffset: number;
}

const EMOTION_NAMES: EmotionTag[] = ["neutral", "soft", "happy", "sad", "serious"];

export function parseEmotionScript(input: string): SpeechSegment[] {
  const tagPattern = /\[(neutral|soft|happy|sad|serious)\]/gi;
  const segments: SpeechSegment[] = [];

  let cursor = 0;
  let currentEmotion: EmotionTag = "neutral";
  let cleanOffset = 0;

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(input)) !== null) {
    const before = input.slice(cursor, match.index);
    if (before.trim().length > 0) {
      const trimmed = before.replace(/\s+/g, " ");
      segments.push({
        text: trimmed,
        emotion: currentEmotion,
        startOffset: cleanOffset,
        endOffset: cleanOffset + trimmed.length,
      });
      cleanOffset += trimmed.length + 1;
    }
    currentEmotion = match[1].toLowerCase() as EmotionTag;
    cursor = match.index + match[0].length;
  }

  const tail = input.slice(cursor);
  if (tail.trim().length > 0) {
    const trimmed = tail.replace(/\s+/g, " ").trim();
    segments.push({
      text: trimmed,
      emotion: currentEmotion,
      startOffset: cleanOffset,
      endOffset: cleanOffset + trimmed.length,
    });
  }

  if (segments.length === 0 && input.trim().length > 0) {
    segments.push({
      text: input.replace(/\s+/g, " ").trim(),
      emotion: "neutral",
      startOffset: 0,
      endOffset: input.trim().length,
    });
  }

  return segments;
}

function rateForEmotion(base: number, emotion: EmotionTag): number {
  switch (emotion) {
    case "soft":
      return base * 0.92;
    case "sad":
      return base * 0.88;
    case "serious":
      return base * 0.95;
    case "happy":
      return base * 1.05;
    default:
      return base;
  }
}

function pitchForEmotion(base: number, emotion: EmotionTag): number {
  switch (emotion) {
    case "soft":
      return base * 0.98;
    case "sad":
      return base * 0.92;
    case "serious":
      return base * 0.95;
    case "happy":
      return base * 1.08;
    default:
      return base;
  }
}

export interface UseSpeechResult {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (v: SpeechSynthesisVoice) => void;
  isPlaying: boolean;
  isPaused: boolean;
  isSpeakingWord: boolean;
  currentEmotion: EmotionTag;
  currentWord: string;
  currentSegmentIndex: number;
  progress: number;
  segments: SpeechSegment[];
  totalChars: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  supportsSpeech: boolean;
}

export function useSpeech(rawText: string, baseRate: number = 0.9, basePitch: number = 1.0): UseSpeechResult {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionTag>("neutral");
  const [currentWord, setCurrentWord] = useState("");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [charsSpoken, setCharsSpoken] = useState(0);

  const segments = useRef<SpeechSegment[]>([]);
  const totalChars = useRef(0);
  const segmentIndexRef = useRef(0);
  const charsBeforeSegmentRef = useRef(0);
  const stoppedRef = useRef(false);
  const speakingWordTimer = useRef<number | null>(null);

  const supportsSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  // Re-parse when text changes
  useEffect(() => {
    segments.current = parseEmotionScript(rawText || "");
    totalChars.current = segments.current.reduce((acc, s) => acc + s.text.length, 0) || 1;
    segmentIndexRef.current = 0;
    charsBeforeSegmentRef.current = 0;
    setCurrentSegmentIndex(-1);
    setCharsSpoken(0);
    setCurrentEmotion(segments.current[0]?.emotion ?? "neutral");
    setCurrentWord("");
  }, [rawText]);

  // Load voices
  useEffect(() => {
    if (!supportsSpeech) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length > 0) {
        setSelectedVoice((prev) => {
          if (prev && list.find((v) => v.name === prev.name)) return prev;
          const preferred = list.find((v) =>
            /Samantha|Aria|Natural|Google UK English Female|Microsoft Zira|Karen|Serena|Allison/i.test(v.name) && v.lang.startsWith("en")
          );
          const englishFemale = list.find((v) => v.lang.startsWith("en"));
          return preferred || englishFemale || list[0];
        });
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supportsSpeech]);

  const speakSegment = useCallback(
    (idx: number) => {
      if (!supportsSpeech) return;
      const segs = segments.current;
      if (idx >= segs.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSegmentIndex(-1);
        setCurrentEmotion("neutral");
        setCharsSpoken(totalChars.current);
        return;
      }
      const segment = segs[idx];
      segmentIndexRef.current = idx;
      charsBeforeSegmentRef.current = segs.slice(0, idx).reduce((acc, s) => acc + s.text.length, 0);
      setCurrentSegmentIndex(idx);
      setCurrentEmotion(segment.emotion);

      const utterance = new SpeechSynthesisUtterance(segment.text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rateForEmotion(baseRate, segment.emotion);
      utterance.pitch = pitchForEmotion(basePitch, segment.emotion);

      utterance.onboundary = (event) => {
        if (event.name === "word" || event.name === undefined) {
          const word = segment.text.substring(event.charIndex, event.charIndex + (event.charLength || 0));
          if (word) setCurrentWord(word);
          setCharsSpoken(charsBeforeSegmentRef.current + event.charIndex);
          setIsSpeakingWord(true);
          if (speakingWordTimer.current !== null) {
            window.clearTimeout(speakingWordTimer.current);
          }
          speakingWordTimer.current = window.setTimeout(() => setIsSpeakingWord(false), 90);
        }
      };

      utterance.onend = () => {
        if (stoppedRef.current) return;
        setCharsSpoken(charsBeforeSegmentRef.current + segment.text.length);
        speakSegment(idx + 1);
      };

      utterance.onerror = () => {
        if (stoppedRef.current) return;
        speakSegment(idx + 1);
      };

      window.speechSynthesis.speak(utterance);
    },
    [supportsSpeech, selectedVoice, baseRate, basePitch]
  );

  const play = useCallback(() => {
    if (!supportsSpeech) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    if (isPlaying) return;
    stoppedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    speakSegment(0);
  }, [supportsSpeech, isPlaying, speakSegment]);

  const pause = useCallback(() => {
    if (!supportsSpeech) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, [supportsSpeech]);

  const stop = useCallback(() => {
    if (!supportsSpeech) return;
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIndex(-1);
    setCharsSpoken(0);
    setCurrentWord("");
    setCurrentEmotion(segments.current[0]?.emotion ?? "neutral");
  }, [supportsSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supportsSpeech) {
        stoppedRef.current = true;
        window.speechSynthesis.cancel();
      }
      if (speakingWordTimer.current !== null) {
        window.clearTimeout(speakingWordTimer.current);
      }
    };
  }, [supportsSpeech]);

  const progress = Math.min(1, charsSpoken / totalChars.current);

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isPlaying,
    isPaused,
    isSpeakingWord,
    currentEmotion,
    currentWord,
    currentSegmentIndex,
    progress,
    segments: segments.current,
    totalChars: totalChars.current,
    play,
    pause,
    stop,
    supportsSpeech,
  };
}
