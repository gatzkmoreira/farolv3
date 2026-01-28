import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="py-12">
      <div className="farol-container">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full text-sm text-foreground font-medium mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              SEMANAGRO — a revista semanal do Olho no Agro
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Quer receber nossa revista semanal do agro?
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-8">
              Cadastre seu WhatsApp ou e-mail e receba gratuitamente notícias, informações, curiosidades e dados do agronegócio, de forma prática e fácil de acompanhar.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail ou WhatsApp"
                className="flex-1 h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
              <button
                type="submit"
                className="farol-btn-primary h-12 whitespace-nowrap"
              >
                Receber a SEMANAGRO
                <Send className="w-4 h-4 ml-2" />
              </button>
            </form>

            {/* Trust badge */}
            <p className="text-xs text-muted-foreground mt-6">
              📰 Curadoria Olho no Agro • Conteúdo semanal. Sem spam. Você pode sair quando quiser.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
