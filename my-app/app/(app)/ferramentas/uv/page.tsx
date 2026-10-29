'use client'

import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"

import Titulo from "../../../components/titulo"
import { useState } from "react"

export default function UV() {
    useGuardaFerramenta(2)
    const [rotationBtn, setRotationBtn] = useState(0)

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <Titulo
            titulo="Lanterna UV"
            subTitulo="Rastreio espectros plasmáticos deixados pelas entidades."
            hiddenVar = {true}
            helpTExt="Utilize o controle de cores para neutralizar os espectros registrados pela luz UV. Após neutralizado, análise a cor e número de espectros para determinar sua presença."
            />
            <div className="flex-1 w-full mask-[url(/fundo.svg)] mask-center mask-cover bg-amber-700 flex items-center justify-center ">
                <div className="h-24 w-24 bg-blue-700"
                style={{filter:`blur(${rotationBtn}px)`}}>
                    {rotationBtn}
                </div>
            </div>
            <div className="w-full flex">
                <div className="relative">
                    <div className="h-16 w-16 bg-zinc-600 rounded-4xl flex items-center justify-start p-2"
                        style={{ transform: `rotate(${rotationBtn*18}deg)`}}>
                        <div className="h-2 w-2 rounded-4xl bg-zinc-300">
                        </div>
                    </div>
                    <input type="range" id="rotacao" min={0} max={10} value={rotationBtn}
                    onChange={((e) => setRotationBtn(parseInt(e.target.value)))}
                    className="w-16 h-16 z-2 -translate-y-14 opacity-0 absolute"/>
                </div>
            </div>
        </div>
    )
}
            