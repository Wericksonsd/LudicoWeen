'use client'

import { useEffect, useState } from "react"
import dados from "../../../dataBank/fantasmas.json"
import Titulo from "../../../components/titulo"
import { useJogador } from "../../../context/JogadorContext"
import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"
import { concluirFerramenta } from "../../../lib/jogador"

const QTD_CIRCULOS = 5
const MIN = -3
const MAX = 3
const VERDE = [22, 163, 74] // green-600
// até onde o ponto pode ir a partir do centro, em % do quadro (50 = encostaria na borda)
const ALCANCE_PCT = 45

/** valor (MIN..MAX) -> deslocamento em % a partir do centro (-ALCANCE_PCT..+ALCANCE_PCT) */
const paraPct = (valor: number) => (valor / MAX) * ALCANCE_PCT

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
     * Cor em degraus (não gradual):
     * nenhum eixo certo = verde; um eixo certo = 50% branco; os dois certos = 100% branco.
     */
    function brilho(i: number) {
        const [amp, alt] = valores[i]
        const [alvoAmp, alvoAlt] = alvos[i]
        return (amp === alvoAmp ? 0.5 : 0) + (alt === alvoAlt ? 0.5 : 0)
    }

    function corCirculo(i: number) {
        const b = brilho(i)
        const [r, g, bl] = VERDE.map((c) => Math.round(c + (255 - c) * b))
        return `rgb(${r}, ${g}, ${bl})`
    }

    // só o círculo selecionado recebe o novo valor (e, por isso, só ele se desloca)
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
                helpTExt="Escolha um dos 5 círculos pelos botões numerados e ajuste amplitude (horizontal) e altitude (vertical). O círculo se move enquanto você ajusta, com um valor certo ele fica meio branco e, com os dois certos, totalmente branco. Quando todos estiverem totalmente brancos, o sinal está sincronizado. Analise onde a maioria dos pontos se concentra e determine a agressividade do fantasma entre baixa, média e alta." />

            <div className="relative w-full aspect-square border-3 border-orange-300 rounded-md bg-center bg-cover"
                style={{ backgroundImage: "url('/fundoEMF.png')" }}>
                {Array.from({ length: QTD_CIRCULOS }, (_, i) => (
                    <button key={i} type="button" onClick={() => setAtual(i)} aria-label={`Círculo ${i + 1}`}
                        className="absolute w-4 h-4 rounded-full transition-[left,top,background-color] duration-200"
                        style={{
                            // todos começam no centro; amplitude move na horizontal e altitude na vertical (maior = mais para cima)
                            left: `${50 + paraPct(valores[i][0])}%`,
                            top: `${50 - paraPct(valores[i][1])}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: corCirculo(i),
                            // o ponto selecionado fica por cima dos outros (começam sobrepostos)
                            zIndex: atual === i ? 10 : 1,
                        }}>
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
                                {Array.from({ length: MAX - MIN + 1 }, (_, k) => <p key={k}>•</p>)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
