'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type QrScanner from "qr-scanner"
import Titulo from "../../components/titulo"
import dados from "../../dataBank/ferramentas.json"
import { useJogador } from "../../context/JogadorContext"
import { liberarFerramenta } from "../../lib/jogador"

type Resultado = {
    tipo: "ok" | "repetido" | "invalido" | "erro"
    mensagem: string
}

const COOLDOWN_MS = 3000

export default function CamQR () {
    const router = useRouter()
    const { user, jogador } = useJogador()

    const videoRef = useRef<HTMLVideoElement>(null)
    const processando = useRef(false)
    const ultimaLeitura = useRef<{ texto: string; em: number } | null>(null)

    const [resultado, setResultado] = useState<Resultado | null>(null)
    const [erroCamera, setErroCamera] = useState<string | null>(null)

    const tratarCodigo = useCallback(async (bruto: string) => {
        const texto = bruto.trim()
        const agora = Date.now()

        // ignora o mesmo código lido várias vezes seguidas (a câmera lê ~5x por segundo)
        const ultima = ultimaLeitura.current
        if (processando.current || (ultima && ultima.texto === texto && agora - ultima.em < COOLDOWN_MS)) return
        ultimaLeitura.current = { texto, em: agora }

        if (!user || !jogador) return

        const ferramenta = dados.ferramentas.find((f) => f.codigoQr === texto)
        if (!ferramenta) {
            setResultado({ tipo: "invalido", mensagem: "QR Code não reconhecido. Procure um código do evento." })
            return
        }

        if (jogador.progresso.ferramentas[String(ferramenta.id)]?.liberada) {
            setResultado({ tipo: "repetido", mensagem: `${ferramenta.nome} já está liberada.` })
            return
        }

        processando.current = true
        try {
            await liberarFerramenta(user.uid, ferramenta.id)
            setResultado({ tipo: "ok", mensagem: `Ferramenta liberada: ${ferramenta.nome}!` })
        } catch (e) {
            console.error(e)
            setResultado({ tipo: "erro", mensagem: "Não foi possível salvar. Verifique a conexão e tente de novo." })
        } finally {
            processando.current = false
        }
    }, [user, jogador])

    // o scanner é criado uma vez; a ref garante que ele sempre chame a versão mais recente do handler
    const handlerRef = useRef(tratarCodigo)
    useEffect(() => {
        handlerRef.current = tratarCodigo
    }, [tratarCodigo])

    useEffect(() => {
        let scanner: QrScanner | null = null
        let cancelado = false

        async function iniciar() {
            if (!window.isSecureContext) {
                setErroCamera("A câmera só funciona em HTTPS (ou localhost). Abra o app por um endereço seguro.")
                return
            }
            const { default: Scanner } = await import("qr-scanner")
            if (cancelado || !videoRef.current) return

            if (!(await Scanner.hasCamera())) {
                setErroCamera("Nenhuma câmera encontrada neste dispositivo.")
                return
            }

            scanner = new Scanner(videoRef.current, (r) => handlerRef.current(r.data), {
                preferredCamera: "environment",
                returnDetailedScanResult: true,
                highlightScanRegion: true,
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
            })

            try {
                await scanner.start()
            } catch {
                if (!cancelado) setErroCamera("Permita o acesso à câmera para escanear os QR Codes.")
            }
        }

        iniciar()

        return () => {
            cancelado = true
            scanner?.stop()
            scanner?.destroy()
        }
    }, [])

    const cores: Record<Resultado["tipo"], string> = {
        ok: "bg-green-300 text-green-950",
        repetido: "bg-zinc-300 text-zinc-900",
        invalido: "bg-red-300 text-red-950",
        erro: "bg-red-300 text-red-950",
    }

    return(
        <div className="flex-1 flex flex-col items-center gap-4 px-6 py-4 bg-zinc-800">
            <Titulo
                titulo="Liberar ferramenta"
                subTitulo="Aponte a câmera para o QR Code de uma ferramenta."
                hiddenVar={true}
                helpTExt="Os QR Codes estão espalhados pelo evento. Cada um libera uma ferramenta. Mantenha o código dentro do quadro e aguarde a leitura." />

            <div className="w-full flex-1 min-h-64 border-3 border-orange-300 rounded-md overflow-hidden bg-zinc-950 flex items-center justify-center relative">
                <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                {erroCamera && (
                    <p className="absolute inset-0 p-6 flex items-center justify-center text-center text-sm bg-zinc-950">
                        {erroCamera}
                    </p>
                )}
            </div>

            {resultado && (
                <div role="status" className={`w-full p-3 rounded-md text-center text-sm font-bold ${cores[resultado.tipo]}`}>
                    <p>{resultado.mensagem}</p>
                    {resultado.tipo === "ok" && (
                        <button type="button" onClick={() => router.push("/ferramentas")}
                            className="mt-2 px-4 py-2 bg-zinc-950 text-orange-300 rounded-md">
                            IR PARA FERRAMENTAS
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
