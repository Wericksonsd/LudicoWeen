import type { User } from "firebase/auth"
import {
    FieldPath,
    doc,
    runTransaction,
    updateDoc,
    type DocumentData,
} from "firebase/firestore"
import { db } from "@/firebase"
import fantasmas from "../dataBank/fantasmas.json"
import ferramentas from "../dataBank/ferramentas.json"

/* ------------------------------------------------------------------ */
/* Modelo: um documento por agente em  jogadores/{uid}                 */
/* ------------------------------------------------------------------ */

export type ProgressoFerramenta = {
    liberada: boolean
    liberadaEm: number | null
    concluida: boolean
    concluidaEm: number | null
    /** estado livre da ferramenta (ex.: posição das barras do EMF) */
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
/* Usuário padrão local (não usa Firebase; dados ficam no navegador)   */
/* ------------------------------------------------------------------ */

export const USUARIO_ADMIN_LOCAL = "adminCassio"
export const SENHA_ADMIN_LOCAL = "adminCassio"
export const UID_LOCAL = "local-admin"
/** true = o admin local já começa com todas as ferramentas liberadas (facilita testes) */
const ADMIN_LOCAL_COMECA_LIBERADO = true

const CHAVE_DOC_LOCAL = "cassio:jogadorLocal"
const CHAVE_SESSAO_LOCAL = "cassio:sessaoLocal"
const EVENTO_LOCAL = "cassio:local"

function emitirLocal() {
    window.dispatchEvent(new Event(EVENTO_LOCAL))
}

export function sessaoLocalAtiva(): boolean {
    try {
        return localStorage.getItem(CHAVE_SESSAO_LOCAL) === "1"
    } catch {
        return false
    }
}

function lerJogadorLocal(): Jogador | null {
    try {
        const bruto = localStorage.getItem(CHAVE_DOC_LOCAL)
        return bruto ? (JSON.parse(bruto) as Jogador) : null
    } catch {
        return null
    }
}

function salvarJogadorLocal(j: Jogador) {
    localStorage.setItem(CHAVE_DOC_LOCAL, JSON.stringify(j))
    emitirLocal()
}

/** Avisa quando a sessão local ou o documento local mudam (mesma aba ou outra aba). */
export function assinarLocal(cb: () => void): () => void {
    window.addEventListener(EVENTO_LOCAL, cb)
    window.addEventListener("storage", cb)
    return () => {
        window.removeEventListener(EVENTO_LOCAL, cb)
        window.removeEventListener("storage", cb)
    }
}

export function lerDocumentoLocal(): Jogador | null {
    return lerJogadorLocal()
}

export function entrarAdminLocal() {
    localStorage.setItem(CHAVE_SESSAO_LOCAL, "1")
    emitirLocal()
}

/** Sai da sessão local, mas mantém o progresso salvo no navegador. */
export function sairLocal() {
    localStorage.removeItem(CHAVE_SESSAO_LOCAL)
    emitirLocal()
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const jogadorRef = (uid: string) => doc(db, "jogadores", uid)

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

function nomeDoUsuario(user: Pick<User, "displayName" | "email">): string {
    return user.displayName?.trim() || user.email?.split("@")[0] || "Agente"
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

/**
 * Atualização parcial por caminho (ex.: progresso.ferramentas.1.liberada).
 * No Firestore usa FieldPath (ids numéricos funcionam e o resto do objeto não é sobrescrito).
 */
async function atualizar(uid: string, pares: [string[], unknown][]) {
    if (uid === UID_LOCAL) {
        const j = lerJogadorLocal()
        if (!j) return
        const copia = JSON.parse(JSON.stringify(j)) as Record<string, unknown>
        for (const [caminho, valor] of pares) definirCaminho(copia, caminho, valor)
        salvarJogadorLocal(copia as unknown as Jogador)
        return
    }

    const [primeiro, ...resto] = pares
    await updateDoc(
        jogadorRef(uid),
        new FieldPath(...primeiro[0]),
        primeiro[1],
        ...resto.flatMap(([caminho, valor]) => [new FieldPath(...caminho), valor]),
    )
}

/* ------------------------------------------------------------------ */
/* Operações                                                           */
/* ------------------------------------------------------------------ */

/**
 * Cria o documento do agente no primeiro login e sorteia o monstro UMA única vez.
 * É idempotente: se já houver monstroId (de outro aparelho, ou pré-cadastrado
 * pela organização), ele é mantido. A transação evita dois sorteios simultâneos.
 */
export async function garantirJogador(user: Pick<User, "uid" | "displayName" | "email">) {
    if (user.uid === UID_LOCAL) {
        // execução síncrona (sem await antes), para o documento existir já na primeira leitura
        if (!lerJogadorLocal()) {
            salvarJogadorLocal({
                usuario: USUARIO_ADMIN_LOCAL,
                criadoEm: Date.now(),
                monstroId: sortearMonstroId(),
                progresso: progressoInicial(ADMIN_LOCAL_COMECA_LIBERADO),
            })
        }
        return
    }

    const ref = jogadorRef(user.uid)

    await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        const atual: DocumentData = snap.exists() ? snap.data() : {}

        const temMonstro = typeof atual.monstroId === "number"
        const temProgresso = typeof atual.progresso === "object" && atual.progresso !== null
        if (temMonstro && temProgresso) return

        tx.set(
            ref,
            {
                usuario: atual.usuario ?? nomeDoUsuario(user),
                criadoEm: atual.criadoEm ?? Date.now(),
                monstroId: temMonstro ? atual.monstroId : sortearMonstroId(),
                progresso: temProgresso ? atual.progresso : progressoInicial(),
            },
            { merge: true },
        )
    })
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
    if (uid === UID_LOCAL) {
        const j = lerJogadorLocal()
        if (!j) return { ok: false, motivo: "encerrada" }
        const { resultado, captura } = calcularCaptura(j, palpiteId, Date.now())
        if (captura) await atualizar(uid, [[["progresso", "captura"], captura]])
        return resultado
    }

    const ref = jogadorRef(uid)

    return runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        const { resultado, captura } = calcularCaptura(snap.data() as Jogador, palpiteId, Date.now())
        if (captura) tx.update(ref, new FieldPath("progresso", "captura"), captura)
        return resultado
    })
}
