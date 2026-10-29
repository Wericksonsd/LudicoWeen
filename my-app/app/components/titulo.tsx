'use client'

import { useState } from "react"

type Props = {
    titulo: string
    subTitulo: string
    hiddenVar: boolean
    helpTExt: string
}

export default function Titulo(Props: Props) {

    const [modalTips, setModalTips] = useState(false)       
    return (
        <div className="w-full flex relative">
            <div className="w-full flex flex-col items-center justify-between ">
                <h1 className="text-2xl font-bold text-center">{Props.titulo}</h1>
                <p className="text-center text-zinc-300 text-sm mb-4">
                    {Props.subTitulo}
                </p>
            </div>
            <button className={`h-6 w-6 p-1 flex items-center justify-center rounded-4xl border border-orange-300 absolute right-0 top-0`}
            onClick={() => setModalTips(!modalTips)}>
                ?
            </button>
            {modalTips && (
                <div className="fixed h-dvh w-dvw p-12 bg-zinc-900/80 z-10 top-0 left-0 flex items-center justify-center">
                    <div className="w-full bg-orange-300 rounded-lg p-4 flex flex-col gap-8 items-center justify-center text-zinc-900 font-semibold text-center">
                        <p>{Props.helpTExt}</p>
                        <button onClick={() => setModalTips(false)}
                        className="px-4 py-2 bg-zinc-950 text-orange-300 rounded-md">
                            ENTENDIDO
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}  