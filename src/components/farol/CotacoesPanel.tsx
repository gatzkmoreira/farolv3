import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { Cotacao } from "@/types/farol";

const mockCotacoes: Cotacao[] = [
  { name: "Boi Gordo", value: "R$ 315,50", change: "+2,30", changePercent: "+0,73%", isPositive: true, unit: "@" },
  { name: "Soja", value: "R$ 128,40", change: "-1,20", changePercent: "-0,92%", isPositive: false, unit: "saca" },
  { name: "Milho", value: "R$ 72,80", change: "+0,45", changePercent: "+0,62%", isPositive: true, unit: "saca" },
  { name: "Café", value: "R$ 1.420", change: "+15,00", changePercent: "+1,07%", isPositive: true, unit: "saca" },
];

const CotacoesPanel = () => {
  return (
    <div className="farol-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-secondary-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Cotações</h3>
      </div>

      {/* Cotações list */}
      <div className="space-y-3">
        {mockCotacoes.map((cotacao) => (
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
              <div className={`flex items-center justify-end gap-0.5 text-xs ${
                cotacao.isPositive ? 'text-accent' : 'text-destructive'
              }`}>
                {cotacao.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{cotacao.changePercent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update time */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Atualizado há 15 min
      </p>
    </div>
  );
};

export default CotacoesPanel;
