import { Search } from "lucide-react";
import { useState } from "react";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  onChipClick: (chip: string) => void;
  isLoading: boolean;
}

const defaultChips = [
  "Boi gordo",
  "Soja",
  "Milho",
  "Café",
  "Clima",
  "Exportações",
];

const placeholders = [
  "Preço do boi hoje",
  "Clima para o milho em MT",
  "Exportações de carne para a China",
  "Cotação da soja em Chicago",
];

const SearchHero = ({ onSearch, onChipClick, isLoading }: SearchHeroProps) => {
  const [query, setQuery] = useState("");
  const [placeholderIndex] = useState(Math.floor(Math.random() * placeholders.length));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="py-8 md:py-14 bg-gradient-hero">
      <div className="farol-container">
        {/* Hero Text with stamp */}
        <div className="text-center mb-6 md:mb-8">
          {/* Logo with outline stamp positioned above */}
          <div className="relative inline-block">
            {/* Stamp badge - outline style, positioned above with spacing */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 -rotate-6">
              <span className="inline-block border border-accent/50 text-accent/70 text-[8px] font-semibold px-2 py-0.5 rounded-sm tracking-wider uppercase bg-transparent">
                Em evolução
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-1 mt-2">
              <span className="text-secondary">Farol</span>
              <span className="text-accent">Rural</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base font-medium tracking-wide">
            O caminho do agro
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
              placeholder={`Pesquise: ${placeholders[placeholderIndex]}`}
              className="farol-search-input"
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
                  Buscando...
                </span>
              ) : (
                "Pesquisar"
              )}
            </button>
          </div>
        </form>

        {/* Quick Chips */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {defaultChips.map((chip) => (
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
