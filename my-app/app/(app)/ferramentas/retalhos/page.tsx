'use client'

import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";

type Disco = "azul" | "vermelho" | "verde"

const DISCOS: { id: Disco; nome: string; imagem: string; botao: string; anel: string }[] = [
    { id: "azul", nome: "Azul", imagem: "/retalhos/azul-1.svg", botao: "bg-blue-800", anel: "ring-blue-800" },
    { id: "vermelho", nome: "Vermelho", imagem: "/retalhos/verm-1.svg", botao: "bg-red-800", anel: "ring-red-800" },
    { id: "verde", nome: "Verde", imagem: "/retalhos/verde-1.svg", botao: "bg-green-600", anel: "ring-green-600" },
]

const PASSO = 10 // graus por "encaixe" (igual aos 36 passos dos antigos sliders)

export default function Retalhos() {
    useGuardaFerramenta(3)

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

    const discoAtual = DISCOS.find((d) => d.id === atual)!

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
                className={`w-full aspect-square bg-zinc-200 my-8 relative rounded-full ring-4 ${discoAtual.anel} touch-none select-none cursor-grab active:cursor-grabbing`}>
                {DISCOS.map((d) => (
                    <Image
                        key={d.id}
                        src={d.imagem} alt={d.nome} fill draggable={false}
                        className="opacity-75 pointer-events-none"
                        style={{ transform: `rotate(${rotacoes[d.id]}deg)` }} />
                ))}
            </div>

            <div className="w-full flex justify-between gap-3">
                {DISCOS.map((d) => (
                    <button key={d.id} type="button" onClick={() => setAtual(d.id)}
                        className={`flex-1 h-14 rounded-xl text-sm font-bold ${d.botao} ${atual === d.id ? "ring-4 ring-orange-300" : "opacity-70"}`}>
                        {d.nome}
                    </button>
                ))}
            </div>
        </div>
    );
}
