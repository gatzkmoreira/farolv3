import { useMemo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    LineChart,
    BarChart,
    AreaChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { ChartConfig } from "@/types/farol";

interface GenericChartProps {
    charts: ChartConfig[];
}

function formatDateLabel(dateStr: string): string {
    if (!dateStr || typeof dateStr !== "string") return String(dateStr);
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
}

const TOOLTIP_STYLE = {
    borderRadius: 10,
    fontSize: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--background))",
};

const SingleChart = ({ config }: { config: ChartConfig }) => {
    const data = useMemo(() => {
        return config.data.map((d) => {
            const mapped: Record<string, unknown> = { ...d };
            if (typeof d[config.xKey] === "string") {
                mapped[config.xKey] = formatDateLabel(d[config.xKey] as string);
            }
            return mapped;
        });
    }, [config]);

    const renderContent = () => {
        const commonProps = {
            data,
            margin: { top: 4, right: 8, left: -16, bottom: 0 },
        };

        if (config.type === "bar") {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {config.yKeys.map((yk) => (
                        <Bar key={yk.key} dataKey={yk.key} name={yk.label} fill={yk.color} radius={[3, 3, 0, 0]} maxBarSize={16} opacity={0.8} />
                    ))}
                </BarChart>
            );
        }

        if (config.type === "bar_stacked") {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {config.yKeys.map((yk) => (
                        <Bar key={yk.key} dataKey={yk.key} name={yk.label} fill={yk.color} stackId="a" maxBarSize={28} opacity={0.85} />
                    ))}
                </BarChart>
            );
        }

        if (config.type === "line_dual") {
            // Dual-axis chart: left axis for price, right axis for exchange rate
            const leftKeys = config.yKeys.filter((yk) => yk.axis === "left" || !yk.axis);
            const rightKeys = config.yKeys.filter((yk) => yk.axis === "right");
            return (
                <ComposedChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    {rightKeys.length > 0 && (
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    )}
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {leftKeys.map((yk) => (
                        <Line key={yk.key} yAxisId="left" type="monotone" dataKey={yk.key} name={yk.label} stroke={yk.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                    ))}
                    {rightKeys.map((yk) => (
                        <Line key={yk.key} yAxisId="right" type="monotone" dataKey={yk.key} name={yk.label} stroke={yk.color} strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 2 }} />
                    ))}
                </ComposedChart>
            );
        }

        if (config.type === "area") {
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        {config.yKeys.map((yk) => (
                            <linearGradient key={`grad-${yk.key}`} id={`area-${yk.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={yk.color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={yk.color} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {config.yKeys.map((yk) => (
                        <Area key={yk.key} type="monotone" dataKey={yk.key} name={yk.label} stroke={yk.color} fill={`url(#area-${yk.key})`} strokeWidth={2} dot={false} />
                    ))}
                </AreaChart>
            );
        }

        // Default: line
        return (
            <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey={config.xKey} tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {config.yKeys.map((yk) => (
                    <Line key={yk.key} type="monotone" dataKey={yk.key} name={yk.label} stroke={yk.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                ))}
            </LineChart>
        );
    };

    return (
        <div className="mt-4">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {config.title}
            </h5>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    {renderContent()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const GenericChart = ({ charts }: GenericChartProps) => {
    if (!charts || charts.length === 0) return null;

    // Up to 2 charts per response (3rd only for very specific structural queries)
    const visible = charts.slice(0, 2);

    return (
        <div className="farol-card p-5 mt-4">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">Visualização</h4>
            </div>
            {visible.map((chart, idx) => (
                <SingleChart key={idx} config={chart} />
            ))}
        </div>
    );
};

export default GenericChart;
