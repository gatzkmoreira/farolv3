import { useState } from "react";
import NewsCard from "./NewsCard";
import NewsDrawer from "./NewsDrawer";
import type { NewsCard as NewsCardType } from "@/types/farol";

interface NewsGridProps {
  cards: NewsCardType[];
  title?: string;
  chips?: string[];
  onChipClick?: (chip: string) => void;
}

const categories = [
  "Todos",
  "Pecuária",
  "Agricultura",
  "Tecnologia",
  "Energia",
  "Soja",
  "Milho",
  "Café",
  "Boi",
  "Clima",
];

const NewsGrid = ({ cards, title = "Notícias Relacionadas", chips, onChipClick }: NewsGridProps) => {
  const [selectedCard, setSelectedCard] = useState<NewsCardType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const handleCardClick = (card: NewsCardType) => {
    setSelectedCard(card);
    setIsDrawerOpen(true);
  };

  // Filter cards by category (UI only - no backend change)
  const safeCards = cards || [];
  const filteredCards = activeCategory === "Todos"
    ? safeCards
    : safeCards.filter(card =>
      card.category?.toLowerCase().includes(activeCategory.toLowerCase())
    );

  return (
    <section className="py-6">
      <div className="farol-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-foreground mb-4 md:mb-0">{title}</h2>

          {/* Chip filters from API response */}
          {chips && chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => onChipClick?.(chip)}
                  className="farol-chip text-xs hover:border-primary hover:text-primary"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile category selector */}
        <div className="lg:hidden mb-4">
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${activeCategory === category
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main content with sidebar */}
        <div className="flex gap-6">
          {/* Category Sidebar - desktop only */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Categorias
              </h3>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === category
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filteredCards.map((card, index) => (
                <div key={card.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <NewsCard card={card} onClick={() => handleCardClick(card)} />
                </div>
              ))}
            </div>
            {filteredCards.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma notícia encontrada nesta categoria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <NewsDrawer
        card={selectedCard}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </section>
  );
};

export default NewsGrid;
