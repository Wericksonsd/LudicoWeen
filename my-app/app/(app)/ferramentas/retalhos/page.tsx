'use client'

import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"

import { useRef, useState, type PointerEvent } from "react";
import dados from "../../../dataBank/fantasmas.json";
import Imagem from "../../../components/imagem";
import { useJogador } from "../../../context/JogadorContext";

type Disco = "azul" | "vermelho" | "verde"

// ordem das camadas (a última fica por cima)
const CAMADAS: { id: Disco; nome: string; prefixo: string; anel: string }[] = [
    { id: "azul", nome: "Azul", prefixo: "azul", anel: "ring-blue-800" },
    { id: "verde", nome: "Verde", prefixo: "verde", anel: "ring-green-600" },
    { id: "vermelho", nome: "Vermelho", prefixo: "verm", anel: "ring-red-800" },
]

// ordem dos botões
const BOTOES: { id: Disco; nome: string; cor: string }[] = [
    { id: "azul", nome: "Azul", cor: "bg-blue-800" },
    { id: "vermelho", nome: "Vermelho", cor: "bg-red-800" },
    { id: "verde", nome: "Verde", cor: "bg-green-600" },
]

const PASSO = 10 // graus por "encaixe" (igual aos 36 passos dos antigos sliders)

export default function Retalhos() {
    useGuardaFerramenta(3)
    const { monstro } = useJogador()

    // a "ordem" (1 a 3) do monstro escolhe o conjunto de imagens: azul-1/verde-1/verm-1, azul-2/...
    const ordem = (monstro ?? dados.fantasmas[0]).ordem

    const [atual, setAtual] = useState<Disco>("azul")
    const [rotacoes, setRotacoes] = useState<Record<Disco, number>>({ azul: 0, vermelho: 0, verde: 0 })

    const areaRef = useRef<HTMLDivElement>(null)
    // guarda de onde o arraste começou: ângulo do dedo e rotação do disco naquele momento
    const arraste = useRef<{ anguloInicial: number; rotacaoInicial: number } | null>(null)

    function anguloDoPonteiro(e: PointerEvent) {
        const caixa = areaRef.current!.getBoundingClientRect()
        const cx = caixa.left + caixa.width / 2
        const cy = caixa.top + caixa.height / 2
        return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
    }

    function iniciar(e: PointerEvent) {
        e.currentTarget.setPointerCapture(e.pointerId)
        arraste.current = { anguloInicial: anguloDoPonteiro(e), rotacaoInicial: rotacoes[atual] }
    }

    function mover(e: PointerEvent) {
        if (!arraste.current) return
        const { anguloInicial, rotacaoInicial } = arraste.current
        const bruto = rotacaoInicial + (anguloDoPonteiro(e) - anguloInicial)
        const encaixado = ((Math.round(bruto / PASSO) * PASSO) % 360 + 360) % 360
        setRotacoes((r) => (r[atual] === encaixado ? r : { ...r, [atual]: encaixado }))
    }

    function soltar() {
        arraste.current = null
    }

    const anelAtual = CAMADAS.find((d) => d.id === atual)!.anel

    return (
        <div className="flex-1 p-6 flex flex-col">
            <h1 className="text-2xl font-bold text-center">Resquícios</h1>
            <p className="text-center text-sm">Junte os pedaços de jornais para revelar seu passado.</p>
            <p className="text-center text-xs text-zinc-400">Escolha um disco e arraste o círculo para girá-lo.</p>

            <div
                ref={areaRef}
                onPointerDown={iniciar}
                onPointerMove={mover}
                onPointerUp={soltar}
                onPointerCancel={soltar}
                className={`w-full aspect-square bg-zinc-200 my-8 relative rounded-full ring-4 ${anelAtual} touch-none select-none cursor-grab active:cursor-grabbing`}>
                {CAMADAS.map((d) => (
                    <Imagem
                        key={d.id}
                        src={`/retalhos/${d.prefixo}-${ordem}.svg`} alt={d.nome} fill draggable={false}
                        className="opacity-75 pointer-events-none"
                        style={{ transform: `rotate(${rotacoes[d.id]}deg)` }} />
                ))}
            </div>

            <div className="w-full flex justify-between gap-3">
                {BOTOES.map((b) => (
                    <button key={b.id} type="button" onClick={() => setAtual(b.id)}
                        className={`flex-1 h-14 rounded-xl text-sm font-bold ${b.cor} ${atual === b.id ? "ring-4 ring-orange-300" : "opacity-70"}`}>
                        {b.nome}
                    </button>
                ))}
            </div>
        </div>
    );
}
