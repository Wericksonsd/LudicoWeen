'use client'

import { useEffect, useState } from "react"
import dados from "../../../dataBank/fantasmas.json"
import Titulo from "../../../components/titulo"
import { useJogador } from "../../../context/JogadorContext"
import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"
import { concluirFerramenta } from "../../../lib/jogador"

const QTD_CIRCULOS = 5
const MIN = -2
const MAX = 2
const VERDE = [22, 163, 74] // green-600
const ROTULOS = [-2, -1, 0, 1, 2]

export default function Ferramentas() {
    useGuardaFerramenta(1)
    const { user, jogador, monstro } = useJogador()

    // [amplitude, altitude] de cada círculo; todos começam em 0
    const [valores, setValores] = useState<number[][]>(
        Array.from({ length: QTD_CIRCULOS }, () => [0, 0]),
    )
    const [atual, setAtual] = useState(0)

    // os valores corretos dependem do monstro sorteado para o agente
    const alvos = (monstro ?? dados.fantasmas[0]).emf
    const jaConcluida = !!jogador?.progresso.ferramentas["1"]?.concluida

    /**
     * Cada valor certo (amplitude e altitude) vale 50% de branco.
     * Quanto mais perto do valor certo, mais claro o círculo; os 2 exatos = branco total.
     */
    function brilho(i: number) {
        const [amp, alt] = valores[i]
        const [alvoAmp, alvoAlt] = alvos[i]
        const proximidade = (v: number, alvo: number) => {
            const distMax = Math.max(alvo - MIN, MAX - alvo)
            return 1 - Math.abs(v - alvo) / distMax
        }
        return (proximidade(amp, alvoAmp) + proximidade(alt, alvoAlt)) / 2
    }

    function corCirculo(i: number) {
        const b = brilho(i)
        const [r, g, bl] = VERDE.map((c) => Math.round(c + (255 - c) * b))
        return `rgb(${r}, ${g}, ${bl})`
    }

    function alterar(eixo: 0 | 1, valor: number) {
        setValores((anterior) =>
            anterior.map((par, i) => (i === atual ? (eixo === 0 ? [valor, par[1]] : [par[0], valor]) : par)),
        )
    }

    const todosCertos = valores.every((par, i) => par[0] === alvos[i][0] && par[1] === alvos[i][1])

    // quando os 5 círculos ficam brancos, grava a conclusão da ferramenta
    useEffect(() => {
        if (!user || jaConcluida || !todosCertos) return
        concluirFerramenta(user.uid, 1).catch(console.error)
    }, [todosCertos, user, jaConcluida])

    const sliders = [
        { rotulo: "AMPLITUDE", eixo: 0 as const },
        { rotulo: "ALTITUDE", eixo: 1 as const },
    ]

    return(
        <div className="flex-1 w-full flex flex-col items-center justify-between gap-3 px-6 py-2">
            <Titulo
                titulo="Leitor EMF"
                subTitulo="Leia e ajuste a frequência de campos eletromagnéticos"
                hiddenVar={false}
                helpTExt="Escolha um dos 5 círculos pelos botões numerados e ajuste amplitude e altitude. Quanto mais perto do valor certo, mais branco o círculo fica. Quando todos estiverem totalmente brancos, o sinal está sincronizado." />

            <div className="flex-1 w-full border-3 border-orange-300 rounded-md p-4 flex flex-wrap items-center justify-center content-center gap-6">
                {Array.from({ length: QTD_CIRCULOS }, (_, i) => (
                    <button key={i} type="button" onClick={() => setAtual(i)} aria-label={`Círculo ${i + 1}`}
                        className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-zinc-950/60 transition-colors`}
                        style={{ backgroundColor: corCirculo(i) }}>
                    </button>
                ))}
            </div>

            <div className="w-full flex items-center justify-center gap-3">
                {Array.from({ length: QTD_CIRCULOS }, (_, i) => (
                    <button key={i} type="button" onClick={() => setAtual(i)}
                        className={`w-10 h-10 rounded-lg border font-bold ${atual === i ? "bg-orange-300 text-zinc-950 border-orange-300" : "border-amber-100"}`}>
                        {i + 1}
                    </button>
                ))}
            </div>

            <div className="w-full flex items-center justify-center gap-2">
                <div className="grid grid-rows-2 gap-8 justify-items-end text-xs pb-4">
                    {sliders.map((s) => <p key={s.rotulo}>{s.rotulo}</p>)}
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    {sliders.map((s) => (
                        <div key={s.rotulo} className="w-full text-zinc-100 flex flex-col">
                            <input type="range" aria-label={s.rotulo} min={MIN} max={MAX} step={1}
                                value={valores[atual][s.eixo]}
                                onChange={(e) => alterar(s.eixo, parseInt(e.target.value))}
                                className="h-1 w-full"/>
                            <div className="w-full flex items-center justify-between text-sm">
                                <p>•</p>
                                <p>•</p>                                
                                <p>•</p>                                
                                <p>•</p>                                
                                <p>•</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
