import { useMemo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PriceHistoryPoint, PriceComparisonPoint } from "@/types/farol";

interface PriceChartProps {
    priceHistory: PriceHistoryPoint[];
    priceComparison?: PriceComparisonPoint[];
    product?: string;
}

function formatDateLabel(dateStr: string): string {
    const [, m, d] = dateStr.split("-");
    return `${d}/${m}`;
}

const PRODUCT_LABELS: Record<string, string> = {
    boi_gordo: "Boi Gordo",
    soja: "Soja",
    milho: "Milho",
    cafe_arabica: "Café Arábica",
    leite: "Leite",
    trigo: "Trigo",
};

const PriceChart = ({ priceHistory, priceComparison, product }: PriceChartProps) => {
    const label = product ? PRODUCT_LABELS[product] ?? product.replace(/_/g, " ") : "Preço";

    const compData = useMemo(() => {
        if (!priceComparison || priceComparison.length === 0) return [];
        return priceComparison.slice(0, 8).map((d) => ({
            state: d.state,
            price: d.price,
            unit: d.unit,
        }));
    }, [priceComparison]);

    // Guard: if no price history, render only comparison (if available) or nothing
    if (!priceHistory || priceHistory.length === 0) {
        if (compData.length <= 1) return null;
        // Render only the bar chart below (skip line chart + stats)
    }

    const chartData = (priceHistory ?? []).map((d) => ({
        date: formatDateLabel(d.date),
        price: d.price,
    }));

    const hasHistory = chartData.length > 0;

    // Stats (safe defaults when empty)
    const currentPrice = priceHistory?.[priceHistory.length - 1]?.price ?? 0;
    const firstPrice = priceHistory?.[0]?.price ?? 0;
    const variation30d = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;
    const prices = (priceHistory ?? []).map((d) => d.price);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const TrendIcon = variation30d > 0.5 ? TrendingUp : variation30d < -0.5 ? TrendingDown : Minus;
    const trendColor = variation30d > 0.5 ? "text-emerald-600" : variation30d < -0.5 ? "text-red-500" : "text-muted-foreground";

    // Bar chart colors: highest = green, lowest = red, others = blue
    const compMax = compData.length > 0 ? Math.max(...compData.map((d) => d.price)) : 0;
    const compMin = compData.length > 0 ? Math.min(...compData.map((d) => d.price)) : 0;

    return (
        <div className="farol-card p-5 mt-4">
            {/* Header + Stats + Line chart — only when priceHistory has data */}
            {hasHistory && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                            </div>
                            <h4 className="font-semibold text-sm text-foreground">
                                {label} — últimos {priceHistory.length} dias
                            </h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Atual</p>
                            <p className="text-lg font-bold text-foreground">
                                R$ {currentPrice.toFixed(2).replace(".", ",")}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Var. 30d</p>
                            <p className={`text-lg font-bold ${trendColor}`}>
                                {variation30d >= 0 ? "+" : ""}
                                {variation30d.toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Range</p>
                            <p className="text-sm font-bold text-foreground">
                                {minPrice.toFixed(0)} – {maxPrice.toFixed(0)}
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(152,60%,45%)" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="hsl(152,60%,45%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    interval={Math.max(Math.floor(priceHistory.length / 7) - 1, 0)}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={["auto", "auto"]}
                                    tickFormatter={(v: number) => `${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 10,
                                        fontSize: 12,
                                        border: "1px solid hsl(var(--border))",
                                        background: "hsl(var(--background))",
                                    }}
                                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Preço"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="hsl(152,60%,45%)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: "hsl(152,60%,45%)" }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* Bar chart — state comparison */}
            {compData.length > 1 && (
                <div className="mt-5">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Comparativo entre praças
                    </h5>
                    <div className="w-full h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={compData}
                                layout="vertical"
                                margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={["auto", "auto"]}
                                />
                                <YAxis
                                    dataKey="state"
                                    type="category"
                                    tick={{ fontSize: 11, fontWeight: 600 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 10,
                                        fontSize: 12,
                                        border: "1px solid hsl(var(--border))",
                                        background: "hsl(var(--background))",
                                    }}
                                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Preço"]}
                                />
                                <Bar dataKey="price" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                    {compData.map((entry, idx) => (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={
                                                entry.price === compMax
                                                    ? "hsl(152,60%,45%)"
                                                    : entry.price === compMin
                                                        ? "hsl(0,70%,55%)"
                                                        : "hsl(215,70%,55%)"
                                            }
                                            opacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-right mt-1">
                Fonte: Scot Consultoria / Base FarolRural
            </p>
        </div>
    );
};

export default PriceChart;
