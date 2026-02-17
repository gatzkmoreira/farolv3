import { useParams, Link } from "react-router-dom";
import {
    TrendingUp, TrendingDown, Loader2, AlertTriangle, Ship, DollarSign, Package
} from "lucide-react";
import DataPageLayout from "@/components/DataPageLayout";
import {
    getCommodity, isValidCommodity, COMMODITY_MAP, PRIORITY_COMMODITIES,
} from "@/lib/commodity-utils";
import { useExportacao, type ExportRow } from "@/lib/supabase-seo";

const EXPORT_SLUGS = ["soja", "milho", "cafe", "algodao", "carne_bovina", "frango"];

function formatNumber(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(".", ",")} bi`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} mil`;
    return n.toLocaleString("pt-BR");
}

function formatMonth(year: number, month: number): string {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${months[month - 1]}/${year}`;
}

function formatUSD(n: number): string {
    if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2).replace(".", ",")} bi`;
    if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
    return `US$ ${n.toLocaleString("pt-BR")}`;
}

export default function ExportacaoPage() {
    const { commodity } = useParams<{ commodity: string }>();

    if (!commodity || !isValidCommodity(commodity) || !EXPORT_SLUGS.includes(commodity)) {
        return (
            <DataPageLayout
                title="Dados de exportação"
                description="Dados de exportação de commodities do Brasil."
                path="/exportacao"
                breadcrumbs={[{ label: "Exportação", href: "/exportacao" }]}
            >
                <div className="text-center py-16">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {commodity && isValidCommodity(commodity) ? "Dados de exportação indisponíveis" : "Commodity não encontrada"}
                    </h1>
                    <p className="text-muted-foreground mb-6">Commodities com dados de exportação:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {EXPORT_SLUGS.map((slug) => (
                            <Link key={slug} to={`/exportacao/${slug}`} className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
                                {getCommodity(slug)!.displayName}
                            </Link>
                        ))}
                    </div>
                </div>
            </DataPageLayout>
        );
    }

    const meta = getCommodity(commodity)!;
    const { data: rows, loading, error } = useExportacao(commodity);
    const sortedRows = rows ? [...rows].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
    }) : [];

    const totalVolume = sortedRows.reduce((s, r) => s + Number(r.quantity_kg) / 1000, 0);
    const totalValue = sortedRows.reduce((s, r) => s + Number(r.value_usd), 0);

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `Exportação de ${meta.displayName}`,
        description: `Dados de exportação de ${meta.displayName}. Volume, valor e tendências mensais.`,
        url: `https://farolrural.com.br/exportacao/${commodity}`,
        publisher: { "@type": "Organization", name: "Farol Rural", url: "https://farolrural.com.br" },
    };

    return (
        <DataPageLayout
            title={`Exportação de ${meta.displayName}`}
            description={`Dados de exportação de ${meta.displayName}. Volume, valor e tendências mensais do COMEX Stat / MDIC.`}
            path={`/exportacao/${commodity}`}
            breadcrumbs={[
                { label: "Exportação", href: `/exportacao/${commodity}` },
                { label: meta.displayName, href: `/exportacao/${commodity}` },
            ]}
            schema={datasetSchema}
        >
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    🚢 Exportação de {meta.displayName}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Dados mensais do COMEX Stat (MDIC) — volume e valor de exportação
                </p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando dados...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700">Erro ao carregar dados de exportação.</p>
                </div>
            )}

            {!loading && !error && sortedRows.length > 0 && (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <div className="farol-card p-4 text-center">
                            <Package className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{formatNumber(totalVolume)} t</p>
                            <p className="text-xs text-muted-foreground">Volume Total</p>
                        </div>
                        <div className="farol-card p-4 text-center">
                            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{formatUSD(totalValue)}</p>
                            <p className="text-xs text-muted-foreground">Valor Total</p>
                        </div>
                        <div className="farol-card p-4 text-center hidden md:block">
                            <Ship className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{sortedRows.length}</p>
                            <p className="text-xs text-muted-foreground">Meses de Dados</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="farol-card overflow-hidden">
                        <div className="bg-muted/30 px-4 py-3 border-b border-border">
                            <span className="font-semibold text-sm text-foreground">Exportações Mensais</span>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/10">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mês</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume (t)</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor (USD)</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço Médio (USD/t)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {sortedRows.map((r, i) => {
                                        const volTon = Number(r.quantity_kg) / 1000;
                                        const prev = sortedRows[i + 1];
                                        const prevVolTon = prev ? Number(prev.quantity_kg) / 1000 : null;
                                        const volChange = prevVolTon ? ((volTon - prevVolTon) / prevVolTon) * 100 : null;
                                        const avgPrice = volTon > 0 ? Number(r.value_usd) / volTon : null;
                                        return (
                                            <tr key={`${r.year}-${r.month}`} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-4 py-3 text-sm font-medium">{formatMonth(r.year, r.month)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-sm">{formatNumber(volTon)}</span>
                                                        {volChange !== null && (
                                                            <span className={`text-xs flex items-center gap-0.5 ${volChange >= 0 ? "text-accent" : "text-destructive"}`}>
                                                                {volChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                                {volChange >= 0 ? "+" : ""}{volChange.toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">{formatUSD(Number(r.value_usd))}</td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {avgPrice ? `US$ ${avgPrice.toFixed(0)}` : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-border/50">
                            {sortedRows.map((r) => {
                                const volTon = Number(r.quantity_kg) / 1000;
                                const avgPrice = volTon > 0 ? Number(r.value_usd) / volTon : null;
                                return (
                                    <div key={`${r.year}-${r.month}`} className="px-4 py-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-sm">{formatMonth(r.year, r.month)}</span>
                                            <span className="font-semibold text-sm">{formatNumber(volTon)} t</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatUSD(Number(r.value_usd))} · Preço médio: {avgPrice ? `US$ ${avgPrice.toFixed(0)}/t` : "—"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {!loading && !error && sortedRows.length === 0 && (
                <div className="text-center py-12">
                    <Ship className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum dado de exportação disponível.</p>
                </div>
            )}

            {/* Cross-links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/cotacoes/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary">💰 Cotações Atuais</h3>
                    <p className="text-xs text-muted-foreground mt-1">Preços de {meta.displayName} hoje</p>
                </Link>
                <Link to={`/producao/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary">🏭 Produção por Estado</h3>
                    <p className="text-xs text-muted-foreground mt-1">Ranking dos estados produtores</p>
                </Link>
            </div>

            {/* Other export commodities */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Exportação de Outras Commodities</h2>
                <div className="flex flex-wrap gap-2">
                    {EXPORT_SLUGS.filter((s) => s !== commodity).map((slug) => (
                        <Link key={slug} to={`/exportacao/${slug}`} className="px-3 py-1.5 bg-muted/50 text-sm text-foreground rounded-lg hover:bg-muted transition-colors">
                            {getCommodity(slug)!.displayName}
                        </Link>
                    ))}
                </div>
            </div>
        </DataPageLayout>
    );
}
