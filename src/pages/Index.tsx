import { useState } from "react";
import Header from "@/components/farol/Header";
import SearchHero from "@/components/farol/SearchHero";
import SummaryBlock from "@/components/farol/SummaryBlock";
import NewsGrid from "@/components/farol/NewsGrid";
import CotacoesPanel from "@/components/farol/CotacoesPanel";
import WeatherWidget from "@/components/farol/WeatherWidget";
import HotNews from "@/components/farol/HotNews";
import NewsCarousel from "@/components/farol/NewsCarousel";
import LoadingSkeleton from "@/components/farol/LoadingSkeleton";
import Newsletter from "@/components/farol/Newsletter";
import Footer from "@/components/farol/Footer";
import NewsDrawer from "@/components/farol/NewsDrawer";
import type { SearchResponse, ViewState, NewsCard } from "@/types/farol";

// Mock response for demonstration
const mockSearchResponse: SearchResponse = {
  intent: "cotacao",
  answer_markdown: `## Cotação do Boi Gordo - 28 de Janeiro de 2026

O preço do boi gordo **subiu 0,73%** na última sessão, atingindo **R$ 315,50 por arroba** na média nacional.

### Principais destaques:

- **São Paulo:** R$ 318,00/@ (+0,8%)
- **Mato Grosso:** R$ 310,00/@ (+0,5%)
- **Goiás:** R$ 312,50/@ (+0,6%)

### Fatores de influência:

1. **Demanda aquecida** para exportação, especialmente para China
2. **Oferta restrita** devido ao período de entressafra
3. **Dólar em alta** favorecendo exportadores

### Perspectivas:

A tendência de curto prazo é de **manutenção dos preços** nos patamares atuais, com possível pressão de alta caso a demanda chinesa continue forte.

| Praça | Preço (R$/@) | Variação |
|-------|--------------|----------|
| SP Capital | 318,00 | +0,8% |
| Triângulo Mineiro | 315,00 | +0,7% |
| Sul de Goiás | 312,50 | +0,6% |`,
  chips: ["Boi Gordo SP", "Exportações de carne", "Arroba hoje", "Frigoríficos"],
  cards: [
    {
      id: "1",
      title: "Preço do boi gordo atinge maior patamar em 6 meses",
      description: "Demanda chinesa e oferta restrita impulsionam valorização da arroba no mercado brasileiro.",
      source: "Agronews",
      date: "28 jan 2026",
      category: "Boi",
      url: "#",
      summary_markdown: "O mercado de boi gordo brasileiro registrou forte valorização nesta terça-feira, com a arroba alcançando R$ 318,00 em São Paulo, maior patamar desde julho de 2025.\n\n**Principais fatores:**\n- Demanda aquecida da China\n- Oferta restrita no período de entressafra\n- Câmbio favorável para exportações"
    },
    {
      id: "2",
      title: "Exportações de carne bovina crescem 15% em janeiro",
      description: "China continua como principal destino, absorvendo 60% das exportações brasileiras.",
      source: "Portal do Agronegócio",
      date: "28 jan 2026",
      category: "Boi",
      url: "#"
    },
    {
      id: "3",
      title: "Frigoríficos aumentam abates para atender demanda",
      description: "Capacidade de processamento opera em nível máximo com demanda internacional.",
      source: "Safras & Mercado",
      date: "27 jan 2026",
      category: "Boi",
      url: "#"
    },
    {
      id: "4",
      title: "Pecuaristas otimistas com perspectivas para 2026",
      description: "Setor projeta ano positivo com preços sustentados e demanda global firme.",
      source: "SouAgro",
      date: "27 jan 2026",
      category: "Política & Mercado",
      url: "#"
    },
  ],
  sources_used: ["CEPEA/Esalq", "Scot Consultoria", "ABIEC", "IBGE"],
  timing_ms: 1247
};

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [selectedHotNews, setSelectedHotNews] = useState<NewsCard | null>(null);
  const [isHotNewsDrawerOpen, setIsHotNewsDrawerOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setViewState("loading");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSearchResponse(mockSearchResponse);
    setViewState("results");
  };

  const handleChipClick = (chip: string) => {
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

      {/* Loading State */}
      {viewState === "loading" && <LoadingSkeleton />}

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
          <section className="py-8">
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

      {/* Evolution message */}
      <section className="py-8 text-center">
        <div className="farol-container">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Ferramenta em evolução
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            O Farol Rural está em desenvolvimento para se tornar um buscador inteligente do agro.
            Cada busca contribui para tornar a ferramenta mais inteligente, precisa e útil ao agronegócio.
          </p>
        </div>
      </section>

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
