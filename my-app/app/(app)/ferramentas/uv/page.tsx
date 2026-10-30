'use client'

import { useRef, useState, type PointerEvent } from "react"
import Titulo from "../../../components/titulo"
import dados from "../../../dataBank/fantasmas.json"
import { useJogador } from "../../../context/JogadorContext"
import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"

/** tamanho da imagem de máscara em relação à largura do container (2.5 = 250%) */
const ESCALA_MASCARA = 2.5
const MASCARA = "/uv/mascara.png"

export default function UV() {
    useGuardaFerramenta(2)
    const { monstro } = useJogador()

    // o fundo depende da UV (1 a 7) do monstro sorteado: /uv/uv-1.png ... /uv/uv-7.png
    const uv = (monstro ?? dados.fantasmas[0]).uv
    const fundo = `/uv/uv-${uv}.png`
    const mascara = MASCARA

    // deslocamento da máscara (px) em relação ao centro do container
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const areaRef = useRef<HTMLDivElement>(null)
    const arraste = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

    function iniciar(e: PointerEvent) {
        e.currentTarget.setPointerCapture(e.pointerId)
        arraste.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
    }

    function mover(e: PointerEvent) {
        if (!arraste.current || !areaRef.current) return
        const caixa = areaRef.current.getBoundingClientRect()
        const { px, py, x, y } = arraste.current
        // o centro da lanterna pode ir até as bordas do container
        const limiteX = caixa.width / 2
        const limiteY = caixa.height / 2
        setPos({
            x: Math.max(-limiteX, Math.min(limiteX, x + (e.clientX - px))),
            y: Math.max(-limiteY, Math.min(limiteY, y + (e.clientY - py))),
        })
    }

    function soltar() {
        arraste.current = null
    }

    const posicao = `calc(50% + ${pos.x}px) calc(50% + ${pos.y}px)`
    const tamanho = `${ESCALA_MASCARA * 100}% auto`

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <Titulo
            titulo="Lanterna UV"
            subTitulo="Rastreio espectros plasmáticos deixados pelas entidades."
            hiddenVar={true}
            helpTExt={`Arraste a lanterna sobre a área para revelar os espectros registrados pela luz UV. Analise a cor e o número de espectros para determinar a agressividade da entidade.

            1-2 > BAIXA

            3-5 > MÉDIA

            6-7 > ALTA`}
            />
            <div
                ref={areaRef}
                onPointerDown={iniciar}
                onPointerMove={mover}
                onPointerUp={soltar}
                onPointerCancel={soltar}
                className="flex-1 w-full relative overflow-hidden rounded-md bg-zinc-950 touch-none select-none cursor-grab active:cursor-grabbing">
                {/* a imagem de fundo só aparece onde a máscara (a "luz") passa */}
                <div
                    className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                    style={{
                        backgroundImage: `url(${fundo})`,
                        maskImage: `url(${mascara})`,
                        WebkitMaskImage: `url(${mascara})`,
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskSize: tamanho,
                        WebkitMaskSize: tamanho,
                        maskPosition: posicao,
                        WebkitMaskPosition: posicao,
                    }}
                />
            </div>
        </div>
    )
}
