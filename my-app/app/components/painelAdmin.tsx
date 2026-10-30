'use client'

import { useState } from "react"
import dados from "../dataBank/fantasmas.json"
import { useJogador } from "../context/JogadorContext"
import { definirMonstro, resetarProgresso } from "../lib/jogador"

export default function PainelAdmin({ onClose }: { onClose: () => void }) {
    const { user, jogador } = useJogador()
    const [liberarTudo, setLiberarTudo] = useState(true)
    const [confirmando, setConfirmando] = useState(false)
    const [aviso, setAviso] = useState("")

    if (!user || !jogador) return null

    async function trocarMonstro(id: number) {
        try {
            await definirMonstro(user!.uid, id)
            setAviso(`Monstro definido: ${dados.fantasmas.find((f) => f.id === id)?.nome}`)
        } catch (e) {
            console.error(e)
            setAviso("Não foi possível trocar o monstro.")
        }
    }

    async function resetar() {
        try {
            await resetarProgresso(user!.uid, liberarTudo)
            setAviso("Progresso resetado.")
        } catch (e) {
            console.error(e)
            setAviso("Não foi possível resetar.")
        }
        setConfirmando(false)
    }

    return (
        <div className="fixed top-0 left-0 h-dvh w-dvw bg-zinc-900/80 z-20 p-6 flex items-center justify-center">
            <div className="max-h-full w-full bg-orange-300 text-zinc-900 rounded-lg p-4 flex flex-col gap-3 overflow-y-auto">
                <h1 className="text-center font-bold text-lg">PAINEL DO ADMINISTRADOR</h1>

                <label htmlFor="monstro" className="text-sm font-bold">Monstro deste agente:</label>
                <select id="monstro" value={jogador.monstroId}
                    onChange={(e) => trocarMonstro(Number(e.target.value))}
                    className="w-full p-2 rounded-md border-2 border-zinc-900 bg-orange-100">
                    {dados.fantasmas.map((f) => (
                        <option key={f.id} value={f.id}>{f.id} - {f.nome}</option>
                    ))}
                </select>

                <hr className="border border-dashed border-zinc-900"/>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={liberarTudo} onChange={(e) => setLiberarTudo(e.target.checked)} />
                    Começar com todas as ferramentas liberadas
                </label>

                {!confirmando ? (
                    <button type="button" onClick={() => setConfirmando(true)}
                        className="py-2 bg-red-950 text-orange-300 rounded-md font-bold">
                        RESETAR PROGRESSO
                    </button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-center text-sm font-bold">Apagar ferramentas, evidências e captura?</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setConfirmando(false)}
                                className="flex-1 py-2 border-2 border-zinc-900 rounded-md">
                                VOLTAR
                            </button>
                            <button type="button" onClick={resetar}
                                className="flex-1 py-2 bg-red-950 text-orange-300 rounded-md font-bold">
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                )}

                {aviso && <p role="status" className="text-center text-sm font-bold">{aviso}</p>}

                <button type="button" onClick={onClose}
                    className="py-2 bg-zinc-950 text-orange-300 rounded-md">
                    FECHAR
                </button>
            </div>
        </div>
    )
}
