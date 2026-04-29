import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { books } from "@/data/books";
import { ArrowLeft, BookOpen, Headphones, Heart } from "lucide-react";
import KawaiiMascot from "@/components/KawaiiMascot";

const CATEGORY_PASTEL: Record<string, string> = {
  Philosophy: "bg-purple-100 text-purple-700 border-purple-300",
  "Self-Help": "bg-pink-100 text-rose-700 border-rose-300",
  Psychology: "bg-blue-100 text-blue-700 border-blue-300",
  Business: "bg-amber-100 text-amber-700 border-amber-300",
  Science: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Spirituality: "bg-indigo-100 text-indigo-700 border-indigo-300",
};

export default function BookDetailPage() {
  const params = useParams();
  const book = books.find(b => b.id === params.id);

  useEffect(() => {
    if (book) {
      document.title = `${book.title} ♡ Lumen`;
    }
  }, [book]);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="kawaii-frame px-8 py-10 text-center">
          <p className="font-cute text-3xl text-rose-400 mb-2">oh no, can't find that one (｡•́︿•̀｡)</p>
          <Link href="/" className="kawaii-pill inline-block px-5 py-2 text-sm text-rose-500 mt-3">
            ♡ back to library
          </Link>
        </div>
      </div>
    );
  }

  const palette = CATEGORY_PASTEL[book.category] || CATEGORY_PASTEL.Philosophy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen text-foreground pb-24"
    >
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <Link
          href="/"
          className="kawaii-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-pixel text-rose-500 hover:bg-pink-50 mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          back to library
        </Link>

        <div className="grid md:grid-cols-[280px,1fr] gap-6 md:gap-10">
          {/* Cover Column */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="kawaii-frame-solid p-3 relative"
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-yellow-200/70 rounded-sm shadow-sm rotate-[-2deg] z-10" />
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <Link href={`/book/${book.id}/read`} className="block">
              <button className="w-full kawaii-frame-solid bg-pink-50 hover:bg-pink-100 transition-colors px-4 py-3.5 flex items-center justify-center gap-2 group">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span className="font-cute text-xl text-rose-500">read it ♡</span>
              </button>
            </Link>
            <Link href={`/book/${book.id}/listen`} className="block">
              <button className="w-full kawaii-frame-solid bg-rose-400 hover:bg-rose-500 transition-colors px-4 py-3.5 flex items-center justify-center gap-2 text-white border-rose-500/50">
                <Headphones className="w-4 h-4" />
                <span className="font-cute text-xl">listen with lumi ♥</span>
              </button>
            </Link>

            {/* Narrator card */}
            <div className="kawaii-frame-solid p-4 flex items-center gap-3">
              <KawaiiMascot size={56} className="shrink-0" />
              <div className="min-w-0">
                <p className="font-cute text-lg text-rose-500 leading-tight">narrated by lumi</p>
                <p className="text-xs text-foreground/60 leading-snug">soft voice, lots of feelings (◕‿◕)</p>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="kawaii-frame px-6 md:px-8 py-6 md:py-8"
          >
            <span className={`inline-block px-3 py-1 rounded-full font-pixel text-[10px] border ${palette} mb-5`}>
              ♥ {book.category}
            </span>

            <h1 className="text-3xl md:text-5xl font-serif font-medium leading-tight text-foreground mb-3">
              {book.title}
            </h1>
            <p className="text-lg text-foreground/65 font-cute mb-6">
              by {book.author}
            </p>

            <div className="font-sans text-foreground/80 leading-relaxed space-y-4 mb-8">
              {book.shortDescription.split("\n\n").map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-rose-200 pt-6">
              <h3 className="font-cute text-2xl text-rose-500 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                key takeaways
              </h3>
              <ul className="space-y-3">
                {book.keyTakeaways.map((takeaway: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.08) }}
                    className="flex items-start gap-3"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-pink-100 text-rose-500 border border-rose-200 flex items-center justify-center font-pixel text-[10px] mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-sans text-foreground/85">{takeaway}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
