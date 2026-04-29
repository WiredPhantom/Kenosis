import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { motion, useScroll, useSpring } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, Type, Minus, Plus, Heart } from "lucide-react";

export default function ReadModePage() {
  const params = useParams();
  const book = books.find(b => b.id === params.id);

  const [fontSize, setFontSize] = useState(18);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (book) document.title = `Reading ♡ ${book.title} — Lumen`;
  }, [book]);

  if (!book) return null;

  const wordCount = book.summarySections.reduce((acc: number, sec: any) =>
    acc + sec.paragraphs.reduce((pAcc: number, p: string) => pAcc + p.split(' ').length, 0)
  , 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-foreground transition-colors duration-500">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-rose-400 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Top bar */}
      <header className="h-16 shrink-0 px-4 flex items-center justify-between z-40 bg-background/80 backdrop-blur-sm border-b border-rose-200/50">
        <Link
          href={`/book/${book.id}`}
          className="kawaii-pill inline-flex items-center gap-2 px-3 py-1 text-[11px] font-pixel text-rose-500 hover:bg-pink-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          back
        </Link>

        <div className="text-center hidden md:block">
          <span className="font-cute text-lg text-rose-400">{book.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="kawaii-pill flex items-center px-1 py-0.5">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="p-1.5 text-rose-500 hover:bg-pink-50 rounded-full transition-colors"
              title="smaller"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Type className="w-3.5 h-3.5 mx-1 text-rose-300" />
            <button
              onClick={() => setFontSize(s => Math.min(26, s + 2))}
              className="p-1.5 text-rose-500 hover:bg-pink-50 rounded-full transition-colors"
              title="bigger"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Reading content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-[68ch] mx-auto px-4 py-10 pb-32"
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* Title card */}
          <div className="kawaii-frame px-6 md:px-10 py-8 md:py-10 mb-8 text-center relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-yellow-200/70 rounded-sm shadow-sm rotate-[-2deg]" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium leading-tight mb-3 text-foreground">{book.title}</h1>
            <p className="text-lg font-cute text-rose-400 mb-4">by {book.author}</p>
            <div className="flex items-center justify-center gap-3 font-pixel text-[10px] text-foreground/60">
              <span className="bg-pink-50 border border-rose-200 px-2 py-0.5 rounded-full">~{readingTime} min</span>
              <Heart className="w-3 h-3 text-rose-300 fill-rose-200" />
              <span className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">{wordCount} words</span>
            </div>
          </div>

          <div className="kawaii-frame px-6 md:px-10 py-8 md:py-10">
            <div className="font-serif leading-[1.85] text-foreground space-y-6">
              {book.summarySections.map((section: any, secIdx: number) => (
                <section key={secIdx} className="mb-8">
                  <h2 className="font-cute text-2xl md:text-3xl text-rose-500 mt-8 mb-4 flex items-center gap-2">
                    <span className="text-amber-400">✿</span>
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((para: string, pIdx: number) => {
                    const isFirstPara = secIdx === 0 && pIdx === 0;
                    return (
                      <p
                        key={pIdx}
                        className={`mb-5 text-foreground/85 ${isFirstPara ? 'first-letter:text-6xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-3 first-letter:-mt-1 first-letter:leading-[0.85] first-letter:font-cute' : ''}`}
                      >
                        {para}
                      </p>
                    );
                  })}
                </section>
              ))}
            </div>

            <footer className="mt-12 pt-6 border-t-2 border-dashed border-rose-200 text-center">
              <p className="font-cute text-2xl text-rose-400 mb-4">end of summary ♡</p>
              <Link
                href={`/book/${book.id}`}
                className="kawaii-pill inline-flex items-center px-5 py-2 font-pixel text-[11px] text-rose-500 hover:bg-pink-50"
              >
                ♥ back to book
              </Link>
            </footer>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
