import { FileText, Clock, CheckCircle2 } from "lucide-react";

interface SummaryBlockProps {
  markdown: string;
  timingMs?: number;
  sources?: string[];
}

const SummaryBlock = ({ markdown, timingMs, sources }: SummaryBlockProps) => {
  // Simple markdown to HTML converter
  const renderMarkdown = (md: string) => {
    let html = md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    
    // Wrap in paragraph
    html = '<p>' + html + '</p>';
    
    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    
    return html;
  };

  return (
    <section className="py-8 animate-fade-in">
      <div className="farol-container">
        <div className="farol-card p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-light flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Resumo</h2>
                <p className="text-sm text-muted-foreground">Síntese inteligente</p>
              </div>
            </div>
            {timingMs && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{(timingMs / 1000).toFixed(2)}s</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div 
            className="farol-summary"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
          />

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Fontes utilizadas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SummaryBlock;
