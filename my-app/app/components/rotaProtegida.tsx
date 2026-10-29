'use client'

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useJogador } from "../context/JogadorContext"

export default function RotaProtegida({ children }: { children: ReactNode }) {
    const { user, jogador, carregando, erro, sair } = useJogador()
    const router = useRouter()

    useEffect(() => {
        if (!carregando && !user) router.replace("/login")
    }, [carregando, user, router])

    if (erro) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <p>{erro}</p>
                <button
                    type="button"
                    className="px-4 py-2 bg-orange-300 text-zinc-950 rounded-md"
                    onClick={sair}
                >
                    SAIR
                </button>
            </div>
        )
    }

    if (carregando || !user || !jogador) {
        return (
            <div className="flex-1 flex items-center justify-center text-orange-300">
                Acessando arquivos...
            </div>
        )
    }

    return <>{children}</>
}
