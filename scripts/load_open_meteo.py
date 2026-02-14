"""
Open-Meteo ERA5 Historical Weather Loader
Loads 10 years of daily weather data for 29 Brazilian agro cities.
Uses free Open-Meteo Archive API (no key required).

Usage:
  pip install httpx python-dotenv
  python scripts/load_open_meteo.py
"""

import httpx
import os
import json
import time
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://uvrvlesjgyimspdsghmw.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

ARCHIVE_API = "https://archive-api.open-meteo.com/v1/archive"
DAILY_VARS = "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code"

# 29 main agro cities (same as n8n workflow)
CITIES = [
    {"key": "sao-paulo-sp", "name": "São Paulo", "uf": "SP", "lat": -23.55, "lon": -46.63},
    {"key": "cuiaba-mt", "name": "Cuiabá", "uf": "MT", "lat": -15.60, "lon": -56.10},
    {"key": "sorriso-mt", "name": "Sorriso", "uf": "MT", "lat": -12.55, "lon": -55.71},
    {"key": "campo-grande-ms", "name": "Campo Grande", "uf": "MS", "lat": -20.44, "lon": -54.65},
    {"key": "goiania-go", "name": "Goiânia", "uf": "GO", "lat": -16.68, "lon": -49.25},
    {"key": "ribeirao-preto-sp", "name": "Ribeirão Preto", "uf": "SP", "lat": -21.17, "lon": -47.81},
    {"key": "londrina-pr", "name": "Londrina", "uf": "PR", "lat": -23.31, "lon": -51.16},
    {"key": "curitiba-pr", "name": "Curitiba", "uf": "PR", "lat": -25.43, "lon": -49.27},
    {"key": "uberaba-mg", "name": "Uberaba", "uf": "MG", "lat": -19.75, "lon": -47.93},
    {"key": "belo-horizonte-mg", "name": "Belo Horizonte", "uf": "MG", "lat": -19.92, "lon": -43.94},
    {"key": "rio-verde-go", "name": "Rio Verde", "uf": "GO", "lat": -17.80, "lon": -50.92},
    {"key": "sinop-mt", "name": "Sinop", "uf": "MT", "lat": -11.86, "lon": -55.50},
    {"key": "lucas-do-rio-verde-mt", "name": "Lucas do Rio Verde", "uf": "MT", "lat": -13.05, "lon": -55.91},
    {"key": "rondonopolis-mt", "name": "Rondonópolis", "uf": "MT", "lat": -16.47, "lon": -54.64},
    {"key": "dourados-ms", "name": "Dourados", "uf": "MS", "lat": -22.22, "lon": -54.81},
    {"key": "maringa-pr", "name": "Maringá", "uf": "PR", "lat": -23.42, "lon": -51.94},
    {"key": "chapeco-sc", "name": "Chapecó", "uf": "SC", "lat": -27.10, "lon": -52.62},
    {"key": "cascavel-pr", "name": "Cascavel", "uf": "PR", "lat": -24.96, "lon": -53.46},
    {"key": "porto-alegre-rs", "name": "Porto Alegre", "uf": "RS", "lat": -30.03, "lon": -51.23},
    {"key": "barreiras-ba", "name": "Barreiras", "uf": "BA", "lat": -12.15, "lon": -44.99},
    {"key": "luis-eduardo-magalhaes-ba", "name": "Luís Eduardo Magalhães", "uf": "BA", "lat": -12.10, "lon": -45.80},
    {"key": "palmas-to", "name": "Palmas", "uf": "TO", "lat": -10.24, "lon": -48.36},
    {"key": "balsas-ma", "name": "Balsas", "uf": "MA", "lat": -7.53, "lon": -46.04},
    {"key": "piracicaba-sp", "name": "Piracicaba", "uf": "SP", "lat": -22.73, "lon": -47.65},
    {"key": "campinas-sp", "name": "Campinas", "uf": "SP", "lat": -22.91, "lon": -47.06},
    {"key": "uberlandia-mg", "name": "Uberlândia", "uf": "MG", "lat": -18.92, "lon": -48.28},
    {"key": "patos-de-minas-mg", "name": "Patos de Minas", "uf": "MG", "lat": -18.58, "lon": -46.52},
    {"key": "rio-de-janeiro-rj", "name": "Rio de Janeiro", "uf": "RJ", "lat": -22.91, "lon": -43.17},
    {"key": "brasilia-df", "name": "Brasília", "uf": "DF", "lat": -15.79, "lon": -47.88},
]

BATCH_SIZE = 500


def fetch_history(city: dict, start: str, end: str) -> list[dict]:
    """Fetch daily weather from Open-Meteo Archive API."""
    params = {
        "latitude": city["lat"],
        "longitude": city["lon"],
        "start_date": start,
        "end_date": end,
        "daily": DAILY_VARS,
        "timezone": "America/Sao_Paulo",
    }

    resp = httpx.get(ARCHIVE_API, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    if not dates:
        return []

    rows = []
    for i, d in enumerate(dates):
        rows.append({
            "city_key": city["key"],
            "city_name": city["name"],
            "uf": city["uf"],
            "lat": city["lat"],
            "lon": city["lon"],
            "date": d,
            "temp_max": daily.get("temperature_2m_max", [None])[i],
            "temp_min": daily.get("temperature_2m_min", [None])[i],
            "temp_mean": daily.get("temperature_2m_mean", [None])[i],
            "precipitation": daily.get("precipitation_sum", [None])[i],
            "humidity_mean": daily.get("relative_humidity_2m_mean", [None])[i],
            "wind_speed_max": daily.get("wind_speed_10m_max", [None])[i],
            "weather_code": daily.get("weather_code", [None])[i],
        })
    return rows


def upsert_batch(rows: list[dict]):
    """Upsert rows to Supabase via REST API."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    url = f"{SUPABASE_URL}/rest/v1/weather_history"

    resp = httpx.post(url, headers=headers, json=rows, timeout=30)
    if resp.status_code not in (200, 201):
        print(f"  ⚠️  Upsert error: {resp.status_code} — {resp.text[:200]}")
    return resp.status_code


def main():
    if not SUPABASE_KEY:
        print("❌ SUPABASE_SERVICE_KEY not set. Add it to .env")
        return

    yesterday = (date.today() - timedelta(days=1)).isoformat()
    start_date = "2016-01-01"
    total_inserted = 0

    print(f"🌤️  Open-Meteo ERA5 Loader")
    print(f"   Period: {start_date} → {yesterday}")
    print(f"   Cities: {len(CITIES)}")
    print(f"   Target: ~{len(CITIES) * 3650:,} rows\n")

    for i, city in enumerate(CITIES, 1):
        print(f"[{i:2d}/{len(CITIES)}] {city['name']}, {city['uf']}...", end=" ", flush=True)

        try:
            rows = fetch_history(city, start_date, yesterday)
        except Exception as e:
            print(f"❌ fetch error: {e}")
            continue

        if not rows:
            print("⚠️  no data")
            continue

        # Upsert in batches
        inserted = 0
        for b in range(0, len(rows), BATCH_SIZE):
            batch = rows[b : b + BATCH_SIZE]
            status = upsert_batch(batch)
            if status in (200, 201):
                inserted += len(batch)

        total_inserted += inserted
        print(f"✅ {inserted:,} rows")

        # Small delay to be polite to the API
        time.sleep(0.3)

    print(f"\n🎉 Done! Total: {total_inserted:,} rows inserted")


if __name__ == "__main__":
    main()
