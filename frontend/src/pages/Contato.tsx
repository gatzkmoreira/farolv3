import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import Header from "@/components/farol/Header";
import Footer from "@/components/farol/Footer";
import SEO from "@/components/SEO";

const assuntos = [
    "Dúvida sobre a ferramenta",
    "Sugestão de melhoria",
    "Parceria ou negócio",
    "Reportar problema",
    "Outro",
];

const Contato = () => {
    const [nome, setNome] = useState("");
    const [contato, setContato] = useState("");
    const [assunto, setAssunto] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const contatoInfo = contato ? `\nContato: ${contato}` : "";
        const body = `Nome: ${nome}${contatoInfo}\nAssunto: ${assunto}\n\n${mensagem}`;
        const subject = `[FarolRural] ${assunto} — ${nome}`;

        const mailto = `mailto:contato@farolrural.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailto, "_blank");

        setEnviado(true);
        setTimeout(() => setEnviado(false), 5000);
    };

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Contato"
                description="Entre em contato com a equipe do Farol Rural. Dúvidas, sugestões, parcerias ou reportar problemas."
                path="/contato"
            />
            <Header />

            <main className="py-10 md:py-16">
                <div className="farol-container max-w-xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contato</h1>
                    <p className="text-muted-foreground mb-8">
                        Envie sua mensagem para a equipe do{" "}
                        <span className="text-secondary font-medium">Farol</span>
                        <span className="text-accent font-medium">Rural</span>.
                    </p>

                    {enviado ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">Mensagem preparada!</h2>
                            <p className="text-muted-foreground text-sm">
                                Seu cliente de email foi aberto com a mensagem. Basta enviar.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nome */}
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-foreground mb-1.5">
                                    Nome
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Email ou WhatsApp */}
                            <div>
                                <label htmlFor="contato" className="block text-sm font-medium text-foreground mb-1.5">
                                    E-mail ou WhatsApp
                                </label>
                                <input
                                    id="contato"
                                    type="text"
                                    required
                                    value={contato}
                                    onChange={(e) => setContato(e.target.value)}
                                    placeholder="E-mail ou número de WhatsApp"
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Assunto */}
                            <div>
                                <label htmlFor="assunto" className="block text-sm font-medium text-foreground mb-1.5">
                                    Sobre o que é o contato?
                                </label>
                                <select
                                    id="assunto"
                                    required
                                    value={assunto}
                                    onChange={(e) => setAssunto(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                >
                                    <option value="" disabled>Selecione um assunto</option>
                                    {assuntos.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mensagem */}
                            <div>
                                <label htmlFor="mensagem" className="block text-sm font-medium text-foreground mb-1.5">
                                    Mensagem
                                </label>
                                <textarea
                                    id="mensagem"
                                    required
                                    rows={5}
                                    value={mensagem}
                                    onChange={(e) => setMensagem(e.target.value)}
                                    placeholder="Escreva sua mensagem..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full farol-btn-primary flex items-center justify-center gap-2 py-3"
                            >
                                <Send className="w-4 h-4" />
                                Enviar mensagem
                            </button>

                            <p className="text-xs text-muted-foreground text-center">
                                A mensagem será aberta no seu cliente de email para envio direto.
                            </p>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contato;
