'use client'

import { useEffect, useState } from "react"

/** Relógio que atualiza a cada segundo (para contagens regressivas). */
export function useAgora(ativo = true) {
    const [agora, setAgora] = useState(() => Date.now())

    useEffect(() => {
        if (!ativo) return
        const t = setInterval(() => setAgora(Date.now()), 1000)
        return () => clearInterval(t)
    }, [ativo])

    return agora
}

/** 905000 -> "15:05" */
export function formatarTempo(ms: number): string {
    const total = Math.ceil(Math.max(0, ms) / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
