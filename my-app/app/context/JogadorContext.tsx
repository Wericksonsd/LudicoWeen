'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/firebase"
import fantasmas from "../dataBank/fantasmas.json"
import type { Fantasma } from "../dataBank/fantasmasType"
import {
    UID_LOCAL,
    USUARIO_ADMIN_LOCAL,
    assinarLocal,
    garantirJogador,
    lerDocumentoLocal,
    sairLocal,
    sessaoLocalAtiva,
    type Jogador,
} from "../lib/jogador"

export type Usuario = Pick<User, "uid" | "displayName" | "email">

const USUARIO_LOCAL: Usuario = { uid: UID_LOCAL, displayName: USUARIO_ADMIN_LOCAL, email: null }

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
    const [usuarioFirebase, setUsuarioFirebase] = useState<User | null>(null)
    const [sessaoLocal, setSessaoLocal] = useState(false)
    const [authPronto, setAuthPronto] = useState(false)
    const [docAtual, setDocAtual] = useState<{ uid: string; jogador: Jogador } | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const criando = useRef(false)

    // 1) sessão do Firebase Auth (persiste entre recarregamentos) + sessão local
    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            setUsuarioFirebase(u)
            setSessaoLocal(sessaoLocalAtiva())
            setAuthPronto(true)
        })
    }, [])

    useEffect(() => {
        return assinarLocal(() => setSessaoLocal(sessaoLocalAtiva()))
    }, [])

    const user: Usuario | null = sessaoLocal ? USUARIO_LOCAL : usuarioFirebase

    // 2) documento do agente em tempo real; cria + sorteia o monstro se ainda não existir
    useEffect(() => {
        if (!user) return
        const uid = user.uid

        if (uid === UID_LOCAL) {
            garantirJogador(user) // síncrono para o usuário local
            const ler = () => {
                const j = lerDocumentoLocal()
                if (j) setDocAtual({ uid, jogador: j })
            }
            ler()
            return assinarLocal(ler)
        }

        return onSnapshot(
            doc(db, "jogadores", uid),
            (snap) => {
                const dados = snap.data()
                const completo =
                    snap.exists() &&
                    typeof dados?.monstroId === "number" &&
                    typeof dados?.progresso === "object"

                if (completo) {
                    setDocAtual({ uid, jogador: dados as Jogador })
                    setErro(null)
                    return
                }

                if (criando.current) return
                criando.current = true
                garantirJogador(user)
                    .catch((e) => {
                        console.error(e)
                        setErro("Não foi possível carregar o seu dossiê. Tente novamente.")
                    })
                    .finally(() => {
                        criando.current = false
                    })
            },
            (e) => {
                console.error(e)
                setErro("Sem permissão ou sem conexão com o banco de dados.")
            },
        )
    }, [user])

    const jogador = user && docAtual?.uid === user.uid ? docAtual.jogador : null
    const monstro = jogador
        ? (fantasmas.fantasmas.find((f) => f.id === jogador.monstroId) ?? null)
        : null
    const carregando = !authPronto || (!!user && !jogador && !erro)

    async function sair() {
        sairLocal()
        await signOut(auth)
    }

    return (
        <JogadorContext.Provider value={{ user, jogador, monstro, carregando, erro, sair }}>
            {children}
        </JogadorContext.Provider>
    )
}

export const useJogador = () => useContext(JogadorContext)
