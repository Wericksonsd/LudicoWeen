'use client'

import { useState } from "react"
import Titulo from "../../../components/titulo"
import dados from "../../../dataBank/fantasmas.json"
import { useJogador } from "../../../context/JogadorContext"
import { useGuardaFerramenta } from "../../../lib/useGuardaFerramenta"

const QTD_RELATOS = 3

export default function Relatos() {
    useGuardaFerramenta(4)
    const { monstro } = useJogador()
    const [aberto, setAberto] = useState<number | null>(null)

    // os 3 textos vêm do monstro sorteado para o agente (textoRelato)
    const titulo = (monstro ?? dados.fantasmas[0]).tituloRelato
    const textos = (monstro ?? dados.fantasmas[0]).textoRelato

    return (
        <div className="flex-1 flex flex-col items-center p-6 gap-4">
            <Titulo
                titulo="Relatos"
                subTitulo="Relatos de testemunhas sobre a entidade."
                hiddenVar={true}
                helpTExt="Abra cada relato e leia com atenção. Procure padrões de comportamento que ajudem a descobrir qual entidade está caçando." />

            <div className="flex-1 w-full flex flex-col gap-4">
                {Array.from({ length: QTD_RELATOS }, (_, i) => (
                    <button key={i} type="button" onClick={() => setAberto(i)}
                        className="flex-1 rounded-2xl bg-zinc-300 text-zinc-900 font-bold uppercase text-lg">
                        Relato {i + 1}
                    </button>
                ))}
            </div>

            {aberto !== null && (
                <div className="fixed top-0 left-0 h-dvh w-dvw bg-zinc-900/80 z-10 p-6 flex items-center justify-center">
                    <div
                        className="max-h-full w-full h-auto rounded-lg p-6 flex flex-col gap-4 text-zinc-900 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(/relatos/jornal.png)` }}>
                        <h1 className="text-center text-xl font-black uppercase mb-4">Relato {aberto + 1}</h1>
                        <p className="m-auto text-xl font-bold">{titulo[aberto] ?? "..."}</p>
                        <p className="overflow-y-auto text-sm text-center leading-relaxed whitespace-pre-line mb-8">
                            {textos[aberto] ?? "..."}
                        </p>
                        <button type="button" onClick={() => setAberto(null)}
                            className="px-4 py-2 bg-zinc-950 text-orange-300 rounded-md self-center">
                            FECHAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
