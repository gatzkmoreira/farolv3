import { useState } from "react";
import Header from "@/components/farol/Header";
import SearchHero from "@/components/farol/SearchHero";
import SummaryBlock from "@/components/farol/SummaryBlock";
import NewsGrid from "@/components/farol/NewsGrid";
import CotacoesPanel from "@/components/farol/CotacoesPanel";
import WeatherWidget from "@/components/farol/WeatherWidget";
import HotNews from "@/components/farol/HotNews";
import NewsCarousel from "@/components/farol/NewsCarousel";
import LoadingMessages from "@/components/farol/LoadingMessages";
import Newsletter from "@/components/farol/Newsletter";
import Footer from "@/components/farol/Footer";
import NewsDrawer from "@/components/farol/NewsDrawer";
import { apiFetch, trackEvent } from "@/lib/api";
import type { SearchResponse, ViewState, NewsCard } from "@/types/farol";

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedHotNews, setSelectedHotNews] = useState<NewsCard | null>(null);
  const [isHotNewsDrawerOpen, setIsHotNewsDrawerOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setViewState("loading");
    setSearchError(null);
    
    try {
      const data = await apiFetch<SearchResponse>("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      
      setSearchResponse(data);
      setViewState("results");
      
      // Track search event (fire and forget)
      trackEvent("search", { query });
    } catch (error) {
      console.error("[Farol] Search failed:", error);
      setSearchError("Não foi possível realizar a busca. Tente novamente.");
      setViewState("idle");
    }
  };

  const handleChipClick = (chip: string) => {
    // Track chip click (fire and forget)
    trackEvent("chip_click", { chip });
    handleSearch(chip);
  };

  const handleHotNewsClick = (card: NewsCard) => {
    setSelectedHotNews(card);
    setIsHotNewsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Search */}
      <SearchHero 
        onSearch={handleSearch}
        onChipClick={handleChipClick}
        isLoading={viewState === "loading"}
      />

      {/* Error State */}
      {searchError && (
        <section className="py-4">
          <div className="farol-container">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{searchError}</p>
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
          />
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
                  <HotNews onCardClick={handleHotNewsClick} />
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
          <NewsCarousel />
        </>
      )}

      {/* Removed: Evolution message section - now displayed as diagonal badge in SearchHero */}

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
