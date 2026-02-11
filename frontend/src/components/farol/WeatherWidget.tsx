import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSun, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WeatherAPIData {
  location?: { name?: string; uf?: string } | string;
  current?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    humidity?: number;
    condition?: string;
  };
  forecast?: { date?: string; temp_min?: number; temp_max?: number; condition?: string; rain_prob?: number }[];
  // Flat fallback shape
  temperature?: number | string;
  condition?: string;
  max_temp?: number | string;
  min_temp?: number | string;
  rain_chance?: number | string;
}

const formatLocation = (loc?: { name?: string; uf?: string } | string): string => {
  if (!loc) return "Brasil";
  if (typeof loc === "string") return loc;
  return `${loc.name || ""}${loc.uf ? `, ${loc.uf}` : ""}`;
};

const fallbackWeather: WeatherAPIData = {
  location: "Brasil • Região Centro-Oeste",
  current: { temp: 28, condition: "Parcialmente nublado", temp_max: 32, temp_min: 22 },
  forecast: [{ rain_prob: 20, condition: "parcialmente nublado" }],
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await apiFetch<WeatherAPIData>("/api/weather");
        setWeather(data);
      } catch (error) {
        console.warn("[Farol] Weather fetch failed, using fallback:", error);
        setWeather(fallbackWeather);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Extract values — handle both nested (current) and flat shapes
  const temp = weather?.current?.temp ?? weather?.temperature ?? "--";
  const condition = weather?.current?.condition ?? weather?.condition ?? "";
  const maxTemp = weather?.current?.temp_max ?? weather?.max_temp ?? "--";
  const minTemp = weather?.current?.temp_min ?? weather?.min_temp ?? "--";
  const rainChance = weather?.forecast?.[0]?.rain_prob ?? weather?.rain_chance ?? "--";

  const getIcon = () => {
    const c = String(condition).toLowerCase();
    if (c.includes("chuva") || c.includes("rain")) return CloudRain;
    if (c.includes("nublado") || c.includes("cloud") || c.includes("nuvens")) return CloudSun;
    if (c.includes("sol") || c.includes("sun") || c.includes("claro")) return Sun;
    return CloudSun;
  };

  const Icon = getIcon();

  return (
    <div className="farol-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Cloud className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-semibold text-foreground">Clima</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <>
          <div className="text-center py-4">
            <Icon className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">
              {temp}°C
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {condition}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLocation(weather?.location)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              🌡️ Máx: {maxTemp}°C • Mín: {minTemp}°C
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              💧 Chance de chuva: {rainChance}%
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherWidget;
