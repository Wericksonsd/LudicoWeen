export type Fantasma = {
    id: number
    nome: string
    descricao: string
    regiao: string
    motivacao: string
    surgimento: string
    /** 5 pares [amplitude, altitude], um por círculo do leitor EMF; cada valor vai de -2 a 2 */
    emf: number[][]
    imagem: string
}
