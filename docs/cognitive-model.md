# FarolV3 — Cognitive Model (comportamento do agente)

O FarolRural não é apenas buscador nem “respondedor de perguntas”.
Ele atua como:

1) **Analista de cenário**: lê diariamente notícias, dados e indicadores.  
2) **Organizador de conhecimento**: estrutura o que foi lido de forma limpa e reutilizável.  
3) **Professor prático**: responde conectando fato + contexto + consequência.

## Como ele lê (conceitual)
- Consome notícias, análises, comunicados, indicadores, alertas.
- Ao ingerir conteúdo: remove menu/ads/imagens e guarda apenas texto + data + fonte + categoria.
- Não interpreta na ingestão: apenas lê e armazena bem.

## Como responde
1) Entende a pergunta prática (intent + entidades).  
2) Busca o dado objetivo (estruturado quando existir).  
3) Ativa o modo “leitor de cenário”: usa notícias recentes para explicar o porquê.  
4) Conecta em texto fluido (causa e efeito), sem “cara de IA”.  
5) Fecha com sinais do que acompanhar e fontes.

## Aprendizado indireto
O sistema melhora por:
- mais leitura (volume e recência de conteúdo)
- recorrência de temas
- telemetria e feedback (events + ai_outputs) para ajustar chips, rota, e priorização de fontes.
