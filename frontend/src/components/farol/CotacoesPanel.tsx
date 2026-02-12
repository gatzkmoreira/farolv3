import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const SUPABASE_URL = "https://uvrvlesjgyimspdsghmw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cnZsZXNqZ3lpbXNwZHNnaG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzEzOTMsImV4cCI6MjA4NTgwNzM5M30.mQfxFpaI7EPsZqW6FtPows7i9M6hbz6jugC5dMH0TFc";

// --- Product config per page ---
interface ProductConfig {
  product: string;
  praca: string;
  label: string;
  pracaLabel: string;
}

const PAGES: { title: string; emoji: string; items: ProductConfig[] }[] = [
  {
    title: "Pecuária",
    emoji: "🐂",
    items: [
      { product: "boi_gordo", praca: "SP", label: "Boi Gordo", pracaLabel: "SP" },
      { product: "novilha_gorda", praca: "SP", label: "Novilha Gorda", pracaLabel: "SP" },
      { product: "frango", praca: "Brasil", label: "Frango", pracaLabel: "BR" },
      { product: "suino", praca: "Brasil", label: "Suíno", pracaLabel: "BR" },
    ],
  },
  {
    title: "Grãos & Café",
    emoji: "🌾",
    items: [
      { product: "soja", praca: "MT", label: "Soja", pracaLabel: "MT" },
      { product: "milho", praca: "MT", label: "Milho", pracaLabel: "MT" },
      { product: "cafe_arabica", praca: "SP", label: "Café Arábica", pracaLabel: "SP" },
      { product: "trigo", praca: "PR", label: "Trigo", pracaLabel: "PR" },
    ],
  },
];

// Flatten the product+praca pairs for the query
const ALL_ITEMS = PAGES.flatMap((p) => p.items);

interface QuoteRow {
  product: string;
  praca: string;
  price: string;
  unit: string;
  quote_date: string;
  change_day: number | null;
}

async function fetchQuotes(): Promise<QuoteRow[]> {
  // Build OR filter: (product.eq.boi_gordo,praca.eq.SP),(product.eq.soja,praca.eq.MT)...
  const orClauses = ALL_ITEMS.map(
    (item) => `and(product.eq.${item.product},praca.eq.${item.praca})`
  ).join(",");

  const params = new URLSearchParams({
    select: "product,praca,price,unit,quote_date,change_day",
    or: `(${orClauses})`,
    order: "quote_date.desc",
    limit: "50",
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/quotes?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function findLatestQuote(rows: QuoteRow[], product: string, praca: string): QuoteRow | undefined {
  return rows.find((r) => r.product === product && r.praca === praca);
}

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

function formatChange(change: number | null): { text: string; positive: boolean } {
  if (change === null || change === undefined) return { text: "—", positive: true };
  const positive = change >= 0;
  return {
    text: (positive ? "+" : "") + change.toFixed(2).replace(".", ","),
    positive,
  };
}

const CotacoesPanel = () => {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchQuotes()
      .then((data) => {
        if (!cancelled) {
          setRows(data);
          setLastUpdate(
            new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          );
        }
      })
      .catch((err) => console.warn("[CotacoesPanel] fetch failed:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const page = PAGES[pageIndex];

  const goNext = () => setPageIndex((i) => (i + 1) % PAGES.length);
  const goPrev = () => setPageIndex((i) => (i - 1 + PAGES.length) % PAGES.length);

  return (
    <div className="farol-card p-5">
      {/* Header with navigation arrows */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Cotações</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground min-w-[80px] text-center">
            {page.emoji} {page.title}
          </span>
          <button
            onClick={goNext}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {page.items.map((item) => {
            const quote = findLatestQuote(rows, item.product, item.praca);
            const change = formatChange(quote?.change_day ?? null);

            return (
              <div
                key={`${item.product}-${item.praca}`}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}{" "}
                    <span className="text-xs text-muted-foreground">({item.pracaLabel})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{quote?.unit ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {quote ? formatPrice(quote.price) : "—"}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-0.5 text-xs ${change.positive ? "text-accent" : "text-destructive"
                      }`}
                  >
                    {change.positive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{change.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Page indicator + update time */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1">
          {PAGES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === pageIndex ? "bg-primary" : "bg-border"
                }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {lastUpdate ? `Atualizado às ${lastUpdate}` : "Carregando..."}
        </p>
      </div>
    </div>
  );
};

export default CotacoesPanel;
