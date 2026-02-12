import { Calendar, ExternalLink } from "lucide-react";
import type { NewsCard as NewsCardType } from "@/types/farol";

interface NewsCardProps {
  card: NewsCardType;
  onClick: () => void;
}

// Maps known source names → domain for Google Favicon API
const SOURCE_DOMAINS: Record<string, string> = {
  "Notícias Agrícolas": "noticiasagricolas.com.br",
  "Noticias Agricolas": "noticiasagricolas.com.br",
  "Agrofy News": "news.agrofy.com.br",
  "The AgriBiz": "theagribiz.com",
  "Climatempo": "climatempo.com.br",
  "Canal Rural": "canalrural.com.br",
  "AgFeed": "agfeed.com.br",
  "Agrolink": "agrolink.com.br",
  "SuiSite": "suisite.com.br",
  "MDIC": "gov.br",
  "Scot Consultoria": "scotconsultoria.com.br",
  "Cepea": "cepea.esalq.usp.br",
  "Embrapa": "embrapa.br",
  "Conab": "conab.gov.br",
  "Epagri": "epagri.sc.gov.br",
};

// Deterministic color from string hash — each source gets a unique color
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

/** Clean source name: remove category suffix after " - " */
function cleanSourceName(name: string): string {
  if (!name) return "FarolRural";
  return name.replace(/\s*-\s*.+$/, "").trim();
}

/** Get favicon URL for a source name */
export function getSourceFavicon(sourceName: string): string | null {
  const clean = cleanSourceName(sourceName);
  const domain = SOURCE_DOMAINS[clean];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
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

  const cleanName = cleanSourceName(card.source);
  const faviconUrl = getSourceFavicon(card.source);

  return (
    <article
      onClick={onClick}
      className="farol-card p-5 cursor-pointer group hover:border-primary/30 transition-all duration-200 animate-slide-up"
    >
      {/* Source & Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt={cleanName}
              className="w-6 h-6 rounded-md object-contain bg-white border border-border/50 p-0.5"
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                el.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div className={`w-6 h-6 rounded-md ${getSourceColor(cleanName)} flex items-center justify-center text-[10px] font-bold text-white ${faviconUrl ? "hidden" : ""}`}>
            {cleanName.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{cleanName}</span>
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
