import { useMemo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";
import { Droplets, Thermometer } from "lucide-react";
import type { HistoryDataPoint } from "@/types/farol";

interface ClimateChartProps {
    data: HistoryDataPoint[];
}

function formatDateLabel(dateStr: string): string {
    const [, m, d] = dateStr.split("-");
    return `${d}/${m}`;
}

const ClimateChart = ({ data }: ClimateChartProps) => {
    const chartData = useMemo(
        () =>
            data.map((d) => ({
                date: formatDateLabel(d.date),
                "Mín (°C)": d.temp_min != null ? +d.temp_min.toFixed(1) : null,
                "Máx (°C)": d.temp_max != null ? +d.temp_max.toFixed(1) : null,
                "Chuva (mm)": d.precipitation != null ? +d.precipitation.toFixed(1) : 0,
            })),
        [data]
    );

    // Summary stats
    const totalPrecip = data.reduce((s, r) => s + (r.precipitation ?? 0), 0);
    const avgTemp = data.reduce((s, r) => s + (r.temp_mean ?? 0), 0) / data.length;
    const rainyDays = data.filter((r) => (r.precipitation ?? 0) > 1).length;

    return (
        <div className="farol-card p-5 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">
                        Histórico Climático — últimos {data.length} dias
                    </h4>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Chuva total</p>
                    <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        {totalPrecip.toFixed(0)} mm
                    </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Temp média</p>
                    <p className="text-lg font-bold text-foreground">{avgTemp.toFixed(1)}°C</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Dias c/ chuva</p>
                    <p className="text-lg font-bold text-foreground">
                        {rainyDays}/{data.length}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="tempBand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(15,90%,55%)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(210,80%,55%)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            interval={Math.max(Math.floor(data.length / 8) - 1, 0)}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="temp"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            unit="°"
                        />
                        <YAxis
                            yAxisId="rain"
                            orientation="right"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            unit="mm"
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 10,
                                fontSize: 12,
                                border: "1px solid hsl(var(--border))",
                                background: "hsl(var(--background))",
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area
                            yAxisId="temp"
                            type="monotone"
                            dataKey="Máx (°C)"
                            stroke="hsl(15,90%,55%)"
                            fill="url(#tempBand)"
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                        <Area
                            yAxisId="temp"
                            type="monotone"
                            dataKey="Mín (°C)"
                            stroke="hsl(210,80%,55%)"
                            fill="transparent"
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                        <Bar
                            yAxisId="rain"
                            dataKey="Chuva (mm)"
                            fill="hsl(210,80%,55%)"
                            opacity={0.45}
                            radius={[2, 2, 0, 0]}
                            maxBarSize={8}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[10px] text-muted-foreground text-right mt-1">
                Fonte: Open-Meteo ERA5 reanalysis
            </p>
        </div>
    );
};

export default ClimateChart;
