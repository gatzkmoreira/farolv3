import { useState, useEffect } from "react";
import { Flame, ArrowRight, Loader2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import { transformCards } from "@/types/farol";
import { apiFetch } from "@/lib/api";

interface HotNewsProps {
  onCardClick: (card: NewsCard) => void;
}

function formatRelativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "Agora";
  if (diffH < 24) return `Há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Ontem";
  if (diffD < 7) return `Há ${diffD}d`;
  return new Date(isoDate).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

const HotNews = ({ onCardClick }: HotNewsProps) => {
  const [cards, setCards] = useState<NewsCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<unknown>("/api/cards?limit=3")
      .then((data) => {
        if (!cancelled) setCards(transformCards(data));
      })
      .catch((err) => {
        console.warn("[HotNews] fetch failed:", err);
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma notícia disponível.
        </p>
      ) : (
        <div className="space-y-4">
          {cards.map((news, index) => (
            <article
              key={news.id}
              onClick={() => onCardClick(news)}
              className="group cursor-pointer"
            >
              <div className="flex gap-3">
                <span className="text-lg font-bold text-muted-foreground/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{formatRelativeDate(news.date)}</span>
                  </div>
                </div>
              </div>
              {index < cards.length - 1 && (
                <div className="h-px bg-border/50 mt-4" />
              )}
            </article>
          ))}
        </div>
      )}

      {/* See more */}
      <button className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
        Ver mais notícias
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HotNews;
