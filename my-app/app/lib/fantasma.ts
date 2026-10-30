/** UV 1-2 = baixa, 3-5 = média, 6-7 = alta */
export function presencaPorUv(uv: number): string {
    if (uv <= 2) return "Baixa"
    if (uv <= 5) return "Média"
    return "Alta"
}

export const LIGACOES: Record<number, string> = {
    1: "Vingança",
    2: "Morte",
    3: "Tormento",
}

export function ligacaoPorOrdem(ordem: number): string {
    return LIGACOES[ordem] ?? "?"
}

export function capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}
