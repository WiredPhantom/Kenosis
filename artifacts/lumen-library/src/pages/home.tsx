import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Book, books, BookCategory } from "@/data/books";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
      className="min-h-screen bg-background text-foreground pb-24"
    >
      <header className="pt-16 pb-12 px-6 md:px-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight mb-3">Lumen</h1>
        <p className="text-lg text-muted-foreground font-sans">A quiet sanctuary for big ideas.</p>
        
        <div className="mt-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search titles or authors..." 
              className="pl-9 bg-card border-border/50 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="px-6 md:px-12 max-w-6xl mx-auto">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {filteredBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-muted-foreground font-serif text-xl">No books found in this section.</p>
            <button 
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="mt-4 text-primary hover:underline underline-offset-4"
            >
              Return to all books
            </button>
          </div>
        )}
      </main>
    </motion.div>
  );
}

function BookCard({ book, index }: { book: Book, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col"
    >
      <Link href={`/book/${book.id}`} className="block relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 bg-card">
        <img 
          src={book.coverImageUrl} 
          alt={`Cover of ${book.title}`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        
        {/* Category Badge Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none">
          <div className="bg-background/95 backdrop-blur-sm text-foreground px-4 py-2 rounded-full font-sans text-xs tracking-wider shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {book.category}
          </div>
        </div>
      </Link>
      
      <div className="mt-4">
        <h3 className="font-serif font-medium text-lg leading-tight group-hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
      </div>
    </motion.div>
  );
}
