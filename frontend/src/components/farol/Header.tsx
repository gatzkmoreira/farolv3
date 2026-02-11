import { Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="farol-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-secondary">Farol</span>
              <span className="text-xl font-bold text-accent">Rural</span>
            </div>
            <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 bg-green-light text-primary rounded-full font-medium">
              2.0
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/privacidade" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link to="/contato" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
