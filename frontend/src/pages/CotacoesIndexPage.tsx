import { Link } from "react-router-dom";
import { TrendingUp, BarChart3 } from "lucide-react";
import DataPageLayout from "@/components/DataPageLayout";
import { COMMODITY_MAP, PRIORITY_COMMODITIES } from "@/lib/commodity-utils";

const CATEGORIES: { title: string; emoji: string; slugs: string[] }[] = [
    {
        title: "Grãos",
        emoji: "🌾",
        slugs: ["soja", "milho", "trigo", "arroz", "feijao", "algodao"],
    },
    {
        title: "Pecuária",
        emoji: "🐂",
        slugs: ["boi_gordo", "novilha_gorda", "vaca_gorda", "carne_bovina", "frango", "suino", "leite"],
    },
    {
        title: "Café",
        emoji: "☕",
        slugs: ["cafe"],
    },
    {
        title: "Energia",
        emoji: "⚡",
        slugs: ["cana_de_acucar", "acucar"],
    },
];

export default function CotacoesIndexPage() {
    return (
        <DataPageLayout
            title="Cotações do Agronegócio"
            description="Cotações atualizadas de todas as commodities agrícolas do Brasil — soja, milho, boi gordo, café, trigo e mais."
            path="/cotacoes"
            breadcrumbs={[{ label: "Cotações", href: "/cotacoes" }]}
        >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Cotações do Agronegócio
            </h1>
            <p className="text-muted-foreground mb-8">
                Preços atualizados diariamente para 16 commodities agrícolas em todas as praças do Brasil.
            </p>

            {/* Priority commodities highlight */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {PRIORITY_COMMODITIES.map((slug) => {
                    const c = COMMODITY_MAP[slug];
                    return (
                        <Link
                            key={slug}
                            to={`/cotacoes/${slug}`}
                            className="farol-card p-4 hover:border-primary/30 transition-all group text-center"
                        >
                            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {c.displayName}
                            </span>
                            <span className="block text-xs text-muted-foreground mt-0.5">Ver cotações →</span>
                        </Link>
                    );
                })}
            </div>

            {/* All categories */}
            {CATEGORIES.map((cat) => (
                <div key={cat.title} className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                        {cat.emoji} {cat.title}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {cat.slugs.map((slug) => {
                            const c = COMMODITY_MAP[slug];
                            if (!c) return null;
                            return (
                                <Link
                                    key={slug}
                                    to={`/cotacoes/${slug}`}
                                    className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors group"
                                >
                                    <BarChart3 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                        {c.displayName}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </DataPageLayout>
    );
}
