import { Calendar, ExternalLink } from "lucide-react";
import type { NewsCard as NewsCardType } from "@/types/farol";

interface NewsCardProps {
  card: NewsCardType;
  onClick: () => void;
}

function formatCardDate(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return raw;
  }
}

function formatCategory(cat: string): string {
  if (!cat) return "Geral";
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

const NewsCard = ({ card, onClick }: NewsCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Soja': 'bg-amber-100 text-amber-700',
      'Milho': 'bg-yellow-100 text-yellow-700',
      'Café': 'bg-orange-100 text-orange-700',
      'Boi': 'bg-red-100 text-red-700',
      'Clima': 'bg-blue-100 text-blue-700',
      'Política & Mercado': 'bg-purple-100 text-purple-700',
      'Máquinas & Tecnologia': 'bg-slate-100 text-slate-700',
    };
    return colors[category] || 'bg-green-light text-primary';
  };

  return (
    <article
      onClick={onClick}
      className="farol-card p-5 cursor-pointer group hover:border-primary/30 transition-all duration-200 animate-slide-up"
    >
      {/* Source & Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {card.source_logo ? (
            <img
              src={card.source_logo}
              alt={card.source}
              className="w-5 h-5 rounded object-contain"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-white">
              {card.source.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-muted-foreground">{card.source}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatCardDate(card.date)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {card.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className={`farol-badge ${getCategoryColor(card.category)}`}>
          {formatCategory(card.category)}
        </span>
        <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
          Ler mais
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </article>
  );
};

export default NewsCard;
