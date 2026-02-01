import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSun, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WeatherAPIResponse {
  location?: string;
  temperature?: number | string;
  condition?: string;
  max_temp?: number | string;
  min_temp?: number | string;
  rain_chance?: number | string;
  icon?: string;
}

// Fallback data when API fails
const fallbackWeather: WeatherAPIResponse = {
  location: "Brasil • Região Centro-Oeste",
  temperature: 28,
  condition: "Parcialmente nublado",
  max_temp: 32,
  min_temp: 22,
  rain_chance: 20,
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await apiFetch<WeatherAPIResponse>("/api/weather");
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

  const weatherIcons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    partlyCloudy: CloudSun,
  };

  // Map condition to icon
  const getIcon = () => {
    const condition = weather?.condition?.toLowerCase() || "";
    if (condition.includes("chuva") || condition.includes("rain")) return CloudRain;
    if (condition.includes("nublado") || condition.includes("cloud")) return CloudSun;
    if (condition.includes("sol") || condition.includes("sun") || condition.includes("claro")) return Sun;
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
          {/* Weather content */}
          <div className="text-center py-4">
            <Icon className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">
              {weather?.temperature}°C
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {weather?.condition}
            </p>
            <p className="text-xs text-muted-foreground">
              {weather?.location}
            </p>
          </div>

          {/* Forecast hint */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              🌡️ Máx: {weather?.max_temp}°C • Mín: {weather?.min_temp}°C
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              💧 Chance de chuva: {weather?.rain_chance}%
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherWidget;
