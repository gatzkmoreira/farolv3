import { Flame, ArrowRight } from "lucide-react";
import type { NewsCard } from "@/types/farol";

interface HotNewsProps {
  onCardClick: (card: NewsCard) => void;
}

const mockHotNews: NewsCard[] = [
  {
    id: "1",
    title: "Exportações de carne bovina batem recorde em janeiro",
    description: "Brasil exportou 180 mil toneladas no primeiro mês do ano",
    source: "Agronews",
    date: "Há 2h",
    category: "Boi",
    url: "#"
  },
  {
    id: "2",
    title: "Soja: preços sobem com demanda chinesa aquecida",
    description: "Chicago fecha em alta pelo terceiro dia consecutivo",
    source: "SouAgro",
    date: "Há 3h",
    category: "Soja",
    url: "#"
  },
  {
    id: "3",
    title: "Safra de milho 2025 tem projeção revisada para cima",
    description: "Conab eleva estimativa para 120 milhões de toneladas",
    source: "Portal do Agro",
    date: "Há 5h",
    category: "Milho",
    url: "#"
  },
];

const HotNews = ({ onCardClick }: HotNewsProps) => {
  return (
    <div className="farol-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground">Notícias Quentes</h3>
        </div>
        <span className="text-xs text-muted-foreground">Ao vivo</span>
      </div>

      {/* News list */}
      <div className="space-y-4">
        {mockHotNews.map((news, index) => (
          <article 
            key={news.id}
            onClick={() => onCardClick(news)}
            className="group cursor-pointer"
          >
            <div className="flex gap-3">
              <span className="text-lg font-bold text-muted-foreground/50">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {news.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.date}</span>
                </div>
              </div>
            </div>
            {index < mockHotNews.length - 1 && (
              <div className="h-px bg-border/50 mt-4" />
            )}
          </article>
        ))}
      </div>

      {/* See more */}
      <button className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
        Ver mais notícias
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HotNews;
