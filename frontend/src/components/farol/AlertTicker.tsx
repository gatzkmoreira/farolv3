import { useRef, useState } from "react";
import { useAlerts, type MarketAlert } from "@/hooks/use-alerts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    MapPin,
    ChevronRight,
} from "lucide-react";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
    critical: {
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
    },
    warning: {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    info: {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
};

/** Replace underscores with spaces and capitalize each word */
function formatCommodity(name: string): string {
    if (!name) return "";
    return name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build a human-friendly title from alert data */
function buildTitle(alert: MarketAlert): string {
    const commodity = formatCommodity(alert.commodity);
    const loc = formatLocation(alert.location);
    const data = alert.data || {};

    if (alert.alert_type === "exchange") {
        const change = data.weekly_change_pct as number;
        const rate = data.current_rate as number;
        return `Dólar ${change > 0 ? "subiu" : "caiu"} ${Math.abs(change)}% na semana — R$${rate?.toFixed(2) ?? "?"}`;
    }

    if (alert.alert_type === "price_anomaly") {
        const pct = data.pct_change as number;
        return `${commodity} (${loc}): ${pct > 0 ? "+" : ""}${pct}% vs média`;
    }

    // trend
    const direction = data.direction as string;
    const months = data.consecutive_months as number;
    const change = data.total_change_pct as number;
    const arrow = direction === "up" ? "alta" : "queda";
    return `${commodity} (${loc}): ${arrow} ${months} meses (${change > 0 ? "+" : ""}${change}%)`;
}

function AlertIcon({ alert }: { alert: MarketAlert }) {
    const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;

    if (alert.alert_type === "exchange") {
        return <DollarSign className={`w-4 h-4 ${style.icon} flex-shrink-0`} />;
    }
    if (alert.alert_type === "price_anomaly") {
        return <AlertTriangle className={`w-4 h-4 ${style.icon} flex-shrink-0`} />;
    }

    const direction = alert.data?.direction;
    if (direction === "up") {
        return <TrendingUp className={`w-4 h-4 ${style.icon} flex-shrink-0`} />;
    }
    return <TrendingDown className={`w-4 h-4 ${style.icon} flex-shrink-0`} />;
}

function formatLocation(loc: string): string {
    if (!loc) return "";
    if (loc.length === 2) return loc.toUpperCase();
    return loc.charAt(0).toUpperCase() + loc.slice(1);
}

/** Smart relevance score: higher = more relevant / impressive */
function alertScore(a: MarketAlert): number {
    // Type priority: weather=1000, exchange=500, price_anomaly=300, trend=100
    const typeScore: Record<string, number> = {
        weather: 1000,
        exchange: 500,
        price_anomaly: 300,
        trend: 100,
    };
    const base = typeScore[a.alert_type] ?? 50;

    // Severity bonus
    const sevBonus = a.severity === "critical" ? 200 : a.severity === "warning" ? 100 : 0;

    // Magnitude bonus: bigger % change = more relevant
    const pctChange = Math.abs(
        (a.data?.pct_change as number) || (a.data?.total_change_pct as number) || 0
    );
    const magBonus = Math.min(pctChange * 2, 200); // cap at 200

    // Streak bonus for trends: longer streak = more relevant
    const streakBonus = ((a.data?.consecutive_months as number) || 0) * 15;

    return base + sevBonus + magBonus + streakBonus;
}

function AlertItem({ alert }: { alert: MarketAlert }) {
    const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;

    return (
        <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all select-none ${style.bg} ${style.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0 animate-pulse`} />
            <AlertIcon alert={alert} />
            <span className="text-foreground/90">{buildTitle(alert)}</span>
        </div>
    );
}

function TickerTrack({ alerts }: { alerts: MarketAlert[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    const doubled = [...alerts, ...alerts];

    return (
        <div
            className="overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                ref={trackRef}
                className="flex gap-3 ticker-scroll"
                style={{
                    animationPlayState: isPaused ? "paused" : "running",
                    animationDuration: `${alerts.length * 8}s`,
                }}
            >
                {doubled.map((alert, i) => (
                    <AlertItem key={`${alert.id}-${i}`} alert={alert} />
                ))}
            </div>
        </div>
    );
}

export default function AlertTicker() {
    const { alerts, loading } = useAlerts();

    // Smart sort: highest score first, then take top 8
    const tickerAlerts = [...alerts]
        .sort((a, b) => alertScore(b) - alertScore(a))
        .slice(0, 8);

    if (loading || tickerAlerts.length === 0) {
        return null;
    }

    return (
        <div className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="farol-container">
                <div className="flex items-center gap-3 py-2">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Alertas
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>

                    <TickerTrack alerts={tickerAlerts} />
                </div>
            </div>
        </div>
    );
}
