import { useState } from "react";
import { FileText, Clock, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { trackEvent } from "@/lib/api";

interface SummaryBlockProps {
  markdown: string;
  timingMs?: number;
  sources?: string[];
}

const SummaryBlock = ({ markdown, timingMs, sources }: SummaryBlockProps) => {
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);

  const handleFeedback = (rating: "positive" | "negative") => {
    if (feedbackGiven) return;
    setFeedbackGiven(rating);

    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        session_id: `web-${Date.now()}`,
        comment: "",
      }),
    }).catch((err) => console.warn("[Farol] Feedback send failed:", err));

    trackEvent("feedback_given", { rating });
  };

  const renderMarkdown = (md: string) => {
    if (!md) return "";

    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    html = '<p>' + html + '</p>';
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

          {/* Feedback */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {feedbackGiven
                ? "Obrigado pelo feedback! 🙏"
                : "Essa resposta foi útil?"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback("positive")}
                disabled={feedbackGiven !== null}
                className={`p-2 rounded-lg transition-colors ${feedbackGiven === "positive"
                    ? "bg-green-100 text-green-600"
                    : feedbackGiven
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-green-50 text-muted-foreground hover:text-green-600"
                  }`}
                title="Útil"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleFeedback("negative")}
                disabled={feedbackGiven !== null}
                className={`p-2 rounded-lg transition-colors ${feedbackGiven === "negative"
                    ? "bg-red-100 text-red-600"
                    : feedbackGiven
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  }`}
                title="Não útil"
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummaryBlock;
