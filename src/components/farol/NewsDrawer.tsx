import { X, ExternalLink, Calendar, Share2 } from "lucide-react";
import type { NewsCard } from "@/types/farol";

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
        className={`fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-card shadow-farol-xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">
              {card.source.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{card.source}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{card.date}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Category badge */}
          <span className="farol-badge bg-green-light text-primary mb-4 inline-block">
            {card.category}
          </span>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">
            {card.title}
          </h2>

          {/* Image */}
          {card.image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={card.image} 
                alt={card.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Resumo
            </h3>
            {card.summary_markdown ? (
              <div 
                className="farol-summary"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(card.summary_markdown) }}
              />
            ) : (
              <p className="text-foreground/80 leading-relaxed">
                {card.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
          <a 
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="farol-btn-primary flex items-center gap-2"
          >
            Ler matéria completa
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
};

export default NewsDrawer;
