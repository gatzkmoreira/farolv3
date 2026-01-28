import { Lightbulb, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-12">
      <div className="farol-container">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-8 border-b border-primary-foreground/20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-foreground">Farol</span>
              <span className="text-secondary">Rural</span>
            </span>
          </a>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-6">
            <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Sobre
            </a>
            <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Semanagro
            </a>
            <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Contato
            </a>
          </nav>

          {/* Contact */}
          <a 
            href="mailto:contato@farolrural.com.br" 
            className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            contato@farolrural.com.br
          </a>
        </div>

        {/* Bottom */}
        <p className="text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Farol Rural — uma ferramenta da Solis Intelligence.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
