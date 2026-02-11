import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import type { Cotacao } from "@/types/farol";
import { transformCotacoes } from "@/types/farol";
import { apiFetch } from "@/lib/api";

const CotacoesPanel = () => {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<unknown>("/api/cotacoes")
      .then((data) => {
        if (!cancelled) {
          const items = transformCotacoes(data);
          setCotacoes(items.slice(0, 6));
          setLastUpdate(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
        }
      })
      .catch((err) => {
        console.warn("[CotacoesPanel] fetch failed:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="farol-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-secondary-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Cotações</h3>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : cotacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma cotação disponível.
        </p>
      ) : (
        <div className="space-y-3">
          {cotacoes.map((cotacao) => (
            <div
              key={cotacao.name}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{cotacao.name}</p>
                <p className="text-xs text-muted-foreground">{cotacao.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{cotacao.value}</p>
                <div className={`flex items-center justify-end gap-0.5 text-xs ${cotacao.isPositive ? 'text-accent' : 'text-destructive'
                  }`}>
                  {cotacao.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{cotacao.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update time */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        {lastUpdate ? `Atualizado às ${lastUpdate}` : "Carregando..."}
      </p>
    </div>
  );
};

export default CotacoesPanel;
