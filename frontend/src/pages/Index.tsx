import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/farol/Header";
import AlertTicker from "@/components/farol/AlertTicker";
import SEO from "@/components/SEO";
import SearchHero from "@/components/farol/SearchHero";
import SummaryBlock from "@/components/farol/SummaryBlock";
import NewsGrid from "@/components/farol/NewsGrid";
import CotacoesPanel from "@/components/farol/CotacoesPanel";
import WeatherWidget from "@/components/farol/WeatherWidget";
import HotNews from "@/components/farol/HotNews";
import NewsCarousel from "@/components/farol/NewsCarousel";
import LoadingMessages from "@/components/farol/LoadingMessages";
import ClimateChart from "@/components/farol/ClimateChart";
import PriceChart from "@/components/farol/PriceChart";
import GenericChart from "@/components/farol/GenericChart";
import Newsletter from "@/components/farol/Newsletter";
import Footer from "@/components/farol/Footer";
import NewsDrawer from "@/components/farol/NewsDrawer";
import { apiFetch, trackEvent } from "@/lib/api";
import { getTurnstileToken } from "@/lib/turnstile";
import type { SearchResponse, ViewState, NewsCard, APISearchData } from "@/types/farol";
import { transformSearchResponse, transformCards } from "@/types/farol";

// Category mapping: chip text → card category slug
const TERM_TO_CATEGORY: Record<string, string[]> = {
  milho: ["graos"],
  soja: ["graos"],
  trigo: ["graos"],
  arroz: ["graos"],
  feijao: ["graos"],
  algodao: ["graos"],
  cafe: ["cafe"],
  boi: ["pecuaria_corte"],
  gado: ["pecuaria_corte"],
  carne: ["pecuaria_corte"],
  bovina: ["pecuaria_corte"],
  bovino: ["pecuaria_corte"],
  bezerro: ["pecuaria_corte"],
  novilho: ["pecuaria_corte"],
  pecuaria: ["pecuaria_corte"],
  abate: ["pecuaria_corte"],
  frigorifico: ["pecuaria_corte"],
  arroba: ["pecuaria_corte"],
  leite: ["pecuaria_leite"],
  suino: ["suinocultura"],
  porco: ["suinocultura"],
  frango: ["avicultura"],
  ave: ["avicultura"],
  hortifruti: ["hortifruti"],
  hortalica: ["hortifruti"],
  clima: ["clima"],
  tempo: ["clima"],
  mercado: ["mercado"],
  exportacao: ["mercado"],
};

function matchTermsToCategories(texts: string[]): string[] {
  const categories = new Set<string>();
  for (const text of texts) {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [term, cats] of Object.entries(TERM_TO_CATEGORY)) {
      if (normalized.includes(term)) {
        cats.forEach((c) => categories.add(c));
      }
    }
  }
  return Array.from(categories);
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedHotNews, setSelectedHotNews] = useState<NewsCard | null>(null);
  const [isHotNewsDrawerOpen, setIsHotNewsDrawerOpen] = useState(false);
  const [searchResetTrigger, setSearchResetTrigger] = useState(0);

  // ─── Centralized card fetch (single request for HotNews + NewsCarousel) ───
  const [allCards, setAllCards] = useState<NewsCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<unknown>("/api/cards?limit=20")
      .then((data) => {
        if (!cancelled) setAllCards(transformCards(data));
      })
      .catch((err) => {
        console.warn("[Index] cards fetch failed:", err);
        if (!cancelled) setAllCards([]);
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const hotNewsCards = allCards.slice(0, 3);
  const carouselCards = allCards.slice(3);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Live countdown ticker
  useEffect(() => {
    if (rateLimitCountdown <= 0) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (searchError?.includes("limite")) {
        setSearchError(null);
      }
      return;
    }

    countdownRef.current = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [rateLimitCountdown > 0]);

  const startRateLimitCountdown = useCallback((seconds: number) => {
    // Cap at 1 hour max
    const capped = Math.min(seconds, 3600);
    setRateLimitCountdown(capped);
  }, []);

  const handleSearch = async (query: string) => {
    setViewState("loading");
    setSearchError(null);

    try {
      const turnstileToken = await getTurnstileToken();

      const searchHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (turnstileToken) {
        searchHeaders["X-Turnstile-Token"] = turnstileToken;
      }

      // Fetch search answer
      const rawData = await apiFetch<APISearchData>("/api/search", {
        method: "POST",
        headers: searchHeaders,
        body: JSON.stringify({ query }),
      });

      const data = transformSearchResponse(rawData);

      // Fetch related cards: match chips + original query to categories
      const textsToMatch = [...(data.chips || []), query];
      const matchedCategories = matchTermsToCategories(textsToMatch);
      let cardsUrl = "/api/cards?limit=6";
      if (matchedCategories.length > 0) {
        cardsUrl += `&category=${matchedCategories[0]}`;
      }

      try {
        const rawCards = await apiFetch<unknown>(cardsUrl);
        data.cards = transformCards(rawCards);
      } catch {
        // If category filter returns nothing, fallback to recent cards
        try {
          const rawCards = await apiFetch<unknown>("/api/cards?limit=6");
          data.cards = transformCards(rawCards);
        } catch {
          data.cards = [];
        }
      }

      setSearchResponse(data);
      setViewState("results");

      trackEvent("search", { query });
    } catch (error) {
      console.error("[Farol] Search failed:", error);

      if (error instanceof Response || (error instanceof Error && error.message.includes("429"))) {
        // Try to extract retry_after from the response
        let retrySeconds = 3600; // default 1 hour
        try {
          const errBody = error instanceof Error ? JSON.parse(error.message.replace(/^[^{]*/, "")) : null;
          if (errBody?.error?.retry_after_seconds) {
            retrySeconds = errBody.error.retry_after_seconds;
          }
        } catch { /* use default */ }

        startRateLimitCountdown(retrySeconds);
        setSearchError(
          `Você atingiu o limite de 30 buscas por hora. O Farol Rural está em evolução — em breve esse limite será ampliado! 🚀`
        );
      } else if (error instanceof Error && error.message.includes("403")) {
        setSearchError("Verificação de segurança falhou. Recarregue a página e tente novamente.");
      } else {
        setSearchError("Não foi possível realizar a busca. Tente novamente.");
      }
      setViewState("idle");
    }
  };

  const handleChipClick = (chip: string) => {
    trackEvent("chip_click", { chip });
    handleSearch(chip);
  };

  const handleHotNewsClick = (card: NewsCard) => {
    setSelectedHotNews(card);
    setIsHotNewsDrawerOpen(true);
  };

  const handleGoHome = () => {
    setViewState("idle");
    setSearchResponse(null);
    setSearchError(null);
    setSearchResetTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/" />
      <Header onGoHome={handleGoHome} />
      <AlertTicker />

      {/* Hero Search */}
      <SearchHero
        onSearch={handleSearch}
        onChipClick={handleChipClick}
        isLoading={viewState === "loading"}
        resetTrigger={searchResetTrigger}
      />

      {/* Error State */}
      {searchError && (
        <section className="py-4">
          <div className="farol-container">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
              <p className="text-amber-800 font-medium mb-1">{searchError}</p>
              {rateLimitCountdown > 0 && (
                <p className="text-amber-600 text-sm mt-2">
                  Novas buscas disponíveis em{" "}
                  <span className="font-bold text-amber-800 tabular-nums">
                    {formatCountdown(rateLimitCountdown)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {viewState === "loading" && (
        <section className="py-6">
          <div className="farol-container">
            <LoadingMessages />
          </div>
        </section>
      )}

      {/* Results State */}
      {viewState === "results" && searchResponse && (
        <>
          <SummaryBlock
            markdown={searchResponse.answer_markdown}
            timingMs={searchResponse.timing_ms}
            sources={searchResponse.sources_used}
          >
            {searchResponse.intent === "clima" &&
              searchResponse.historyData &&
              searchResponse.historyData.length > 0 && (
                <ClimateChart data={searchResponse.historyData} />
              )}
            {searchResponse.intent === "cotacao" &&
              searchResponse.priceHistory &&
              searchResponse.priceHistory.length > 0 && (
                <PriceChart
                  priceHistory={searchResponse.priceHistory}
                  priceComparison={searchResponse.priceComparison}
                />
              )}
            {searchResponse.charts &&
              searchResponse.charts.length > 0 && (
                <GenericChart charts={searchResponse.charts} />
              )}
          </SummaryBlock>
          <NewsGrid
            cards={searchResponse.cards}
            chips={searchResponse.chips}
            onChipClick={handleChipClick}
          />
        </>
      )}

      {/* Idle State - Fixed blocks */}
      {viewState === "idle" && (
        <>
          {/* Dashboard panels */}
          <section className="py-6">
            <div className="farol-container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <HotNews cards={hotNewsCards} loading={cardsLoading} onCardClick={handleHotNewsClick} />
                </div>
                <div className="md:col-span-1">
                  <CotacoesPanel />
                </div>
                <div className="md:col-span-1">
                  <WeatherWidget />
                </div>
              </div>
            </div>
          </section>

          {/* News Carousel */}
          <NewsCarousel cards={carouselCards} loading={cardsLoading} />
        </>
      )}

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />

      {/* Hot News Drawer */}
      <NewsDrawer
        card={selectedHotNews}
        isOpen={isHotNewsDrawerOpen}
        onClose={() => setIsHotNewsDrawerOpen(false)}
      />
    </div>
  );
};

export default Index;
