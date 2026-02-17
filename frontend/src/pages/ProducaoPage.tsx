import { useParams, Link } from "react-router-dom";
import {
    MapPin, Loader2, AlertTriangle, BarChart3, Factory
} from "lucide-react";
import DataPageLayout from "@/components/DataPageLayout";
import {
    getCommodity, isValidCommodity, COMMODITY_MAP, PRIORITY_COMMODITIES, getUFName,
} from "@/lib/commodity-utils";
import { useProducao, type ProductionRow } from "@/lib/supabase-seo";

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} mil`;
    return n.toLocaleString("pt-BR");
}

export default function ProducaoPage() {
    const { commodity } = useParams<{ commodity: string }>();

    if (!commodity || !isValidCommodity(commodity)) {
        return (
            <DataPageLayout
                title="Commodity não encontrada"
                description="A commodity solicitada não foi encontrada."
                path="/producao"
                breadcrumbs={[{ label: "Produção", href: "/producao" }]}
            >
                <div className="text-center py-16">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Commodity não encontrada</h1>
                    <p className="text-muted-foreground mb-6">Escolha uma commodity:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {PRIORITY_COMMODITIES.map((slug) => (
                            <Link key={slug} to={`/producao/${slug}`} className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
                                {getCommodity(slug)!.displayName}
                            </Link>
                        ))}
                    </div>
                </div>
            </DataPageLayout>
        );
    }

    const meta = getCommodity(commodity)!;
    const { data: rows, loading, error } = useProducao(commodity);
    const sortedRows = rows ? [...rows].sort((a, b) => b.production_tonnes - a.production_tonnes) : [];
    const totalProduction = sortedRows.reduce((sum, r) => sum + Number(r.production_tonnes), 0);

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `Produção de ${meta.displayName} por Estado`,
        description: `Ranking dos estados produtores de ${meta.displayName}. Área plantada, produção e produtividade por UF.`,
        url: `https://farolrural.com.br/producao/${commodity}`,
        publisher: { "@type": "Organization", name: "Farol Rural", url: "https://farolrural.com.br" },
    };

    return (
        <DataPageLayout
            title={`Produção de ${meta.displayName} por Estado`}
            description={`Ranking dos estados produtores de ${meta.displayName}. Área plantada, produção e produtividade por UF.`}
            path={`/producao/${commodity}`}
            breadcrumbs={[
                { label: "Produção", href: `/producao/${commodity}` },
                { label: meta.displayName, href: `/producao/${commodity}` },
            ]}
            schema={datasetSchema}
        >
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    🏭 Produção de {meta.displayName} por Estado
                </h1>
                <p className="text-sm text-muted-foreground">
                    Dados da série histórica CONAB — área plantada, produção e produtividade
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
                    <p className="text-red-700">Erro ao carregar dados de produção.</p>
                </div>
            )}

            {!loading && !error && sortedRows.length > 0 && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <div className="farol-card p-4 text-center">
                            <Factory className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{formatNumber(totalProduction)} t</p>
                            <p className="text-xs text-muted-foreground">Produção Total</p>
                        </div>
                        <div className="farol-card p-4 text-center">
                            <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{sortedRows.length}</p>
                            <p className="text-xs text-muted-foreground">Estados Produtores</p>
                        </div>
                        <div className="farol-card p-4 text-center hidden md:block">
                            <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-lg font-bold text-foreground">{sortedRows[0]?.state_code ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">Maior Produtor</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="farol-card overflow-hidden">
                        <div className="bg-muted/30 px-4 py-3 border-b border-border">
                            <span className="font-semibold text-sm text-foreground">Ranking por Produção</span>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/10">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Produção (t)</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Área (ha)</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Produtividade (kg/ha)</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {sortedRows.map((r, i) => {
                                        const share = totalProduction > 0 ? (Number(r.production_tonnes) / totalProduction) * 100 : 0;
                                        return (
                                            <tr key={r.state_code} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="font-medium text-sm">{getUFName(r.state_code)}</span>
                                                        <span className="text-xs text-muted-foreground">({r.state_code})</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-sm">{formatNumber(Number(r.production_tonnes))}</td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatNumber(Number(r.area_planted_ha))}</td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatNumber(Number(r.yield_kg_per_ha))}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(share, 100)}%` }} />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-10 text-right">{share.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-border/50">
                            {sortedRows.map((r, i) => {
                                const share = totalProduction > 0 ? (Number(r.production_tonnes) / totalProduction) * 100 : 0;
                                return (
                                    <div key={r.state_code} className="px-4 py-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-sm">
                                                <span className="text-muted-foreground mr-1">#{i + 1}</span>
                                                {getUFName(r.state_code)}
                                            </span>
                                            <span className="font-semibold text-sm">{formatNumber(Number(r.production_tonnes))} t</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Área: {formatNumber(Number(r.area_planted_ha))} ha</span>
                                            <span>{share.toFixed(1)}% do total</span>
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
                    <Factory className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum dado de produção disponível.</p>
                </div>
            )}

            {/* Cross-links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/cotacoes/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary">💰 Cotações Atuais</h3>
                    <p className="text-xs text-muted-foreground mt-1">Preços de {meta.displayName} hoje</p>
                </Link>
                <Link to={`/historico/${commodity}`} className="farol-card p-4 hover:border-primary/30 transition-colors group">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary">📈 Histórico de Preços</h3>
                    <p className="text-xs text-muted-foreground mt-1">Evolução dos preços nos últimos 12 meses</p>
                </Link>
            </div>

            {/* Other commodities */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Produção de Outras Commodities</h2>
                <div className="flex flex-wrap gap-2">
                    {Object.values(COMMODITY_MAP).filter((c) => c.slug !== commodity).slice(0, 8).map((c) => (
                        <Link key={c.slug} to={`/producao/${c.slug}`} className="px-3 py-1.5 bg-muted/50 text-sm text-foreground rounded-lg hover:bg-muted transition-colors">
                            {c.displayName}
                        </Link>
                    ))}
                </div>
            </div>
        </DataPageLayout>
    );
}
