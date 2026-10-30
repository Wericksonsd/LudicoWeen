'use client'

import dados from "../../dataBank/ferramentas.json"
import CardsFerramentas from "./components/cards"
import { useJogador } from "../../context/JogadorContext"

export default function Ferramentas() {
    const { jogador } = useJogador()

    return(
        <div className="flex-1 flex flex-col px-6 py-4 bg-zinc-800">
            <h1 className="text-2xl font-bold text-center">FERRAMENTAS</h1>
            <p className="text-center text-zinc-300 text-sm mb-4">
                Selecione uma ferramenta para começar a investigar.
            </p>
            <div className="flex-1 grid gap-4 pb-2" style={{ gridTemplateRows: `repeat(${dados.ferramentas.length}, minmax(0, 1fr))` }}>
                {dados.ferramentas.map(f => (
                <CardsFerramentas
                    key={f.id}
                    ferramenta={f}
                    liberada={!!jogador?.progresso.ferramentas[String(f.id)]?.liberada} />
                ))}
            </div>
        </div>
    )
}
