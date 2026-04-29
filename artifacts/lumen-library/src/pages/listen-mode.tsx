import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Sparkles, Pencil, BookOpen } from "lucide-react";
import { useSpeech, type EmotionTag } from "@/hooks/use-speech";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import NarratorStage from "@/components/NarratorStage";

const EMOTION_LABEL: Record<EmotionTag, string> = {
  neutral: "Calm",
  soft: "Soft",
  happy: "Bright",
  sad: "Tender",
  serious: "Intent",
};

const EMOTION_COLOR: Record<EmotionTag, string> = {
  neutral: "from-stone-300/30 via-stone-200/10 to-transparent",
  soft: "from-rose-300/30 via-amber-200/10 to-transparent",
  happy: "from-amber-300/40 via-yellow-200/15 to-transparent",
  sad: "from-blue-300/30 via-indigo-200/10 to-transparent",
  serious: "from-red-300/30 via-orange-200/10 to-transparent",
};

function buildScriptFromBook(book: (typeof books)[number]) {
  // Decorate the book summary with emotion tags so the narrator emotes naturally.
  const lines: string[] = [];
  lines.push(`[soft] ${book.title}, by ${book.author}.`);
  lines.push(`[neutral] ${book.shortDescription}`);

  book.summarySections.forEach((section, i) => {
    const tag = i === 0 ? "[serious]" : i % 3 === 1 ? "[soft]" : i % 3 === 2 ? "[happy]" : "[neutral]";
    lines.push(`${tag} ${section.heading}.`);
    section.paragraphs.forEach((p) => lines.push(`[neutral] ${p}`));
  });

  if (book.keyTakeaways?.length) {
    lines.push(`[happy] Key takeaways.`);
    book.keyTakeaways.forEach((t) => lines.push(`[soft] ${t}`));
  }
  lines.push(`[soft] Thank you for listening. Until next time.`);
  return lines.join(" ");
}

const MODEL_URL = `${import.meta.env.BASE_URL}models/narrator.vrm`;

export default function ListenModePage() {
  const params = useParams();
  const book = books.find((b) => b.id === params.id);

  const [speed, setSpeed] = useState(0.9);
  const [showEditor, setShowEditor] = useState(false);
  const [customText, setCustomText] = useState("");
  const [activeText, setActiveText] = useState("");

  const defaultScript = useMemo(() => (book ? buildScriptFromBook(book) : ""), [book]);

  // Initialize active text once the book loads
  useEffect(() => {
    if (book && !activeText) {
      setActiveText(defaultScript);
      setCustomText(defaultScript);
    }
  }, [book, defaultScript, activeText]);

  const {
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
    segments,
    play,
    pause,
    stop,
    supportsSpeech,
  } = useSpeech(activeText, speed);

  useEffect(() => {
    if (book) document.title = `Listening: ${book.title} — Lumen`;
  }, [book]);

  const captionText = useMemo(() => {
    if (!supportsSpeech) return "Your browser doesn't support voice synthesis.";
    if (!isPlaying && !isPaused && progress === 0) return "Press play to begin the narration.";
    if (isPaused) return "Paused.";
    if (progress >= 1) return "Finished — well done.";
    if (currentSegmentIndex >= 0 && segments[currentSegmentIndex]) {
      return segments[currentSegmentIndex].text;
    }
    return currentWord ? `… ${currentWord} …` : "Loading voices…";
  }, [supportsSpeech, isPlaying, isPaused, progress, currentSegmentIndex, segments, currentWord]);

  const applyCustomText = () => {
    stop();
    setActiveText(customText.trim() || defaultScript);
    setShowEditor(false);
  };

  const resetToBook = () => {
    stop();
    setCustomText(defaultScript);
    setActiveText(defaultScript);
  };

  if (!book) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden"
    >
      {/* Stage glow that responds to the current emotion */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          <motion.div
            key={currentEmotion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[1000px] h-[1000px] rounded-full blur-[140px] bg-gradient-radial ${EMOTION_COLOR[currentEmotion]}`}
            style={{
              background: `radial-gradient(circle, var(--tw-gradient-stops))`,
            }}
          />
        </AnimatePresence>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex justify-between items-center gap-3">
        <Link
          href={`/book/${book.id}`}
          className="kawaii-pill inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-pixel text-rose-500 bg-card/90 backdrop-blur-sm hover:bg-pink-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          back
        </Link>

        <div className="text-center kawaii-frame-solid bg-card/90 backdrop-blur-sm px-5 py-1.5">
          <h2 className="font-cute text-lg text-rose-500 leading-tight">{book.title}</h2>
          <p className="text-[10px] font-pixel text-foreground/55 leading-tight">by {book.author}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 font-pixel text-[10px] text-rose-500 bg-pink-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {EMOTION_LABEL[currentEmotion]}
          </span>
          <button
            className="kawaii-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-pixel text-rose-500 bg-card/90 backdrop-blur-sm hover:bg-pink-50"
            onClick={() => setShowEditor((s) => !s)}
          >
            <Pencil className="w-3 h-3" />
            script
          </button>
        </div>
      </header>

      {/* Stage */}
      <main className="flex-1 relative flex flex-col items-center justify-center z-10 pt-2 pb-44">
        <div className="relative w-[min(520px,90vw)] h-[min(520px,60vh)]">
          <NarratorStage
            modelUrl={MODEL_URL}
            isPlaying={isPlaying}
            isSpeakingWord={isSpeakingWord}
            emotion={currentEmotion}
          />
        </div>

        {/* Caption strip */}
        <div className="mt-4 px-6 max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${currentSegmentIndex}-${captionText.slice(0, 24)}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-base md:text-lg font-serif text-foreground/85 text-center leading-relaxed bg-background/60 backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/40 shadow-sm min-h-[3.5rem] flex items-center justify-center"
            >
              {captionText}
            </motion.p>
          </AnimatePresence>
        </div>
      </main>

      {/* Editor drawer */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-background/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-medium">Custom narration script</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drop in any text. Add tags like <code className="bg-muted px-1 rounded">[soft]</code>{" "}
                    <code className="bg-muted px-1 rounded">[happy]</code>{" "}
                    <code className="bg-muted px-1 rounded">[sad]</code>{" "}
                    <code className="bg-muted px-1 rounded">[serious]</code>{" "}
                    <code className="bg-muted px-1 rounded">[neutral]</code> to shift the narrator's mood.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>Close</Button>
              </div>

              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="[soft] Begin with a quiet thought… [serious] Then make your point. [happy] End on a bright note."
                className="min-h-[260px] font-serif text-base leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <Button variant="ghost" size="sm" onClick={resetToBook}>
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Reset to book summary
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
                  <Button onClick={applyCustomText}>Use this script</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player */}
      <footer className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-md border-t border-border/50 p-5 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 relative">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-1/3 min-w-0">
              <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
                <SelectTrigger className="w-[78px] h-9 text-xs bg-card">
                  <SelectValue placeholder="0.9x" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">0.8x</SelectItem>
                  <SelectItem value="0.85">0.85x</SelectItem>
                  <SelectItem value="0.9">0.9x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.15">1.15x</SelectItem>
                </SelectContent>
              </Select>

              {voices.length > 0 ? (
                <Select
                  value={selectedVoice?.name || ""}
                  onValueChange={(name) => {
                    const v = voices.find((x) => x.name === name);
                    if (v) setSelectedVoice(v);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-card hidden md:flex min-w-0">
                    <Volume2 className="w-3 h-3 mr-2 shrink-0" />
                    <SelectValue placeholder="Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices
                      .filter((v) => v.lang.toLowerCase().startsWith("en"))
                      .map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs text-muted-foreground italic hidden md:inline">Loading voices…</span>
              )}
            </div>

            <div className="flex items-center justify-center gap-5 w-1/3">
              <button
                onClick={stop}
                disabled={!supportsSpeech || (progress === 0 && !isPlaying && !isPaused)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                title="Restart"
                aria-label="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={isPlaying ? pause : play}
                disabled={!supportsSpeech}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setShowEditor(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                title="Edit script"
                aria-label="Edit script"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>

            <div className="w-1/3 flex items-center justify-end gap-3">
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
