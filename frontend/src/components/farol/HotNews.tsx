import { useState } from "react";
import { Flame, Loader2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import { getSourceFavicon } from "./NewsCard";

interface HotNewsProps {
  cards: NewsCard[];
  loading: boolean;
  onCardClick: (card: NewsCard) => void;
}

function cleanSourceName(name: string): string {
  if (!name) return "FarolRural";
  return name.replace(/\s*-\s*.+$/, "").trim();
}

// Deterministic color from string hash
const SOURCE_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-cyan-500", "bg-orange-500", "bg-teal-500",
  "bg-pink-500", "bg-indigo-500", "bg-lime-600", "bg-red-500",
];

function getSourceColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return SOURCE_COLORS[Math.abs(hash) % SOURCE_COLORS.length];
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

const SourceIcon = ({ source }: { source: string }) => {
  const clean = cleanSourceName(source);
  const faviconUrl = getSourceFavicon(source);
  const [showFallback, setShowFallback] = useState(!faviconUrl);

  if (!showFallback && faviconUrl) {
    return (
      <img
        src={faviconUrl}
        alt={clean}
        className="w-5 h-5 rounded-md object-contain bg-white border border-border/50 p-0.5 flex-shrink-0"
        loading="lazy"
        onError={() => setShowFallback(true)}
      />
    );
  }

  return (
    <div className={`w-5 h-5 rounded-md ${getSourceColor(clean)} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
      {clean.charAt(0)}
    </div>
  );
};

const HotNews = ({ cards, loading, onCardClick }: HotNewsProps) => {

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
                    <SourceIcon source={news.source} />
                    <span>{cleanSourceName(news.source)}</span>
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

    </div>
  );
};

export default HotNews;
