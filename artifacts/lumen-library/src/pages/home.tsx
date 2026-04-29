import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Book, books, BookCategory } from "@/data/books";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Heart } from "lucide-react";
import KawaiiMascot from "@/components/KawaiiMascot";

const CATEGORY_PASTEL: Record<string, string> = {
  All: "bg-pink-100 text-rose-700 border-rose-300",
  Philosophy: "bg-purple-100 text-purple-700 border-purple-300",
  "Self-Help": "bg-pink-100 text-rose-700 border-rose-300",
  Psychology: "bg-blue-100 text-blue-700 border-blue-300",
  Business: "bg-amber-100 text-amber-700 border-amber-300",
  Science: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Spirituality: "bg-indigo-100 text-indigo-700 border-indigo-300",
};

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: (BookCategory | "All")[] = ["All", "Philosophy", "Self-Help", "Psychology", "Business", "Science", "Spirituality"];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-foreground pb-24"
    >
      {/* Decorative banner */}
      <header className="pt-8 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="kawaii-frame-solid overflow-hidden relative">
          {/* Striped banner top */}
          <div className="kawaii-stripe-bg h-24 md:h-32 relative scalloped-bottom">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="kawaii-dot-bg px-6 md:px-12 py-2 md:py-4 rounded-2xl border-2 border-white/80 shadow-sm">
                <h1 className="font-cute text-4xl md:text-6xl text-rose-500 tracking-tight leading-none">
                  Lumen
                </h1>
                <p className="font-pixel text-[10px] md:text-xs text-rose-400 text-center -mt-1">
                  ♡ a cozy library of big ideas ♡
                </p>
              </div>
            </div>
          </div>

          {/* Mascot + welcome strip */}
          <div className="px-5 md:px-8 py-5 flex items-center gap-4 md:gap-6">
            <KawaiiMascot size={96} className="shrink-0 -mt-12 md:-mt-16 drop-shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="font-cute text-2xl md:text-3xl text-rose-500 leading-tight">
                hii, welcome back ! <span className="font-sans text-base">(◕ᴗ◕✿)</span>
              </p>
              <p className="font-sans text-sm text-foreground/70 mt-1 leading-relaxed">
                pick a little book — i'll read it to you in a soft voice, or you can curl up and read it yourself <span className="text-rose-400">♡</span>
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
              <span className="font-pixel text-[10px] text-rose-400 bg-pink-50 border border-rose-200 px-2 py-0.5 rounded-full">
                ♥ {books.length} books
              </span>
              <span className="font-pixel text-[10px] text-purple-500 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                ✿ updated 2-3-2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search + filter row */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto mt-6">
        <div className="kawaii-frame-solid p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
              <Input
                type="search"
                placeholder="search a title or author..."
                className="pl-9 bg-pink-50/60 border-rose-200 rounded-full focus-visible:ring-rose-300 placeholder:text-rose-300/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 flex-1">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const palette = CATEGORY_PASTEL[cat] || CATEGORY_PASTEL.All;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-pixel border transition-all duration-200 ${
                      active
                        ? "bg-rose-400 text-white border-rose-500 shadow-sm scale-105"
                        : `${palette} hover:scale-105 hover:shadow-sm`
                    }`}
                  >
                    {active && "♥ "}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Library grid */}
      <main className="px-4 md:px-8 max-w-6xl mx-auto mt-8">
        {filteredBooks.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-5 px-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="font-cute text-2xl text-rose-500">
                {selectedCategory === "All" ? "everything on the shelf" : `${selectedCategory} corner`}
              </h2>
              <span className="font-pixel text-[10px] text-foreground/50 mt-1">
                ({filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"})
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="kawaii-frame py-16 text-center mt-4">
            <p className="font-cute text-3xl text-rose-400 mb-1">no books here yet (｡•́︿•̀｡)</p>
            <p className="text-sm text-foreground/60 mb-4">try a different shelf?</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="kawaii-pill px-5 py-2 text-sm text-rose-500 hover:bg-pink-50"
            >
              ♥ show me everything
            </button>
          </div>
        )}
      </main>

      {/* Footer note */}
      <div className="max-w-6xl mx-auto mt-16 px-4 md:px-8">
        <div className="kawaii-frame px-6 py-5 text-center">
          <p className="font-cute text-xl text-rose-400">
            stay as long as you'd like ♡
          </p>
          <p className="font-pixel text-[10px] text-foreground/50 mt-1">
            made with <Heart className="inline w-3 h-3 text-rose-400 -mt-0.5" /> + tea
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BookCard({ book, index }: { book: Book, index: number }) {
  const palette = CATEGORY_PASTEL[book.category] || CATEGORY_PASTEL.All;
  const tilt = index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`group relative flex flex-col ${tilt} hover:rotate-0 transition-transform duration-300`}
    >
      <Link href={`/book/${book.id}`} className="block relative">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden kawaii-frame-solid p-2">
          {/* washi tape */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-yellow-200/70 rounded-sm shadow-sm rotate-[-3deg] z-10" />
          <img
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* Category Badge Reveal */}
          <div className="absolute inset-2 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className={`mb-3 px-3 py-1 rounded-full font-pixel text-[10px] border ${palette} shadow-sm`}>
              ♥ {book.category}
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3 px-1">
        <h3 className="font-serif font-medium text-base leading-tight text-foreground group-hover:text-rose-500 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-foreground/60 mt-0.5 font-sans">{book.author}</p>
      </div>
    </motion.div>
  );
}
