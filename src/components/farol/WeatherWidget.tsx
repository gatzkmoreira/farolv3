import { Cloud, Sun, CloudRain, CloudSun } from "lucide-react";

const WeatherWidget = () => {
  const weatherIcon = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    partlyCloudy: CloudSun,
  };

  const Icon = weatherIcon.partlyCloudy;

  return (
    <div className="farol-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Cloud className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-semibold text-foreground">Clima</h3>
      </div>

      {/* Weather content */}
      <div className="text-center py-4">
        <Icon className="w-12 h-12 text-secondary mx-auto mb-3" />
        <p className="text-3xl font-bold text-foreground mb-1">28°C</p>
        <p className="text-sm text-muted-foreground mb-1">Parcialmente nublado</p>
        <p className="text-xs text-muted-foreground">Brasil • Região Centro-Oeste</p>
      </div>

      {/* Forecast hint */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          🌡️ Máx: 32°C • Mín: 22°C
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          💧 Chance de chuva: 20%
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;
