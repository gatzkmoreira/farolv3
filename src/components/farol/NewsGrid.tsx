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

const NewsGrid = ({ cards, title = "Notícias Relacionadas", chips, onChipClick }: NewsGridProps) => {
  const [selectedCard, setSelectedCard] = useState<NewsCardType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCardClick = (card: NewsCardType) => {
    setSelectedCard(card);
    setIsDrawerOpen(true);
  };

  return (
    <section className="py-8">
      <div className="farol-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {cards.map((card, index) => (
            <div key={card.id} style={{ animationDelay: `${index * 50}ms` }}>
              <NewsCard card={card} onClick={() => handleCardClick(card)} />
            </div>
          ))}
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
