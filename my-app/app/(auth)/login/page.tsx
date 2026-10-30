'use client'

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useJogador } from "../../context/JogadorContext"
import { entrar } from "../../lib/jogador"

export default function Login () {
    const router = useRouter()
    const { user, carregando } = useJogador()

    const [usuario, setUsuario] = useState("")
    const [erro, setErro] = useState("")

    // já entrou antes neste aparelho? vai direto para a central
    useEffect(() => {
        if (!carregando && user) router.replace("/central")
    }, [carregando, user, router])

    function enviar(e: FormEvent) {
        e.preventDefault()
        setErro("")
        try {
            entrar(usuario) // o efeito acima redireciona quando a sessão for criada
        } catch (err) {
            setErro(err instanceof Error ? err.message : "Não foi possível entrar.")
        }
    }

    return (
        <div className=" flex-1 w-full flex flex-col items-center justify-end gap-4 bg-[url(/bgQuadro.png)] bg-cover bg-zinc-900 bg-blend-multiply px-11 py-22">
            <h1 className="text-5xl font-bold">
                C.A.S.S.I.O
            </h1>
            <h3 className="text-center mb-6">
                Central de Análise de Seres Sobrenaturais e Investigação Oculta
            </h3>
            <form onSubmit={enviar} className="w-full bg-orange-300 rounded-lg p-4 text-zinc-900 flex flex-col gap-2">
                <label htmlFor="usuario" className="font-bold">
                    Agente:
                </label>
                <input id="usuario" type="text" autoComplete="username" autoCapitalize="none"
                    value={usuario} onChange={(e) => setUsuario(e.target.value)}
                    className="px-2 text-2xl focus:border-none outline-none" placeholder="Digite aqui"/>
                <hr className="border border-dashed"/>

                <p className="text-center leading-none mt-2">Digite o nome do agente para abrir o seu dossiê.</p>
                {erro && <p role="alert" className="text-center text-sm font-bold text-red-900">{erro}</p>}

                <button
                    className="w-full mt-2 py-4 flex items-center justify-center bg-red-950 rounded-sm text-orange-300 text-2xl font-bold"
                    type="submit">
                    INVESTIGAR CASO
                </button>
            </form>
        </div>
    )
}
