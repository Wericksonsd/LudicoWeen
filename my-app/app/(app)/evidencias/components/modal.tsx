'use client'

import { useState } from "react"
import dados from "../../../dataBank/fantasmas.json"
import { useJogador } from "../../../context/JogadorContext"
import { tentarCapturar } from "../../../lib/jogador"
import { formatarTempo, useAgora } from "../../../lib/useAgora"

type Props = {
    onClose: () => void
}

export default function ModalEscolha ({ onClose }: Props) {
    const { user, jogador } = useJogador()
    const agora = useAgora()

    const [escolhido, setEscolhido] = useState<number | null>(null)
    const [confirmando, setConfirmando] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [erroEnvio, setErroEnvio] = useState("")

    const captura = jogador?.progresso.captura
    const capturado = captura?.status === "capturado"
    const fracassado = captura?.status === "fracassado"
    const restante = Math.max(0, (captura?.bloqueadoAte ?? 0) - agora)
    const bloqueado = restante > 0
    const encerrada = capturado || fracassado

    const nomeEscolhido = dados.fantasmas.find((f) => f.id === escolhido)?.nome

    async function confirmar() {
        if (!user || escolhido === null) return
        setErroEnvio("")
        setEnviando(true)
        try {
            // o resultado aparece sozinho: a captura é atualizada em tempo real no jogador
            await tentarCapturar(user.uid, escolhido)
        } catch (e) {
            console.error(e)
            setErroEnvio("Não foi possível enviar. Verifique a conexão e tente de novo.")
        } finally {
            setEnviando(false)
            setConfirmando(false)
        }
    }

    // mensagem de estado (derivada do que está salvo)
    let mensagem: string | null = null
    if (capturado) mensagem = "Entidade capturada! Dirija-se à entrada do evento para receber seu prêmio."
    else if (fracassado) mensagem = "Missão fracassada. Você errou a entidade duas vezes."
    else if (bloqueado) mensagem = `Entidade incorreta. Nova tentativa em ${formatarTempo(restante)}.`

    return(
        <div className="fixed top-0 left-0 h-dvh w-dvw bg-zinc-900/80 z-10 p-6 flex items-center justify-center">
            <div className="max-h-full w-full bg-orange-300 text-zinc-900 rounded-lg p-4 flex flex-col gap-3">
                <h1 className="text-center font-bold text-lg">CAPTURAR ENTIDADE</h1>

                {mensagem && (
                    <p role="status"
                        className={`text-center text-sm font-bold p-2 rounded-md ${capturado ? "bg-orange-800 text-zinc-100" : "bg-red-300 text-red-950"}`}>
                        {mensagem}
                    </p>
                )}

                {!encerrada && !confirmando && (
                    <>
                        <label htmlFor="entidade" className="text-center text-xs">
                            Selecione a entidade que você acredita estar caçando.
                        </label>
                        <select id="entidade" value={escolhido ?? ""} disabled={bloqueado || enviando}
                            onChange={(e) => setEscolhido(e.target.value ? Number(e.target.value) : null)}
                            className="w-full p-2 rounded-md border-2 border-zinc-900 bg-orange-100 disabled:opacity-50">
                            {dados.fantasmas.map((f) => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>
                        {erroEnvio && <p role="alert" className="text-center text-xs font-bold text-red-900">{erroEnvio}</p>}
                    </>
                )}

                {!encerrada && confirmando && (
                    <div className="text-center flex flex-col gap-1">
                        <p className="font-bold">Você tem certeza dessa escolha?</p>
                        <p className="text-sm">Entidade escolhida: <span className="font-bold">{nomeEscolhido}</span></p>
                        <p className="text-xs">Se estiver errada, você ficará 15 minutos sem poder tentar de novo.</p>
                    </div>
                )}

                <div className="flex gap-2">
                    {encerrada && (
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border-2 border-zinc-900 rounded-md">
                            ENTENDIDO
                        </button>
                    )}

                    {!encerrada && !confirmando && (
                        <>
                            <button type="button" onClick={onClose}
                                className="flex-1 py-2 border-2 border-zinc-900 rounded-md">
                                CANCELAR
                            </button>
                            <button type="button" onClick={() => setConfirmando(true)}
                                disabled={escolhido === null || bloqueado || enviando}
                                className="flex-1 py-2 bg-zinc-950 text-orange-300 rounded-md disabled:opacity-50">
                                ENVIAR
                            </button>
                        </>
                    )}

                    {!encerrada && confirmando && (
                        <>
                            <button type="button" onClick={() => setConfirmando(false)} disabled={enviando}
                                className="flex-1 py-2 border-2 border-zinc-900 rounded-md disabled:opacity-50">
                                VOLTAR
                            </button>
                            <button type="button" onClick={confirmar} disabled={enviando}
                                className="flex-1 py-2 bg-zinc-950 text-orange-300 rounded-md disabled:opacity-50">
                                {enviando ? "ENVIANDO..." : "CONFIRMAR"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
