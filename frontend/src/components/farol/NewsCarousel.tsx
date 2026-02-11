import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, Loader2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import { transformCards } from "@/types/farol";
import { apiFetch } from "@/lib/api";
import NewsDrawer from "./NewsDrawer";

const CATEGORY_LABELS: Record<string, string> = {
  pecuaria_corte: "Pecuária",
  graos: "Grãos",
  clima: "Clima",
  mercado: "Mercado",
  tecnologia: "Tecnologia",
  politica_rural: "Política Rural",
};

function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || slug;
}

function formatShortDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return isoDate;
  }
}

const NewsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<NewsCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<NewsCard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");

  useEffect(() => {
    let cancelled = false;
    apiFetch<unknown>("/api/cards?limit=20")
      .then((data) => {
        if (!cancelled) setCards(transformCards(data));
      })
      .catch((err) => {
        console.warn("[NewsCarousel] fetch failed:", err);
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Build dynamic categories from fetched data
  const uniqueCategories = Array.from(new Set(cards.map((c) => c.category)));
  const categories = ["Todas", ...uniqueCategories.map(categoryLabel)];

  const filteredNews =
    activeCategory === "Todas"
      ? cards
      : cards.filter((card) => categoryLabel(card.category) === activeCategory);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (card: NewsCard) => {
    setSelectedCard(card);
    setIsDrawerOpen(true);
  };

  const topRow = filteredNews.filter((_, i) => i % 2 === 0);
  const bottomRow = filteredNews.filter((_, i) => i % 2 === 1);

  const getCategoryColor = (slug: string) => {
    const colors: Record<string, string> = {
      pecuaria_corte: "bg-red-100 text-red-700",
      graos: "bg-green-100 text-green-700",
      clima: "bg-sky-100 text-sky-700",
      mercado: "bg-amber-100 text-amber-700",
      tecnologia: "bg-slate-100 text-slate-700",
      politica_rural: "bg-indigo-100 text-indigo-700",
    };
    return colors[slug] || "bg-muted text-muted-foreground";
  };

  const CarouselCard = ({ card }: { card: NewsCard }) => (
    <article
      onClick={() => handleCardClick(card)}
      className="min-w-[300px] max-w-[300px] farol-card p-4 cursor-pointer group hover:border-primary/30 transition-all flex-shrink-0"
    >
      {/* Source & Date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-white">
            {card.source?.charAt(0) || "?"}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {card.source}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatShortDate(card.date)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors h-10">
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 h-8">
        {card.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span
          className={`farol-badge text-[10px] ${getCategoryColor(card.category)}`}
        >
          {categoryLabel(card.category)}
        </span>
        <span className="flex items-center gap-1 text-xs text-primary font-medium">
          Ler mais
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </article>
  );

  return (
    <section className="py-8">
      <div className="farol-container">
        {/* Header with Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Cards de Notícias
          </h2>

          {/* Category Menu */}
          {!loading && cards.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notícia disponível.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="space-y-4 min-w-max">
              {/* Top row */}
              <div className="flex gap-4">
                {topRow.map((card) => (
                  <CarouselCard key={card.id} card={card} />
                ))}
              </div>
              {/* Bottom row */}
              {bottomRow.length > 0 && (
                <div className="flex gap-4">
                  {bottomRow.map((card) => (
                    <CarouselCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NewsDrawer
        card={selectedCard}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </section>
  );
};

export default NewsCarousel;
