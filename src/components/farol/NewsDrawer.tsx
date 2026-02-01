import { X, ExternalLink, Calendar, Share2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";
import { trackEvent } from "@/lib/api";

interface NewsDrawerProps {
  card: NewsCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsDrawer = ({ card, isOpen, onClose }: NewsDrawerProps) => {
  if (!card) return null;

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
        className={`fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-farol-xl pointer-events-auto transition-all duration-300 ease-out flex flex-col ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
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
                  <span>{card.date}</span>
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
            <span className="farol-badge bg-green-light text-primary mb-5 inline-block">
              {card.category}
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

            {/* Summary - Comfortable reading layout */}
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
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
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
