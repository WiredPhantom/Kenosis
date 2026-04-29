import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { motion, useScroll, useSpring } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, Moon, Sun, Type, Minus, Plus } from "lucide-react";

type Theme = "light" | "sepia" | "dark";

export default function ReadModePage() {
  const params = useParams();
  const book = books.find(b => b.id === params.id);
  
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState(18); // Base font size in px
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (book) {
      document.title = `Reading: ${book.title} - Lumen`;
    }
  }, [book]);

  // Apply theme class to document body for global transitions
  useEffect(() => {
    document.documentElement.classList.remove("dark", "theme-sepia");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "sepia") {
      document.documentElement.classList.add("theme-sepia");
    }
  }, [theme]);

  if (!book) return null;

  const wordCount = book.summarySections.reduce((acc, sec) => 
    acc + sec.paragraphs.reduce((pAcc, p) => pAcc + p.split(' ').length, 0)
  , 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* Top Bar Chrome */}
      <header className="h-16 shrink-0 border-b border-border/30 px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm z-40 transition-colors duration-500">
        <Link href={`/book/${book.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        
        <div className="text-center hidden md:block">
          <span className="text-xs font-sans text-muted-foreground uppercase tracking-widest">{book.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card rounded-full p-1 border border-border">
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors" title="Decrease font size">
              <Minus className="w-4 h-4" />
            </button>
            <Type className="w-4 h-4 mx-1 text-muted-foreground" />
            <button onClick={() => setFontSize(s => Math.min(26, s + 2))} className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors" title="Increase font size">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center bg-card rounded-full p-1 border border-border">
            <button onClick={() => setTheme("light")} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Light mode">
              <Sun className="w-4 h-4" />
            </button>
            <button onClick={() => setTheme("sepia")} className={`p-1.5 rounded-full transition-colors ${theme === 'sepia' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100' : 'text-muted-foreground hover:text-foreground'}`} title="Sepia mode">
              <div className="w-4 h-4 rounded-full bg-amber-200 border border-amber-300 dark:border-amber-700" />
            </button>
            <button onClick={() => setTheme("dark")} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Dark mode">
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Reading Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-[65ch] mx-auto px-6 py-20 pb-40"
          style={{ fontSize: `${fontSize}px` }}
        >
          <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight mb-6 text-foreground">{book.title}</h1>
            <p className="text-xl text-muted-foreground font-serif italic mb-8">by {book.author}</p>
            <div className="flex items-center justify-center gap-4 text-sm font-sans text-muted-foreground">
              <span>~{readingTime} min read</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
          </header>

          <div className="font-serif leading-[1.8] text-foreground space-y-8">
            {book.summarySections.map((section, secIdx) => (
              <section key={secIdx} className="mb-12">
                <h2 className="text-2xl font-serif font-medium mt-12 mb-6 text-foreground border-b border-border/50 pb-2">{section.heading}</h2>
                {section.paragraphs.map((para, pIdx) => {
                  // Drop cap on first paragraph of first section
                  const isFirstPara = secIdx === 0 && pIdx === 0;
                  return (
                    <p key={pIdx} className={`mb-6 text-foreground/90 ${isFirstPara ? 'first-letter:text-6xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:-mt-2 first-letter:leading-[0.8]' : ''}`}>
                      {para}
                    </p>
                  );
                })}
              </section>
            ))}
          </div>

          <footer className="mt-24 pt-8 border-t border-border/50 text-center">
            <p className="font-serif text-xl italic text-muted-foreground mb-8">End of summary.</p>
            <Link href={`/book/${book.id}`} className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-sans text-sm">
              Return to Book Details
            </Link>
          </footer>
        </motion.article>
      </div>
    </div>
  );
}
