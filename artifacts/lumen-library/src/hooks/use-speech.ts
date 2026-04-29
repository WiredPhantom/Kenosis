import { useState, useEffect } from "react";

export function useSpeech(text: string, rate: number = 0.95, pitch: number = 1.0) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [currentWord, setCurrentWord] = useState("");
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find a soft, natural female voice
        const preferredVoice = availableVoices.find(
          (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Aria") || v.name.includes("Natural")
        );
        setSelectedVoice(preferredVoice || availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const play = () => {
    if (typeof window === "undefined") return;
    if (isPlaying) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const word = text.substring(event.charIndex, event.charIndex + event.charLength);
        setCurrentWord(word);
        setProgress(event.charIndex / text.length);
        setIsSpeakingWord(true);
        setTimeout(() => setIsSpeakingWord(false), 100);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(1);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const pause = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentWord("");
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isPlaying,
    play,
    pause,
    stop,
    progress,
    currentWord,
    isSpeakingWord,
  };
}
