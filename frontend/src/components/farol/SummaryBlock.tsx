import { useState } from "react";
import { CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
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

  const stripInlineSources = (md: string): string => {
    if (!md) return "";
    // Remove inline "Fontes:" / "**Fontes:**" / "### Fontes" sections from markdown
    return md
      .replace(/(\n|^)(#{1,3}\s*Fontes[:\s].*)/gis, '')
      .replace(/(\n|^)\*{0,2}Fontes[:\s]*\*{0,2}[\s\S]*$/gi, '')
      .replace(/(\n|^)Fontes utilizadas[:\s]*[\s\S]*$/gi, '')
      .trim();
  };

  const renderMarkdown = (md: string) => {
    if (!md) return "";

    // Step 1: Extract and render markdown tables BEFORE other transformations
    const lines = md.split('\n');
    const processedBlocks: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect table: line starts with | and has at least 2 |
      if (line.trim().startsWith('|') && (line.match(/\|/g) || []).length >= 3) {
        // Collect all consecutive table lines
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          // Parse header row
          const headerCells = tableLines[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());

          // Find separator row (|---|---|) and skip it
          let dataStartIdx = 1;
          if (tableLines.length > 1 && /^[\s|:-]+$/.test(tableLines[1].replace(/-/g, ''))) {
            dataStartIdx = 2;
          }

          // Parse data rows
          const dataRows = tableLines.slice(dataStartIdx).map(row =>
            row.split('|').filter(c => c.trim() !== '').map(c => c.trim())
          );

          // Build HTML table
          let tableHtml = '<div class="overflow-x-auto"><table>';
          tableHtml += '<thead><tr>' + headerCells.map(c => `<th>${c}</th>`).join('') + '</tr></thead>';
          tableHtml += '<tbody>';
          for (const row of dataRows) {
            tableHtml += '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>';
          }
          tableHtml += '</tbody></table></div>';
          processedBlocks.push(tableHtml);
        } else {
          processedBlocks.push(tableLines.join('\n'));
          i++;
        }
      } else {
        processedBlocks.push(line);
        i++;
      }
    }

    // Step 2: Rejoin non-table content and apply other markdown transforms
    let html = processedBlocks.join('\n')
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
          {/* Content — no header, just the answer */}
          <div
            className="farol-summary"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(stripInlineSources(markdown)) }}
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
