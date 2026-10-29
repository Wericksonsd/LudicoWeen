'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useJogador } from "../context/JogadorContext"

/** Chame no topo da página de uma ferramenta: se ela ainda não foi liberada por QR Code, volta para a lista. */
export function useGuardaFerramenta(ferramentaId: number) {
    const { jogador } = useJogador()
    const router = useRouter()
    const liberada = !!jogador?.progresso.ferramentas[String(ferramentaId)]?.liberada

    useEffect(() => {
        if (jogador && !liberada) router.replace("/ferramentas")
    }, [jogador, liberada, router])

    return liberada
}
