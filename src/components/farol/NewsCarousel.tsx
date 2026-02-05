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
    category: "Pecuária",
    url: "#"
  },
  {
    id: "c2",
    title: "Oferta recorde pressiona preços e aumenta liquidez do mercado da soja",
    description: "Abundância de oferta de soja no Brasil intensifica pressão nos preços, mas amplia liquidez nas negociações.",
    source: "Agrofy",
    date: "19 de jan.",
    category: "Agricultura",
    url: "#"
  },
  {
    id: "c3",
    title: "Exportações de milho de MT em 2025 têm queda leve, com Egito, Irã e Vietnã...",
    description: "Mato Grosso embarcou 1,66 milhões de toneladas de milho em dezembro, aumento significativo.",
    source: "Portal do Agronegócio",
    date: "19 de jan.",
    category: "Agricultura",
    url: "#"
  },
  {
    id: "c4",
    title: "Crimes no campo caíram após três anos da Polícia Rodoviária",
    description: "Estatística mostra redução nos crimes rurais após três anos de operação policial intensificada.",
    source: "SouAgro",
    date: "19 de jan.",
    category: "Pecuária",
    url: "#"
  },
  {
    id: "c5",
    title: "Produtores têm até janeiro para definir forma de recolhimento do Funrural",
    description: "Governo define prazo final para produtores rurais escolherem regime de recolhimento do Funrural.",
    source: "Portal do Agronegócio",
    date: "19 de jan.",
    category: "Agricultura",
    url: "#"
  },
  {
    id: "c6",
    title: "Frente fria traz grande mudança do tempo em vários estados",
    description: "Sistema de frente fria deve provocar queda de temperatura e instabilidade no Sul, Sudeste e Centro-Oeste.",
    source: "SouAgro",
    date: "19 de jan.",
    category: "Agricultura",
    url: "#"
  },
  {
    id: "c7",
    title: "Novas tecnologias de irrigação reduzem consumo de água em 40%",
    description: "Sistemas inteligentes de irrigação prometem revolucionar o uso de recursos hídricos no campo.",
    source: "Safras & Mercado",
    date: "19 de jan.",
    category: "Tecnologia",
    url: "#"
  },
  {
    id: "c8",
    title: "Energia solar cresce 30% nas propriedades rurais brasileiras",
    description: "Produtores investem em energia limpa para reduzir custos operacionais e aumentar sustentabilidade.",
    source: "AGFeed",
    date: "19 de jan.",
    category: "Energia",
    url: "#"
  },
];

const categories = ["Todas", "Pecuária", "Agricultura", "Tecnologia", "Energia"];

const NewsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<NewsCard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filteredNews = activeCategory === "Todas" 
    ? mockCarouselNews 
    : mockCarouselNews.filter(card => card.category === activeCategory);

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

  // Split filtered news into two rows for the carousel effect
  const topRow = filteredNews.filter((_, i) => i % 2 === 0);
  const bottomRow = filteredNews.filter((_, i) => i % 2 === 1);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Pecuária': 'bg-red-100 text-red-700',
      'Agricultura': 'bg-green-100 text-green-700',
      'Tecnologia': 'bg-slate-100 text-slate-700',
      'Energia': 'bg-amber-100 text-amber-700',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
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
        {/* Header with Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Cards de Notícias</h2>
          
          {/* Category Menu - Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
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
