import { useParams, Link } from "react-router-dom";
import {
    TrendingUp, TrendingDown, Calendar, Loader2, AlertTriangle, BarChart3
} from "lucide-react";
import DataPageLayout from "@/components/DataPageLayout";
import {
    getCommodity, isValidCommodity, formatPrice, formatDate, COMMODITY_MAP, PRIORITY_COMMODITIES,
    normalizePrice, UNIT_STANDARDS,
} from "@/lib/commodity-utils";
import { useHistorico, type PriceHistoryRow } from "@/lib/supabase-seo";

function aggregateMonthly(rows: PriceHistoryRow[], commodity: string) {
    const map = new Map<string, { prices: number[]; month: string }>();
    for (const r of rows) {
        const month = r.recorded_date.substring(0, 7); // YYYY-MM
        if (!map.has(month)) map.set(month, { prices: [], month });
        const normalized = normalizePrice(commodity, Number(r.price), r.unit);
        map.get(month)!.prices.push(normalized);
    }
    return Array.from(map.values())
        .map((m) => ({
            month: m.month,
            min: Math.min(...m.prices),
            max: Math.max(...m.prices),
            avg: m.prices.reduce((a, b) => a + b, 0) / m.prices.length,
            count: m.prices.length,
        }))
        .sort((a, b) => b.month.localeCompare(a.month));
}

function formatMonth(ym: string): string {
    const [y, m] = ym.split("-");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${months[parseInt(m) - 1]}/${y}`;
}

export default function HistoricoPage() {
    const { commodity } = useParams<{ commodity: string }>();

    if (!commodity || !isValidCommodity(commodity)) {
        return (
            <DataPageLayout
                title="Commodity não encontrada"
                description="A commodity solicitada não foi encontrada."
                path="/historico"
                breadcrumbs={[{ label: "Histórico", href: "/historico" }]}
            >
                <div className="text-center py-16">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Commodity não encontrada</h1>
                    <p className="text-muted-foreground mb-6">Escolha uma commodity:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {PRIORITY_COMMODITIES.map((slug) => (
                            <Link key={slug} to={`/historico/${slug}`} className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
                                {getCommodity(slug)!.displayName}
                            </Link>
                        ))}
                    </div>
                </div>
            </DataPageLayout>
        );
    }

    const meta = getCommodity(commodity)!;
    const { data: rows, loading, error } = useHistorico(commodity);
    const monthly = rows ? aggregateMonthly(rows, commodity) : [];
    const unitLabel = UNIT_STANDARDS[commodity]?.label ?? "R$";
    const latestDate = rows?.[0]?.recorded_date;

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `Histórico de Preços ${meta.displayName}`,
        description: `Evolução dos preços de ${meta.displayName} nos últimos 12 meses.`,
        url: `https://farolrural.com.br/historico/${commodity}`,
        temporalCoverage: latestDate ? `../${latestDate}` : undefined,
        publisher: { "@type": "Organization", name: "Farol Rural", url: "https://farolrural.com.br" },
    };

    return (
        <DataPageLayout
            title={`Histórico de Preços ${meta.displayName}`}
            description={`Evolução dos preços de ${meta.displayName} nos últimos 12 meses. Gráfico interativo com preços diários e médias móveis.`}
            path={`/historico/${commodity}`}
            breadcrumbs={[
                { label: "Histórico", href: `/historico/${commodity}` },
                { label: meta.displayName, href: `/historico/${commodity}` },
            ]}
            schema={datasetSchema}
        >
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    📈 Histórico de Preços — {meta.displayName}
                </h1>
                {latestDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Dados até {formatDate(latestDate)}</span>
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700">Erro ao carregar dados históricos.</p>
                </div>
            )}

            {!loading && !error && monthly.length > 0 && (
                <div className="farol-card overflow-hidden">
                    <div className="bg-muted/30 px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">Preços Mensais</span>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mês</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Média ({unitLabel})</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mínima</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Máxima</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Registros</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {monthly.map((m, i) => {
                                    const prev = monthly[i + 1];
                                    const change = prev ? ((m.avg - prev.avg) / prev.avg) * 100 : null;
                                    return (
                                        <tr key={m.month} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-foreground">{formatMonth(m.month)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-semibold text-sm">{formatPrice(m.avg)}</span>
                                                    {change !== null && (
                                                        <span className={`text-xs flex items-center gap-0.5 ${change >= 0 ? "text-accent" : "text-destructive"}`}>
                                                            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatPrice(m.min)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatPrice(m.max)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{m.count}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-border/50">
                        {monthly.map((m) => (
                            <div key={m.month} className="px-4 py-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-sm">{formatMonth(m.month)}</span>
                                    <span className="font-semibold text-sm">{formatPrice(m.avg)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Mín: {formatPrice(m.min)} · Máx: {formatPrice(m.max)} · {m.count} registros
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !error && monthly.length === 0 && (
                <div className="text-center py-12">
                    <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum dado histórico disponível.</p>
                </div>
            )}

            {/* Cross-links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/cotacoes/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">💰 Cotações Atuais</h3>
                    <p className="text-xs text-muted-foreground mt-1">Preços de {meta.displayName} hoje por praça</p>
                </Link>
                <Link to={`/producao/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">🏭 Produção por Estado</h3>
                    <p className="text-xs text-muted-foreground mt-1">Ranking dos estados produtores</p>
                </Link>
            </div>

            {/* Other commodities */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Histórico de Outras Commodities</h2>
                <div className="flex flex-wrap gap-2">
                    {Object.values(COMMODITY_MAP).filter((c) => c.slug !== commodity).slice(0, 8).map((c) => (
                        <Link key={c.slug} to={`/historico/${c.slug}`} className="px-3 py-1.5 bg-muted/50 text-sm text-foreground rounded-lg hover:bg-muted transition-colors">
                            {c.displayName}
                        </Link>
                    ))}
                </div>
            </div>
        </DataPageLayout>
    );
}
