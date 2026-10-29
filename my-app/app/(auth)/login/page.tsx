'use client'

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase"
import { useJogador } from "../../context/JogadorContext"
import { usuarioParaEmail } from "../../lib/auth"
import { SENHA_ADMIN_LOCAL, USUARIO_ADMIN_LOCAL, entrarAdminLocal, sairLocal } from "../../lib/jogador"

function mensagemErro(code: string) {
    switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-email":
            return "Usuário ou senha incorretos."
        case "auth/too-many-requests":
            return "Muitas tentativas. Aguarde um momento e tente de novo."
        case "auth/network-request-failed":
            return "Sem conexão. Verifique a internet."
        default:
            return "Não foi possível entrar. Tente novamente."
    }
}

export default function Login () {
    const router = useRouter()
    const { user, carregando } = useJogador()

    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)

    // já logado (sessão persistida)? vai direto para a central
    useEffect(() => {
        if (!carregando && user) router.replace("/central")
    }, [carregando, user, router])

    async function entrar(e: FormEvent) {
        e.preventDefault()
        if (!usuario.trim() || !senha) {
            setErro("Preencha usuário e senha.")
            return
        }
        setErro("")

        // usuário padrão local: não passa pelo Firebase (progresso salvo só neste navegador)
        if (usuario.trim() === USUARIO_ADMIN_LOCAL && senha === SENHA_ADMIN_LOCAL) {
            entrarAdminLocal()
            return
        }

        setEnviando(true)
        try {
            sairLocal()
            await signInWithEmailAndPassword(auth, usuarioParaEmail(usuario), senha)
            // o JogadorProvider cria o dossiê e sorteia o monstro no 1º acesso; o efeito acima redireciona
        } catch (err) {
            setErro(mensagemErro((err as { code?: string }).code ?? ""))
            setEnviando(false)
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
            <form onSubmit={entrar} className="w-full bg-orange-300 rounded-lg p-4 text-zinc-900 flex flex-col gap-2">
                <label htmlFor="usuario" className="font-bold">
                    Agente:
                </label>
                <input id="usuario" type="text" autoComplete="username" autoCapitalize="none"
                    value={usuario} onChange={(e) => setUsuario(e.target.value)}
                    className="px-2 text-2xl focus:border-none outline-none" placeholder="Digite aqui"/>
                <hr className="border border-dashed"/>

                <label htmlFor="senha" className="font-bold mt-2">
                    Senha:
                </label>
                <input id="senha" type="password" autoComplete="current-password"
                    value={senha} onChange={(e) => setSenha(e.target.value)}
                    className="px-2 text-2xl focus:border-none outline-none" placeholder="••••••"/>
                <hr className="border border-dashed"/>

                <p className="text-center leading-none mt-2">Utilize o mesmo usuário cadastrado no sistema do evento.</p>
                {erro && <p role="alert" className="text-center text-sm font-bold text-red-900">{erro}</p>}

                <button disabled={enviando}
                    className="w-full mt-2 py-4 flex items-center justify-center bg-red-950 rounded-sm text-orange-300 text-2xl font-bold disabled:opacity-60"
                    type="submit">
                    {enviando ? "ENTRANDO..." : "INVESTIGAR CASO"}
                </button>
            </form>
        </div>
    )
}
