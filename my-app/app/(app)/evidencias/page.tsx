'use client'

import { useEffect, useState } from "react";
import Titulo from "../../components/titulo";
import { useJogador } from "../../context/JogadorContext";
import { salvarEvidencias } from "../../lib/jogador";
import { formatarTempo, useAgora } from "../../lib/useAgora";
import ModalEscolha from "./components/modal";

export default function Evidencias () {
    const { user, jogador } = useJogador()
    const [texto, setTexto] = useState(jogador?.progresso.evidencias.texto ?? "")
    const salvo = jogador?.progresso.evidencias.texto ?? ""

    const [modalAberto, setModalAberto] = useState(false)
    const agora = useAgora()
    const captura = jogador?.progresso.captura
    const restante = Math.max(0, (captura?.bloqueadoAte ?? 0) - agora)
    const bloqueado = restante > 0 && captura?.status === "aguardando"

    let rotuloBotao = "CAPTURAR ENTIDADE"
    if (captura?.status === "capturado") rotuloBotao = "ENTIDADE CAPTURADA"
    else if (captura?.status === "fracassado") rotuloBotao = "MISSÃO FRACASSADA"
    else if (bloqueado) rotuloBotao = `AGUARDE ${formatarTempo(restante)}`

    // salva automaticamente 800 ms depois da última digitação
    useEffect(() => {
        if (!user || texto === salvo) return
        const t = setTimeout(() => {
            salvarEvidencias(user.uid, texto).catch(console.error)
        }, 800)
        return () => clearTimeout(t)
    }, [texto, salvo, user])

    return(
        <div className="flex-1 flex flex-col px-6 py-4 gap-4">
            <Titulo
            titulo="Evidências"
            subTitulo="Armazene as informações coletadas e tente capturar a entidade."
            hiddenVar={true}
            helpTExt="Após utilizar as ferramentas, você poderá anotar as informações coletadas aqui, e assim que se sentir confiante em tentar descobrir qual entidade está caçando, abra a caixa de seleção, o selecione e confirme, aguarde o resultado e em caso de acerto, dirija-se a entrada do evento para participar do sorteio."/>
            <div className="h-92"
            style={{backgroundImage: "url('/folha.png')", backgroundSize: "cover", backgroundPosition: "center"}}>
                <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Anote suas evidências aqui..."
                    className="w-full h-full resize-none bg-transparent p-6 text-zinc-900 outline-none placeholder:text-zinc-600"
                />
            </div>
            <div className="flex-1"></div>
            <button type="button" onClick={() => setModalAberto(true)} disabled={bloqueado}
                className="h-16 bg-amber-500 w-full text-zinc-950 font-bold disabled:opacity-60">
                {rotuloBotao}
            </button>

            {modalAberto && <ModalEscolha onClose={() => setModalAberto(false)} />}
        </div>
    )
}
