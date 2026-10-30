import fantasmas from "../dataBank/fantasmas.json"
import ferramentas from "../dataBank/ferramentas.json"

/* ------------------------------------------------------------------ */
/* Sem autenticação: o agente entra só com o nome e todo o progresso   */
/* fica no localStorage do navegador (uma chave por nome de usuário).  */
/* ------------------------------------------------------------------ */

export type Usuario = {
    uid: string
    nome: string
    admin: boolean
}

export type ProgressoFerramenta = {
    liberada: boolean
    liberadaEm: number | null
    concluida: boolean
    concluidaEm: number | null
    /** estado livre da ferramenta (ex.: posição dos círculos do EMF) */
    dados: Record<string, unknown>
}

export type Tentativa = { palpiteId: number; acertou: boolean; em: number }

export type StatusCaptura = "em_andamento" | "aguardando" | "capturado" | "fracassado"

export type Captura = {
    status: StatusCaptura
    tentativas: Tentativa[]
    /** timestamp (ms) até quando o agente precisa esperar para tentar de novo */
    bloqueadoAte: number | null
}

export type Progresso = {
    /** chave = id da ferramenta (string) */
    ferramentas: Record<string, ProgressoFerramenta>
    evidencias: { texto: string; atualizadoEm: number | null }
    captura: Captura
}

export type Jogador = {
    usuario: string
    monstroId: number
    criadoEm: number
    progresso: Progresso
}

/* Regras da captura */
/** Use Infinity se quiser só o bloqueio de tempo, sem "missão fracassada" */
export const MAX_TENTATIVAS = 2
export const ESPERA_APOS_ERRO_MS = 15 * 60 * 1000

/* ------------------------------------------------------------------ */
/* Usuário administrador                                               */
/* ------------------------------------------------------------------ */

export const USUARIO_ADMIN = "adminCassio"
/** (mantém o progresso que o admin já tinha neste navegador) */
export const UID_ADMIN = "local-admin"
/** true = o admin já começa com todas as ferramentas liberadas (facilita testes) */
const ADMIN_COMECA_LIBERADO = true

const CHAVE_SESSAO = "cassio:sessao"
const EVENTO_LOCAL = "cassio:local"

/** chave do localStorage onde fica o progresso de cada usuário */
const chaveDocumento = (uid: string) =>
    uid === UID_ADMIN ? "cassio:jogadorLocal" : `cassio:jogador:${uid}`

function emitirLocal() {
    window.dispatchEvent(new Event(EVENTO_LOCAL))
}

/** Avisa quando a sessão ou o progresso mudam (mesma aba ou outra aba). */
export function assinarLocal(cb: () => void): () => void {
    window.addEventListener(EVENTO_LOCAL, cb)
    window.addEventListener("storage", cb)
    return () => {
        window.removeEventListener(EVENTO_LOCAL, cb)
        window.removeEventListener("storage", cb)
    }
}

/* ------------------------------------------------------------------ */
/* Sessão (login só com o nome)                                        */
/* ------------------------------------------------------------------ */

function normalizarNome(nome: string): string {
    return nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

/** Entra com o nome do agente. Lança Error com a mensagem a mostrar se o nome for inválido. */
export function entrar(nomeDigitado: string): void {
    const nome = nomeDigitado.trim().replace(/\s+/g, " ").slice(0, 40)
    if (nome.length < 2) throw new Error("Digite o nome do agente.")

    const slug = normalizarNome(nome)
    if (!slug) throw new Error("Nome inválido. Use letras ou números.")

    const admin = slug === normalizarNome(USUARIO_ADMIN)
    const sessao = admin
        ? { uid: UID_ADMIN, nome: USUARIO_ADMIN }
        : { uid: `u-${slug}`, nome }

    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    emitirLocal()
}

/** Encerra a sessão, mas mantém o progresso salvo no navegador. */
export function sair(): void {
    localStorage.removeItem(CHAVE_SESSAO)
    emitirLocal()
}

export function lerSessaoBruta(): string | null {
    try {
        return localStorage.getItem(CHAVE_SESSAO)
    } catch {
        return null
    }
}

export function interpretarSessao(bruto: string | null | undefined): Usuario | null {
    if (!bruto) return null
    try {
        const s = JSON.parse(bruto)
        if (typeof s?.uid === "string" && typeof s?.nome === "string") {
            return { uid: s.uid, nome: s.nome, admin: s.uid === UID_ADMIN }
        }
    } catch {
        /* sessão corrompida: trata como deslogado */
    }
    return null
}

/* ------------------------------------------------------------------ */
/* Leitura e escrita do progresso                                      */
/* ------------------------------------------------------------------ */

export function lerDocumentoBruto(uid: string): string | null {
    try {
        return localStorage.getItem(chaveDocumento(uid))
    } catch {
        return null
    }
}

export function interpretarDocumento(bruto: string | null | undefined): Jogador | null {
    if (!bruto) return null
    try {
        return JSON.parse(bruto) as Jogador
    } catch {
        return null
    }
}

const lerDocumento = (uid: string) => interpretarDocumento(lerDocumentoBruto(uid))

function salvarDocumento(uid: string, j: Jogador) {
    localStorage.setItem(chaveDocumento(uid), JSON.stringify(j))
    emitirLocal()
}

function progressoInicial(tudoLiberado = false): Progresso {
    const fs: Record<string, ProgressoFerramenta> = {}
    const agora = Date.now()
    for (const f of ferramentas.ferramentas) {
        fs[String(f.id)] = {
            liberada: tudoLiberado,
            liberadaEm: tudoLiberado ? agora : null,
            concluida: false,
            concluidaEm: null,
            dados: {},
        }
    }
    return {
        ferramentas: fs,
        evidencias: { texto: "", atualizadoEm: null },
        captura: { status: "em_andamento", tentativas: [], bloqueadoAte: null },
    }
}

function sortearMonstroId(): number {
    const ids = fantasmas.fantasmas.map((f) => f.id)
    return ids[Math.floor(Math.random() * ids.length)]
}

function definirCaminho(obj: Record<string, unknown>, caminho: string[], valor: unknown) {
    let atual = obj
    for (const chave of caminho.slice(0, -1)) {
        if (typeof atual[chave] !== "object" || atual[chave] === null) atual[chave] = {}
        atual = atual[chave] as Record<string, unknown>
    }
    atual[caminho[caminho.length - 1]] = valor
}

/** true quando todas as ferramentas do JSON estão liberadas para o agente */
export function todasFerramentasLiberadas(jogador: Jogador | null): boolean {
    if (!jogador) return false
    return ferramentas.ferramentas.every((f) => jogador.progresso.ferramentas[String(f.id)]?.liberada)
}

/** Atualização parcial por caminho (ex.: ["progresso","ferramentas","1","liberada"]). */
async function atualizar(uid: string, pares: [string[], unknown][]) {
    const j = lerDocumento(uid)
    if (!j) throw new Error("Progresso do agente não encontrado.")
    const copia = JSON.parse(JSON.stringify(j)) as Record<string, unknown>
    for (const [caminho, valor] of pares) definirCaminho(copia, caminho, valor)
    salvarDocumento(uid, copia as unknown as Jogador)
}

/* ------------------------------------------------------------------ */
/* Operações                                                           */
/* ------------------------------------------------------------------ */

/**
 * Cria o progresso do agente no primeiro acesso neste aparelho e sorteia o monstro
 * UMA única vez. Se já existir, mantém o monstro e só completa o que faltar
 * (por exemplo, ferramentas novas adicionadas ao ferramentas.json).
 * Pode lançar erro se o navegador bloquear o localStorage (ex.: aba privada).
 */
export function garantirJogador(user: Pick<Usuario, "uid" | "nome">): void {
    const existente = lerDocumento(user.uid)
    const padrao = progressoInicial(user.uid === UID_ADMIN && ADMIN_COMECA_LIBERADO)

    if (!existente || typeof existente.monstroId !== "number" || typeof existente.progresso !== "object") {
        salvarDocumento(user.uid, {
            usuario: user.nome,
            criadoEm: existente?.criadoEm ?? Date.now(),
            monstroId: typeof existente?.monstroId === "number" ? existente.monstroId : sortearMonstroId(),
            progresso: padrao,
        })
        return
    }

    // completa ferramentas que ainda não existem no progresso salvo
    const faltando = Object.keys(padrao.ferramentas).filter((id) => !existente.progresso.ferramentas?.[id])
    if (faltando.length) {
        const ferramentasAtuais = { ...(existente.progresso.ferramentas ?? {}) }
        for (const id of faltando) ferramentasAtuais[id] = padrao.ferramentas[id]
        salvarDocumento(user.uid, {
            ...existente,
            progresso: { ...existente.progresso, ferramentas: ferramentasAtuais },
        })
    }
}

export async function liberarFerramenta(uid: string, ferramentaId: number) {
    const base = ["progresso", "ferramentas", String(ferramentaId)]
    await atualizar(uid, [
        [[...base, "liberada"], true],
        [[...base, "liberadaEm"], Date.now()],
    ])
}

export async function salvarDadosFerramenta(
    uid: string,
    ferramentaId: number,
    dados: Record<string, unknown>,
) {
    await atualizar(uid, [[["progresso", "ferramentas", String(ferramentaId), "dados"], dados]])
}

export async function concluirFerramenta(uid: string, ferramentaId: number) {
    const base = ["progresso", "ferramentas", String(ferramentaId)]
    await atualizar(uid, [
        [[...base, "concluida"], true],
        [[...base, "concluidaEm"], Date.now()],
    ])
}

export async function salvarEvidencias(uid: string, texto: string) {
    await atualizar(uid, [
        [["progresso", "evidencias", "texto"], texto],
        [["progresso", "evidencias", "atualizadoEm"], Date.now()],
    ])
}

/* ----- ações do administrador ----- */

function exigirAdmin(uid: string) {
    if (uid !== UID_ADMIN) throw new Error("Ação permitida só para o administrador.")
}

/** Define qual monstro o administrador recebe. */
export async function definirMonstro(uid: string, monstroId: number) {
    exigirAdmin(uid)
    await atualizar(uid, [[["monstroId"], monstroId]])
}

/** Zera o progresso do administrador (ferramentas, evidências e captura). O monstro atual é mantido. */
export async function resetarProgresso(uid: string, tudoLiberado: boolean) {
    exigirAdmin(uid)
    await atualizar(uid, [[["progresso"], progressoInicial(tudoLiberado)]])
}

/* ----- sair ----- */

/** Missão concluída = o monstro atual foi capturado (missão fracassada NÃO conta). */
export function missaoConcluida(jogador: Jogador | null): boolean {
    return jogador?.progresso.captura.status === "capturado"
}

function sortearOutroMonstroId(atual: number): number {
    const outros = fantasmas.fantasmas.map((f) => f.id).filter((id) => id !== atual)
    return outros.length ? outros[Math.floor(Math.random() * outros.length)] : atual
}

/**
 * Botão de sair: se o agente já capturou o monstro atual, o progresso é resetado
 * (e ele recebe outro monstro, diferente do anterior) antes de sair; senão só sai.
 * O administrador não é resetado aqui (ele tem o botão próprio no painel).
 */
export function encerrarSessao(uid: string): void {
    if (uid !== UID_ADMIN) {
        try {
            const j = lerDocumento(uid)
            if (j && missaoConcluida(j)) {
                salvarDocumento(uid, {
                    ...j,
                    monstroId: sortearOutroMonstroId(j.monstroId),
                    progresso: progressoInicial(false),
                })
            }
        } catch (e) {
            console.error(e)
        }
    }
    sair()
}

/* ----- captura ----- */

export type ResultadoCaptura =
    | { ok: true; acertou: boolean; status: StatusCaptura }
    | { ok: false; motivo: "encerrada" | "aguardando"; bloqueadoAte?: number }

/** Regra pura da captura: decide o resultado e a nova captura a gravar. */
function calcularCaptura(
    jogador: Jogador,
    palpiteId: number,
    agora: number,
): { resultado: ResultadoCaptura; captura?: Captura } {
    const captura = jogador.progresso.captura

    if (captura.status === "capturado" || captura.status === "fracassado") {
        return { resultado: { ok: false, motivo: "encerrada" } }
    }
    if (captura.bloqueadoAte && agora < captura.bloqueadoAte) {
        return { resultado: { ok: false, motivo: "aguardando", bloqueadoAte: captura.bloqueadoAte } }
    }

    const acertou = palpiteId === jogador.monstroId
    const tentativas = [...captura.tentativas, { palpiteId, acertou, em: agora }]

    let status: StatusCaptura
    let bloqueadoAte: number | null = null
    if (acertou) {
        status = "capturado"
    } else if (tentativas.length >= MAX_TENTATIVAS) {
        status = "fracassado"
    } else {
        status = "aguardando"
        bloqueadoAte = agora + ESPERA_APOS_ERRO_MS
    }

    return {
        resultado: { ok: true, acertou, status },
        captura: { status, tentativas, bloqueadoAte },
    }
}

/**
 * Registra um palpite. Errou -> bloqueado por 15 min; com MAX_TENTATIVAS = 2,
 * a segunda falha encerra a missão (conforme a carta de introdução).
 */
export async function tentarCapturar(uid: string, palpiteId: number): Promise<ResultadoCaptura> {
    const j = lerDocumento(uid)
    if (!j) return { ok: false, motivo: "encerrada" }
    const { resultado, captura } = calcularCaptura(j, palpiteId, Date.now())
    if (captura) await atualizar(uid, [[["progresso", "captura"], captura]])
    return resultado
}
