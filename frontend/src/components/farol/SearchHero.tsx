import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  onChipClick: (chip: string) => void;
  isLoading: boolean;
  resetTrigger?: number;
}

const defaultChips = [
  "Boi gordo",
  "Soja",
  "Milho",
  "Café",
  "Clima",
  "Exportações",
];

const placeholderTexts = [
  "Preço de soja Chicago",
  "Cotação do boi gordo hoje",
  "Previsão do tempo para minha região",
  "Milho B3 e mercado",
];

const SearchHero = ({ onSearch, onChipClick, isLoading, resetTrigger }: SearchHeroProps) => {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");

  // Clear query when parent triggers reset (home navigation)
  useEffect(() => {
    if (resetTrigger) setQuery("");
  }, [resetTrigger]);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for placeholder
  useEffect(() => {
    if (isFocused || query) return;

    const currentFullText = placeholderTexts[placeholderIndex];

    if (isTyping) {
      if (displayedPlaceholder.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentFullText.slice(0, displayedPlaceholder.length + 1));
        }, 60);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
        setIsTyping(true);
      }
    }
  }, [displayedPlaceholder, isTyping, placeholderIndex, isFocused, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="py-8 md:py-14 bg-gradient-hero">
      <div className="farol-container">
        {/* Hero Text with stamp - layout conforme print */}
        <div className="text-center mb-6 md:mb-8">
          <div className="relative inline-block">
            {/* Badge acima e à esquerda do nome */}
            <div className="absolute -top-5 left-0 -rotate-3">
              <span className="inline-block border border-muted-foreground/40 text-muted-foreground text-[10px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide bg-background/50">
                Ferramenta em evolução
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-1 mt-3">
              <span className="text-secondary">Farol</span>
              <span className="text-accent">Rural</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base font-medium tracking-wide">
            O caminho do agro.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused || query ? "Digite sua busca..." : `Pesquise: ${displayedPlaceholder}`}
              className="farol-search-input pr-14 md:pr-32"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 farol-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden md:inline">Buscando...</span>
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4 md:hidden" />
                  <span className="hidden md:inline">Pesquisar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Chips */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {(isMobile ? defaultChips.slice(0, 3) : defaultChips).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setQuery(chip);
                onChipClick(chip);
              }}
              disabled={isLoading}
              className="farol-chip hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchHero;
