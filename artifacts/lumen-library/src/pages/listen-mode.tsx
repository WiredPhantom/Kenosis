import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import NarratorPersona from "@/components/NarratorPersona";

export default function ListenModePage() {
  const params = useParams();
  const book = books.find(b => b.id === params.id);
  
  const [speed, setSpeed] = useState(1);
  const fullText = book ? book.summarySections.map(s => `${s.heading}. ${s.paragraphs.join(" ")}`).join(" ") : "";
  
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isPlaying,
    play,
    pause,
    stop,
    progress,
    currentWord,
    isSpeakingWord
  } = useSpeech(fullText, speed);

  useEffect(() => {
    if (book) {
      document.title = `Listening: ${book.title} - Lumen`;
    }
  }, [book]);

  // Extract a sensible caption from the full text around the current progress
  const getCaption = () => {
    if (!isPlaying && progress === 0) return "Ready to begin.";
    if (!isPlaying && progress > 0 && progress < 1) return "Paused.";
    if (progress === 1) return "Finished.";
    
    // Simplistic caption logic: show the word and some context
    return currentWord ? `... ${currentWord} ...` : "Loading...";
  };

  if (!book) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden"
    >
      {/* Stage Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <Link href={`/book/${book.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        <div className="text-center bg-background/50 backdrop-blur-sm px-6 py-2 rounded-full border border-border/50">
          <h2 className="text-sm font-serif font-medium">{book.title}</h2>
          <p className="text-xs text-muted-foreground">{book.author}</p>
        </div>
        <div className="w-[100px]" /> {/* Spacer for centering */}
      </header>

      {/* Main Stage */}
      <main className="flex-1 relative flex flex-col items-center justify-center z-10 pt-8 pb-32">
        <NarratorPersona isPlaying={isPlaying} isSpeakingWord={isSpeakingWord} />
        
        {/* Caption */}
        <div className="mt-16 h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={getCaption()}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-xl md:text-2xl font-serif text-foreground/80 text-center max-w-2xl px-6"
            >
              {getCaption()}
            </motion.p>
          </AnimatePresence>
        </div>
      </main>

      {/* Player Controls */}
      <footer className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/50 p-6 z-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Progress Bar */}
          <div className="mb-6 relative">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                style={{ width: `${progress * 100}%` }}
                layout
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls - Voice/Speed */}
            <div className="flex items-center gap-4 w-1/3">
              <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
                <SelectTrigger className="w-[80px] h-9 text-xs bg-card">
                  <SelectValue placeholder="1x" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">0.8x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.2">1.2x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                </SelectContent>
              </Select>
              
              {voices.length > 0 && (
                <Select 
                  value={selectedVoice?.name} 
                  onValueChange={(name) => {
                    const voice = voices.find(v => v.name === name);
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-9 text-xs bg-card truncate hidden md:flex">
                    <Volume2 className="w-3 h-3 mr-2 shrink-0" />
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.filter(v => v.lang.startsWith('en')).map(v => (
                      <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {voices.length === 0 && <span className="text-xs text-muted-foreground">Loading voices...</span>}
            </div>

            {/* Center Controls - Play/Pause */}
            <div className="flex items-center justify-center gap-6 w-1/3">
              <button 
                onClick={stop}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button 
                onClick={isPlaying ? pause : play}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>
            </div>

            {/* Right Controls */}
            <div className="w-1/3 flex justify-end">
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
