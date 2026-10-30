export type Fantasma = {
    id: number
    nome: string
    descricao: string
    regiao: string
    motivacao: string
    surgimento: string
    /** 5 pares [amplitude, altitude], um por círculo do leitor EMF; cada valor vai de -3 a 3 */
    emf: number[][]
    /** 1 a 7 (1-2 presença baixa, 3-5 média, 6-7 alta); também escolhe a imagem de fundo da lanterna UV */
    uv: number
    agressao: string
    /** 3 relatos mostrados na ferramenta Relatos */
    textoRelato: string[]
    /** 1 a 3: conjunto de imagens do Resquício e "ligação" (1 Vingança, 2 Morte, 3 Tormento) */
    ordem: number
    imagem: string
}
