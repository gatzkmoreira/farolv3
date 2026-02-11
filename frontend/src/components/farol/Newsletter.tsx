import { Lightbulb } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-12">
      <div className="farol-container">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ferramenta em Evolução
            </h2>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              O Farol Rural é uma ferramenta em evolução, construída para aprender com o agro brasileiro.
              A cada uso, novas fontes, dados e análises são incorporados, tornando as respostas mais completas, 
              úteis e conectadas à realidade do campo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
