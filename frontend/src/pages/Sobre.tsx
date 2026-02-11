import Header from "@/components/farol/Header";
import Footer from "@/components/farol/Footer";

const Sobre = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="py-10 md:py-16">
                <div className="farol-container max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Sobre o <span className="text-secondary">Farol</span>
                        <span className="text-accent">Rural</span>
                    </h1>
                    <p className="text-muted-foreground mb-10">O caminho do agro.</p>

                    {/* O que é */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">O que é o Farol Rural?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural é uma ferramenta de busca, criada para organizar e facilitar o acesso à informação relevante do agronegócio brasileiro.
                        </p>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            Diferente de um portal de notícias, o Farol Rural funciona como uma ferramenta de busca inteligente: o usuário faz uma pergunta, busca ou pesquisa e recebe um panorama objetivo, acompanhado de conteúdos de fontes confiáveis do setor.
                        </p>
                        <p className="text-foreground/85 leading-relaxed">
                            A tecnologia atua de forma discreta, ajudando a organizar e contextualizar a informação, sem substituir as fontes nem criar conteúdo próprio.
                        </p>
                    </section>

                    {/* Para quem */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Para quem o Farol Rural foi criado?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural foi pensado para quem precisa de informação clara, prática e confiável no dia a dia do agro, como:
                        </p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Produtores rurais",
                                "Técnicos e consultores",
                                "Estudantes e pesquisadores",
                                "Profissionais de empresas do setor",
                                "Pessoas interessadas em entender melhor o agronegócio",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted-foreground text-sm italic">
                            O foco é facilitar decisões, não gerar excesso de informação.
                        </p>
                    </section>

                    {/* Como funciona */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Como a ferramenta funciona?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">O funcionamento é simples:</p>
                        <ol className="space-y-3 mb-4">
                            {[
                                "Você digita uma pergunta, busca, pesquisa ou um tema na barra de busca",
                                "O sistema organiza o contexto da sua busca",
                                "Você recebe um resumo curto e objetivo",
                                "Abaixo, são exibidos conteúdos relacionados de fontes especializadas",
                                "Você pode aprofundar o tema clicando nos cards ou refinando a busca",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-foreground/85">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                        <p className="text-muted-foreground text-sm font-medium border-l-2 border-primary pl-4">
                            O Farol Rural não substitui as fontes. Ele organiza o caminho até elas.
                        </p>
                    </section>

                    {/* Objetivo */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Qual é o objetivo do Farol Rural?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            Além de ajudar o usuário, o Farol Rural tem um papel estratégico: entender quais temas o agro está buscando, quando e de que forma.
                        </p>
                        <p className="text-foreground/85 leading-relaxed">
                            As interações são analisadas de forma anônima e agregada, permitindo identificar tendências, interesses e mudanças de comportamento no setor. Essas leituras servem de base para relatórios e análises estratégicas, voltadas a empresas, instituições e organizações do agronegócio.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Sobre;
