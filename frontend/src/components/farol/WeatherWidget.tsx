import { useEffect, useState, useRef, useCallback } from "react";
import { Cloud, Sun, CloudRain, CloudSun, Loader2, MapPin, ChevronDown, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { loadBrazilianCities, searchCities, type BRCity } from "@/lib/cities";

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

const STORAGE_KEY = "farol_weather_city";

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
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || "";
    }
    return "";
  });
  const [cityFilter, setCityFilter] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<BRCity[]>([]);
  const [allCities, setAllCities] = useState<BRCity[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load IBGE cities (cached in localStorage)
  useEffect(() => {
    loadBrazilianCities().then(setAllCities).catch(() => { });
  }, []);

  const fetchWeather = useCallback(async (city?: string) => {
    setIsLoading(true);
    try {
      const params = city ? `?city=${encodeURIComponent(city)}` : "";
      const data = await apiFetch<WeatherAPIData>(`/api/weather${params}`);
      setWeather(data);
    } catch (error) {
      console.warn("[Farol] Weather fetch failed, using fallback:", error);
      setWeather(fallbackWeather);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedCity || undefined);
  }, [selectedCity, fetchWeather]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCityPicker(false);
        setCityFilter("");
        setCitySuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (showCityPicker && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCityPicker]);

  // Update suggestions when filter changes
  useEffect(() => {
    if (cityFilter.trim().length >= 2 && allCities.length > 0) {
      setCitySuggestions(searchCities(allCities, cityFilter.trim(), 8));
    } else {
      setCitySuggestions([]);
    }
  }, [cityFilter, allCities]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    localStorage.setItem(STORAGE_KEY, cityName);
    setShowCityPicker(false);
    setCityFilter("");
    setCitySuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If suggestions exist, select the first one
      if (citySuggestions.length > 0) {
        const first = citySuggestions[0];
        handleCitySelect(`${first.name}, ${first.uf}`);
      } else if (cityFilter.trim().length >= 2) {
        handleCitySelect(cityFilter.trim());
      }
    }
    if (e.key === "Escape") {
      setShowCityPicker(false);
      setCityFilter("");
      setCitySuggestions([]);
    }
  };

  // Extract values
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
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground">Clima</h3>
        </div>
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
            <p className="text-sm text-muted-foreground mb-2">
              {condition}
            </p>

            {/* City location — clickable to change */}
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full px-3 py-1.5 hover:bg-muted/50"
                title="Alterar cidade"
              >
                <MapPin className="w-3 h-3" />
                <span>{formatLocation(weather?.location)}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCityPicker ? "rotate-180" : ""}`} />
              </button>

              {showCityPicker && (
                <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 w-64 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                  {/* Search input */}
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Digite sua cidade..."
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* City results */}
                  <div className="max-h-48 overflow-y-auto">
                    {citySuggestions.length > 0 ? (
                      citySuggestions.map((city) => (
                        <button
                          key={`${city.name}-${city.uf}`}
                          onClick={() => handleCitySelect(`${city.name}, ${city.uf}`)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors text-foreground flex items-center gap-2"
                        >
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{city.name}, <span className="text-muted-foreground">{city.uf}</span></span>
                        </button>
                      ))
                    ) : cityFilter.trim().length >= 2 ? (
                      <p className="px-4 py-3 text-xs text-muted-foreground text-center">
                        Nenhuma cidade encontrada
                      </p>
                    ) : (
                      <p className="px-4 py-3 text-xs text-muted-foreground text-center">
                        Digite o nome da cidade
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
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
