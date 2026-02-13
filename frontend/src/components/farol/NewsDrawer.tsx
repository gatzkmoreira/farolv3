import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, Calendar, Share2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import { trackEvent } from "@/lib/api";

function formatDate(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
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

interface ShareMenuProps {
  card: NewsCard;
}

const ShareMenu = ({ card }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const shareText = `${card.title} — via Farol Rural`;
  const shareUrl = card.url;

  const handleShare = (platform: string) => {
    trackEvent("share", { platform, title: card.title, url: card.url });

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(`${card.title}\n${shareUrl}`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
    if (platform !== "copy") setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 className="w-5 h-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[180px] z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => handleShare("whatsapp")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
          <button
            onClick={() => handleShare("x")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </button>
          <div className="h-px bg-border mx-3 my-1" />
          <button
            onClick={() => handleShare("copy")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-green-600">Link copiado!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copiar link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

interface NewsDrawerProps {
  card: NewsCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsDrawer = ({ card, isOpen, onClose }: NewsDrawerProps) => {
  if (!isOpen || !card) return null;

  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    html = '<p>' + html + '</p>';
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

    return html;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-farol-xl flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-card border-b border-border px-8 py-5 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-white">
                {card.source.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{card.source}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(card.date)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Category badge */}
            <span className="inline-block mb-5 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 select-none">
              {formatCategory(card.category)}
            </span>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-snug">
              {card.title}
            </h2>

            {/* Image */}
            {card.image && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-52 object-cover"
                />
              </div>
            )}

            {/* Summary */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Resumo
              </h3>
              {card.summary_markdown ? (
                <div
                  className="farol-summary prose-reading"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(card.summary_markdown) }}
                />
              ) : (
                <p className="text-foreground/85 leading-relaxed text-base">
                  {card.description}
                </p>
              )}
            </div>

            {/* Subtle call to action */}
            <div className="pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                Quer se aprofundar?
              </p>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium text-sm transition-colors"
                onClick={() => trackEvent("external_link", { url: card.url, title: card.title })}
              >
                Veja a matéria completa
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-muted/30 border-t border-border px-8 py-4 flex items-center justify-between rounded-b-2xl">
            <ShareMenu card={card} />
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="farol-btn-primary flex items-center gap-2"
              onClick={() => trackEvent("external_link", { url: card.url, title: card.title })}
            >
              Ler matéria completa
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDrawer;
