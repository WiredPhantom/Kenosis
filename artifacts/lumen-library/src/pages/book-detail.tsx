import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, BookOpen, Headphones, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BookDetailPage() {
  const params = useParams();
  const book = books.find(b => b.id === params.id);

  useEffect(() => {
    if (book) {
      document.title = `${book.title} - Lumen`;
    }
  }, [book]);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Book not found</h2>
          <Link href="/" className="text-primary hover:underline">Return to Library</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground pb-24"
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          {/* Cover Column */}
          <div className="w-full md:w-1/3 shrink-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl"
            >
              <img 
                src={book.coverImageUrl} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="mt-8 space-y-4">
              <Link href={`/book/${book.id}/read`} className="block">
                <Button className="w-full h-14 text-base font-serif bg-card text-card-foreground border border-border hover:bg-secondary transition-all" variant="outline">
                  <BookOpen className="w-5 h-5 mr-3 text-primary" />
                  Read Summary
                </Button>
              </Link>
              <Link href={`/book/${book.id}/listen`} className="block">
                <Button className="w-full h-14 text-base font-serif bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md">
                  <Headphones className="w-5 h-5 mr-3" />
                  Listen to Summary
                </Button>
              </Link>
            </div>

            {/* Narrator Persona Teaser */}
            <div className="mt-8 p-4 bg-secondary/50 rounded-lg border border-border/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-primary">
                  {/* Simplistic Aria avatar teaser */}
                  <circle cx="50" cy="40" r="20" fill="currentColor" opacity="0.8" />
                  <path d="M20 100 Q 50 60 80 100" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Narrated by Aria</p>
                <p className="text-xs text-muted-foreground">Gentle, thoughtful voice</p>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="w-full md:w-2/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 font-normal">
                {book.category}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight text-foreground mb-4">
                {book.title}
              </h1>
              
              <p className="text-xl text-muted-foreground font-serif italic mb-8">
                by {book.author}
              </p>

              <div className="prose prose-lg dark:prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed font-sans mb-12">
                {book.shortDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-serif mb-6 text-foreground">Key Takeaways</h3>
                <ul className="space-y-4">
                  {book.keyTakeaways.map((takeaway, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-start gap-4 text-muted-foreground"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-serif mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed font-sans">{takeaway}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
