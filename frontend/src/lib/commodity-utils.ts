// Commodity utility functions and constants for SEO data pages

export interface CommodityMeta {
    slug: string;
    displayName: string;
    category: string;
    seoTitle: string;
    seoDescription: string;
}

// Priority commodities (highest search volume)
export const PRIORITY_COMMODITIES = ["soja", "milho", "boi_gordo", "cafe"] as const;

export const COMMODITY_MAP: Record<string, CommodityMeta> = {
    soja: {
        slug: "soja",
        displayName: "Soja",
        category: "graos",
        seoTitle: "Preço da Soja Hoje",
        seoDescription: "Cotação da soja hoje em todas as praças. Preços atualizados diariamente, variação diária e comparativo por estado.",
    },
    milho: {
        slug: "milho",
        displayName: "Milho",
        category: "graos",
        seoTitle: "Preço do Milho Hoje",
        seoDescription: "Cotação do milho hoje em todas as praças. Preços atualizados diariamente com variação e comparativo regional.",
    },
    boi_gordo: {
        slug: "boi_gordo",
        displayName: "Boi Gordo",
        category: "pecuaria",
        seoTitle: "Preço do Boi Gordo Hoje",
        seoDescription: "Cotação do boi gordo hoje (@/arroba). Preços à vista e a prazo por estado, variação diária e tendência.",
    },
    cafe: {
        slug: "cafe",
        displayName: "Café",
        category: "cafe",
        seoTitle: "Preço do Café Hoje",
        seoDescription: "Cotação do café arábica e robusta hoje. Preços por saca, variação diária e comparativo por praça.",
    },
    arroz: {
        slug: "arroz",
        displayName: "Arroz",
        category: "graos",
        seoTitle: "Preço do Arroz Hoje",
        seoDescription: "Cotação do arroz hoje. Preços atualizados diariamente por praça com variação e tendência.",
    },
    trigo: {
        slug: "trigo",
        displayName: "Trigo",
        category: "graos",
        seoTitle: "Preço do Trigo Hoje",
        seoDescription: "Cotação do trigo hoje em todas as praças. Preços atualizados com variação diária.",
    },
    algodao: {
        slug: "algodao",
        displayName: "Algodão",
        category: "graos",
        seoTitle: "Preço do Algodão Hoje",
        seoDescription: "Cotação do algodão hoje. Preço por arroba atualizado diariamente.",
    },
    feijao: {
        slug: "feijao",
        displayName: "Feijão",
        category: "graos",
        seoTitle: "Preço do Feijão Hoje",
        seoDescription: "Cotação do feijão hoje por tipo e praça. Preços atualizados com variação.",
    },
    cana_de_acucar: {
        slug: "cana_de_acucar",
        displayName: "Cana-de-açúcar",
        category: "energia",
        seoTitle: "Preço da Cana-de-açúcar Hoje",
        seoDescription: "Cotação da cana-de-açúcar hoje. ATR e preão por tonelada atualizados.",
    },
    acucar: {
        slug: "acucar",
        displayName: "Açúcar",
        category: "energia",
        seoTitle: "Preço do Açúcar Hoje",
        seoDescription: "Cotação do açúcar cristal e VHP hoje. Preços por saca atualizados diariamente.",
    },
    frango: {
        slug: "frango",
        displayName: "Frango",
        category: "pecuaria",
        seoTitle: "Preço do Frango Hoje",
        seoDescription: "Cotação do frango vivo e resfriado hoje. Preços atualizados por praça.",
    },
    suino: {
        slug: "suino",
        displayName: "Suíno",
        category: "pecuaria",
        seoTitle: "Preço do Suíno Hoje",
        seoDescription: "Cotação do suíno vivo hoje. Preço por kg atualizado diariamente.",
    },
    leite: {
        slug: "leite",
        displayName: "Leite",
        category: "pecuaria",
        seoTitle: "Preço do Leite Hoje",
        seoDescription: "Cotação do leite ao produtor hoje. Preço por litro atualizado.",
    },
    novilha_gorda: {
        slug: "novilha_gorda",
        displayName: "Novilha Gorda",
        category: "pecuaria",
        seoTitle: "Preço da Novilha Gorda Hoje",
        seoDescription: "Cotação da novilha gorda hoje (@/arroba). Preços à vista por estado.",
    },
    vaca_gorda: {
        slug: "vaca_gorda",
        displayName: "Vaca Gorda",
        category: "pecuaria",
        seoTitle: "Preço da Vaca Gorda Hoje",
        seoDescription: "Cotação da vaca gorda hoje (@/arroba). Preços à vista por estado.",
    },
    carne_bovina: {
        slug: "carne_bovina",
        displayName: "Carne Bovina",
        category: "pecuaria",
        seoTitle: "Preço da Carne Bovina Hoje",
        seoDescription: "Cotação da carne bovina atacado hoje. Preços por kg atualizados.",
    },
};

export const ALL_COMMODITY_SLUGS = Object.keys(COMMODITY_MAP);

export const UF_MAP: Record<string, string> = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
    BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
    GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
    MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
    PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
    SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

export function getCommodity(slug: string): CommodityMeta | undefined {
    return COMMODITY_MAP[slug];
}

export function isValidCommodity(slug: string): boolean {
    return slug in COMMODITY_MAP;
}

export function getUFName(uf: string): string {
    return UF_MAP[uf.toUpperCase()] ?? uf.toUpperCase();
}

/** Standard market unit per commodity + conversion factors from R$/kg */
export const UNIT_STANDARDS: Record<string, { unit: string; label: string; factor: number }> = {
    soja: { unit: "saca", label: "R$/saca 60kg", factor: 60 },
    milho: { unit: "saca", label: "R$/saca 60kg", factor: 60 },
    cafe: { unit: "saca", label: "R$/saca 60kg", factor: 60 },
    trigo: { unit: "saca", label: "R$/saca 60kg", factor: 60 },
    boi_gordo: { unit: "@", label: "R$/@", factor: 15 },
    vaca_gorda: { unit: "@", label: "R$/@", factor: 15 },
    novilha_gorda: { unit: "@", label: "R$/@", factor: 15 },
    algodao: { unit: "@", label: "R$/@", factor: 15 },
    frango: { unit: "kg", label: "R$/kg", factor: 1 },
    suino: { unit: "kg", label: "R$/kg", factor: 1 },
    leite: { unit: "litro", label: "R$/litro", factor: 1 },
    arroz: { unit: "kg", label: "R$/kg", factor: 1 },
    feijao: { unit: "kg", label: "R$/kg", factor: 1 },
    acucar: { unit: "kg", label: "R$/kg", factor: 1 },
    cana_de_acucar: { unit: "ton", label: "R$/ton", factor: 1000 },
    carne_bovina: { unit: "kg", label: "R$/kg", factor: 1 },
};

/** Normalize a price to the commodity's standard market unit */
export function normalizePrice(commodity: string, price: number, unit: string): number {
    const std = UNIT_STANDARDS[commodity];
    if (!std) return price;

    const u = unit.toLowerCase();

    // Already in standard unit?
    const stdAliases: Record<string, string[]> = {
        saca: ["saca", "sc", "r$/sc", "r$/saca", "r$/sc de 60 kg"],
        "@": ["@", "arroba", "r$/@"],
        kg: ["kg", "r$/kg"],
        litro: ["litro", "l", "r$/litro", "r$/l"],
        ton: ["ton", "t", "r$/ton"],
    };

    const isStandard = (stdAliases[std.unit] ?? []).some(a => u.includes(a));
    if (isStandard) return price;

    // If price is in R$/kg, convert to standard unit
    if (u.includes("kg") || u === "r$/kg") {
        return price * std.factor;
    }

    return price;
}

export function formatPrice(price: number | string): string {
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return "—";
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

export function formatChange(change: number | null): { text: string; positive: boolean } {
    if (change === null || change === undefined) return { text: "—", positive: true };
    const positive = change >= 0;
    return {
        text: (positive ? "+" : "") + change.toFixed(2).replace(".", ",") + "%",
        positive,
    };
}

export function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
