import { useParams, Link } from "react-router-dom";
import {
    TrendingUp, TrendingDown, ArrowLeft, Calendar, MapPin,
    BarChart3, Loader2, AlertTriangle
} from "lucide-react";
import DataPageLayout from "@/components/DataPageLayout";
import {
    getCommodity, isValidCommodity, formatPrice, formatChange, formatDate,
    PRIORITY_COMMODITIES, COMMODITY_MAP,
} from "@/lib/commodity-utils";
import { useCotacoes, type QuoteRow } from "@/lib/supabase-seo";

/** Group quotes by praça -> latest per praça */
function latestByPraca(quotes: QuoteRow[]): QuoteRow[] {
    const map = new Map<string, QuoteRow>();
    for (const q of quotes) {
        const existing = map.get(q.praca);
        if (!existing || q.quote_date > existing.quote_date) {
            map.set(q.praca, q);
        }
    }
    return Array.from(map.values()).sort((a, b) => {
        const pa = parseFloat(a.price);
        const pb = parseFloat(b.price);
        return pb - pa;
    });
}

function CotacoesNotFound() {
    return (
        <DataPageLayout
            title="Commodity não encontrada"
            description="A commodity solicitada não foi encontrada no Farol Rural."
            path="/cotacoes"
            breadcrumbs={[{ label: "Cotações", href: "/cotacoes" }]}
        >
            <div className="text-center py-16">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Commodity não encontrada</h1>
                <p className="text-muted-foreground mb-6">
                    Verifique o endereço ou escolha uma das commodities abaixo.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {PRIORITY_COMMODITIES.map((slug) => {
                        const c = getCommodity(slug)!;
                        return (
                            <Link
                                key={slug}
                                to={`/cotacoes/${slug}`}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                            >
                                {c.displayName}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </DataPageLayout>
    );
}

export default function CotacoesPage() {
    const { commodity } = useParams<{ commodity: string }>();

    if (!commodity || !isValidCommodity(commodity)) {
        return <CotacoesNotFound />;
    }

    const meta = getCommodity(commodity)!;
    const { data: quotes, loading, error } = useCotacoes(commodity);
    const latestQuotes = quotes ? latestByPraca(quotes) : [];
    const latestDate = latestQuotes[0]?.quote_date;

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `Cotações de ${meta.displayName} — Brasil`,
        description: meta.seoDescription,
        url: `https://farolrural.com.br/cotacoes/${commodity}`,
        temporalCoverage: latestDate ? `../${latestDate}` : undefined,
        spatialCoverage: {
            "@type": "Place",
            name: "Brasil",
        },
        publisher: {
            "@type": "Organization",
            name: "Farol Rural",
            url: "https://farolrural.com.br",
        },
        variableMeasured: [
            { "@type": "PropertyValue", name: "Preço", unitText: latestQuotes[0]?.unit ?? "R$/unidade" },
            { "@type": "PropertyValue", name: "Variação Diária", unitText: "%" },
        ],
    };

    return (
        <DataPageLayout
            title={meta.seoTitle}
            description={meta.seoDescription}
            path={`/cotacoes/${commodity}`}
            breadcrumbs={[
                { label: "Cotações", href: "/cotacoes" },
                { label: meta.displayName, href: `/cotacoes/${commodity}` },
            ]}
            schema={datasetSchema}
        >
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {meta.seoTitle}
                </h1>
                {latestDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Atualizado em {formatDate(latestDate)}</span>
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando cotações...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700">Erro ao carregar cotações. Tente novamente.</p>
                </div>
            )}

            {/* Quotes table */}
            {!loading && !error && latestQuotes.length > 0 && (
                <div className="farol-card overflow-hidden">
                    {/* Table header */}
                    <div className="bg-muted/30 px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">
                                {latestQuotes.length} praça{latestQuotes.length !== 1 ? "s" : ""} com cotação
                            </span>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Praça
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Preço
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Variação Dia
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Variação Semana
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Unidade
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {latestQuotes.map((q) => {
                                    const dayChange = formatChange(q.change_day);
                                    const weekChange = formatChange(q.change_week);
                                    return (
                                        <tr key={q.praca} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="font-medium text-sm text-foreground">{q.praca}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-semibold text-sm text-foreground">
                                                    {formatPrice(q.price)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`flex items-center justify-end gap-1 text-sm ${dayChange.positive ? "text-accent" : "text-destructive"}`}>
                                                    {dayChange.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                    {dayChange.text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`flex items-center justify-end gap-1 text-sm ${weekChange.positive ? "text-accent" : "text-destructive"}`}>
                                                    {weekChange.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                    {weekChange.text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                {q.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                {formatDate(q.quote_date)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-border/50">
                        {latestQuotes.map((q) => {
                            const dayChange = formatChange(q.change_day);
                            return (
                                <div key={q.praca} className="px-4 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-medium text-sm">{q.praca}</span>
                                        </div>
                                        <span className="font-semibold text-sm">{formatPrice(q.price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{q.unit} · {formatDate(q.quote_date)}</span>
                                        <span className={`flex items-center gap-0.5 ${dayChange.positive ? "text-accent" : "text-destructive"}`}>
                                            {dayChange.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {dayChange.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No data */}
            {!loading && !error && latestQuotes.length === 0 && (
                <div className="text-center py-12">
                    <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma cotação disponível no momento.</p>
                </div>
            )}

            {/* Cross-links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to={`/historico/${commodity}`}
                    className="farol-card p-4 hover:border-primary/30 transition-colors group"
                >
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        📈 Histórico de Preços
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Veja a evolução dos preços de {meta.displayName} nos últimos 12 meses
                    </p>
                </Link>
                <Link
                    to={`/producao/${commodity}`}
                    className="farol-card p-4 hover:border-primary/30 transition-colors group"
                >
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        🏭 Produção por Estado
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Ranking dos estados produtores de {meta.displayName}
                    </p>
                </Link>
            </div>

            {/* Other commodities */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Outras Cotações</h2>
                <div className="flex flex-wrap gap-2">
                    {Object.values(COMMODITY_MAP)
                        .filter((c) => c.slug !== commodity)
                        .slice(0, 8)
                        .map((c) => (
                            <Link
                                key={c.slug}
                                to={`/cotacoes/${c.slug}`}
                                className="px-3 py-1.5 bg-muted/50 text-sm text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                                {c.displayName}
                            </Link>
                        ))}
                </div>
            </div>
        </DataPageLayout>
    );
}
