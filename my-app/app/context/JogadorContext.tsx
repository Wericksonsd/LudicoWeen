'use client'

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import fantasmas from "../dataBank/fantasmas.json"
import type { Fantasma } from "../dataBank/fantasmasType"
import {
    assinarLocal,
    garantirJogador,
    interpretarDocumento,
    interpretarSessao,
    lerDocumentoBruto,
    lerSessaoBruta,
    sair as sairDaSessao,
    type Jogador,
    type Usuario,
} from "../lib/jogador"

export type { Usuario }

type Contexto = {
    user: Usuario | null
    jogador: Jogador | null
    /** o monstro sorteado para este agente (a partir de jogador.monstroId) */
    monstro: Fantasma | null
    carregando: boolean
    erro: string | null
    sair: () => Promise<void>
}

const JogadorContext = createContext<Contexto>({
    user: null,
    jogador: null,
    monstro: null,
    carregando: true,
    erro: null,
    sair: async () => {},
})

export function JogadorProvider({ children }: { children: ReactNode }) {
    const [erro, setErro] = useState<string | null>(null)

    // sessão (undefined = ainda no servidor / antes de hidratar)
    const brutoSessao = useSyncExternalStore<string | null | undefined>(
        assinarLocal,
        lerSessaoBruta,
        () => undefined,
    )
    const pronto = brutoSessao !== undefined
    const user = useMemo(() => interpretarSessao(brutoSessao), [brutoSessao])

    // progresso do agente, sempre sincronizado com o localStorage (inclusive entre abas)
    const brutoDoc = useSyncExternalStore<string | null>(
        assinarLocal,
        () => (user ? lerDocumentoBruto(user.uid) : null),
        () => null,
    )
    const jogador = useMemo(() => interpretarDocumento(brutoDoc), [brutoDoc])

    // cria o progresso + sorteia o monstro no primeiro acesso (e completa ferramentas novas)
    useEffect(() => {
        if (!user) return
        try {
            garantirJogador(user)
        } catch (e) {
            console.error(e)
            setErro("Não foi possível salvar o progresso neste navegador. Saia da aba anônima e tente de novo.")
        }
    }, [user])

    const monstro = jogador
        ? (fantasmas.fantasmas.find((f) => f.id === jogador.monstroId) ?? null)
        : null
    const carregando = !pronto || (!!user && !jogador && !erro)

    async function sair() {
        sairDaSessao()
    }

    return (
        <JogadorContext.Provider value={{ user, jogador, monstro, carregando, erro, sair }}>
            {children}
        </JogadorContext.Provider>
    )
}

export const useJogador = () => useContext(JogadorContext)
