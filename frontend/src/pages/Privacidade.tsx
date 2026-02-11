import Header from "@/components/farol/Header";
import Footer from "@/components/farol/Footer";

const Privacidade = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="py-10 md:py-16">
                <div className="farol-container max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Política de Privacidade
                    </h1>
                    <p className="text-muted-foreground mb-10">
                        <span className="text-secondary">Farol</span>
                        <span className="text-accent">Rural</span>
                    </p>

                    {/* Uso sem cadastro */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Uso sem cadastro</h2>
                        <p className="text-foreground/85 leading-relaxed mb-2">
                            Você pode utilizar o Farol Rural livremente, sem criar conta e sem fornecer dados pessoais para realizar buscas.
                        </p>
                        <p className="text-foreground/85 leading-relaxed">
                            A navegação no site é aberta, simples e direta.
                        </p>
                    </section>

                    {/* Dados coletados */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Quais dados são coletados?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural coleta apenas dados anônimos e agregados, relacionados ao uso da ferramenta, como:
                        </p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Termos ou temas pesquisados",
                                "Interações com conteúdos (cliques em cards ou sugestões)",
                                "Sequência de navegação dentro da plataforma",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted-foreground text-sm italic">
                            Esses dados não identificam você como pessoa e não permitem a criação de perfis individuais.
                        </p>
                    </section>

                    {/* Utilização */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Para que esses dados são utilizados?</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            Os dados coletados são usados exclusivamente para:
                        </p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Melhorar a organização da informação no site",
                                "Entender quais temas despertam mais interesse no agro",
                                "Identificar tendências e padrões coletivos de busca",
                                "Gerar análises e relatórios estratégicos de forma agregada",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted-foreground text-sm font-medium border-l-2 border-primary pl-4">
                            O Farol Rural não vende dados brutos, não realiza monitoramento individual e não utiliza informações para direcionamento pessoal de conteúdo.
                        </p>
                    </section>

                    {/* Governança */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Governança de dados, ética e responsabilidade</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural foi desenvolvido com preocupação desde o início com governança de dados, ética e conformidade legal.
                        </p>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            A plataforma conta com profissional responsável pela área de proteção de dados, ética e governança, que atua na definição de regras, processos e limites relacionados ao uso das informações coletadas.
                        </p>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            Todas as decisões sobre:
                        </p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Quais dados são coletados",
                                "Como são armazenados",
                                "Como podem ser analisados",
                                "E quais usos são permitidos",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            são tomadas com base em boas práticas de proteção de dados, princípios éticos e respeito ao usuário.
                        </p>
                        <p className="text-muted-foreground text-sm italic">
                            O projeto não adota práticas de vigilância, perfilização individual ou exploração indevida de comportamento.
                        </p>
                    </section>

                    {/* LGPD */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Conformidade com a LGPD</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural segue os princípios da Lei Geral de Proteção de Dados (LGPD), incluindo:
                        </p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Anonimização dos dados",
                                "Coleta mínima necessária",
                                "Finalidade clara e legítima",
                                "Transparência no uso das informações",
                                "Segurança e responsabilidade no tratamento",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted-foreground text-sm font-medium border-l-2 border-primary pl-4">
                            Nenhuma informação pessoal é coletada sem consentimento explícito.
                        </p>
                    </section>

                    {/* Newsletter */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Newsletter SEMANAGRO</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            Caso você opte por se inscrever na SEMANAGRO, seu e-mail ou WhatsApp será utilizado exclusivamente para o envio do conteúdo semanal.
                        </p>
                        <p className="text-foreground/85 leading-relaxed mb-2">Esses dados:</p>
                        <ul className="space-y-2 mb-4 pl-1">
                            {[
                                "Não são compartilhados com terceiros",
                                "Não são usados para outros fins",
                                "Podem ser removidos a qualquer momento, mediante solicitação ou cancelamento",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-foreground/85">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Compromisso */}
                    <section className="mb-4">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Compromisso com o usuário</h2>
                        <p className="text-foreground/85 leading-relaxed mb-4">
                            O Farol Rural tem como princípio oferecer informação organizada, confiável e responsável, respeitando quem utiliza a plataforma.
                        </p>
                        <p className="text-foreground/85 leading-relaxed mb-4">Nosso compromisso é com:</p>
                        <div className="grid grid-cols-2 gap-3">
                            {["Transparência", "Ética", "Respeito à privacidade", "Uso consciente da tecnologia"].map((val) => (
                                <div key={val} className="flex items-center gap-2 text-foreground/85 bg-muted/50 rounded-lg px-4 py-3">
                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span className="text-sm font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacidade;
