import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import NewsDrawer from "./NewsDrawer";

const mockCarouselNews: NewsCard[] = [
  {
    id: "c1",
    title: "Canetas emagrecedoras podem alterar demanda por alimentos no agro",
    description: "Uso de medicamentos para emagrecimento reduz apetite e muda hábitos alimentares, com impacto no consumo de proteínas.",
    source: "Agro Estadão",
    date: "19 de jan.",
    category: "Política & Mercado",
    url: "#"
  },
  {
    id: "c2",
    title: "Oferta recorde pressiona preços e aumenta liquidez do mercado da soja",
    description: "Abundância de oferta de soja no Brasil intensifica pressão nos preços, mas amplia liquidez nas negociações.",
    source: "Agrofy",
    date: "19 de jan.",
    category: "Soja",
    url: "#"
  },
  {
    id: "c3",
    title: "Exportações de milho de MT em 2025 têm queda love, com Egito, Irã e Vietnã...",
    description: "Mato Grosso embarcou 1,66 milhões de toneladas de milho em dezembro, aumento significativo.",
    source: "Portal do Agronegócio",
    date: "19 de jan.",
    category: "Milho",
    url: "#"
  },
  {
    id: "c4",
    title: "Crimes no campo caíram após três anos da Polícia Rodoviária",
    description: "Estatística mostra redução nos crimes rurais após três anos de operação policial intensificada.",
    source: "SouAgro",
    date: "19 de jan.",
    category: "Política & Mercado",
    url: "#"
  },
  {
    id: "c5",
    title: "Produtores têm até janeiro para definir forma de recolhimento do Funrural",
    description: "Governo define prazo final para produtores rurais escolherem regime de recolhimento do Funrural.",
    source: "Portal do Agronegócio",
    date: "19 de jan.",
    category: "Política & Mercado",
    url: "#"
  },
  {
    id: "c6",
    title: "Frente fria traz grande mudança do tempo em vários estados",
    description: "Sistema de frente fria deve provocar queda de temperatura e instabilidade no Sul, Sudeste e Centro-Oeste.",
    source: "SouAgro",
    date: "19 de jan.",
    category: "Clima",
    url: "#"
  },
  {
    id: "c7",
    title: "Cotações do café arábica recuam e robusta sobe",
    description: "Preço do arábica caiu na bolsa de Nova York, enquanto o robusta valorizou em Londres.",
    source: "Safras & Mercado",
    date: "19 de jan.",
    category: "Café",
    url: "#"
  },
  {
    id: "c8",
    title: "Plataforma de intel AI4Sea expande atuação",
    description: "Solução de inteligência artificial de Santos e Vale, e agro ganha novos recursos.",
    source: "AGFeed",
    date: "19 de jan.",
    category: "Máquinas & Tecnologia",
    url: "#"
  },
];

const NewsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<NewsCard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCardClick = (card: NewsCard) => {
    setSelectedCard(card);
    setIsDrawerOpen(true);
  };

  // Split into two rows for the carousel effect
  const topRow = mockCarouselNews.filter((_, i) => i % 2 === 0);
  const bottomRow = mockCarouselNews.filter((_, i) => i % 2 === 1);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Soja': 'bg-amber-100 text-amber-700',
      'Milho': 'bg-yellow-100 text-yellow-700',
      'Café': 'bg-orange-100 text-orange-700',
      'Clima': 'bg-blue-100 text-blue-700',
      'Política & Mercado': 'bg-purple-100 text-purple-700',
      'Máquinas & Tecnologia': 'bg-slate-100 text-slate-700',
    };
    return colors[category] || 'bg-green-light text-primary';
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
            {card.source.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{card.source}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{card.date}</span>
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
        <span className={`farol-badge text-[10px] ${getCategoryColor(card.category)}`}>
          {card.category}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Cards de Notícias</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="space-y-4 min-w-max">
            {/* Top row */}
            <div className="flex gap-4">
              {topRow.map((card) => (
                <CarouselCard key={card.id} card={card} />
              ))}
            </div>
            {/* Bottom row */}
            <div className="flex gap-4">
              {bottomRow.map((card) => (
                <CarouselCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>
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
