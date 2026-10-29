'use client'

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJogador } from "../context/JogadorContext";

export default function Header () {
    const router = useRouter();
    const { jogador, sair: sairSessao } = useJogador();

    async function sair() {
        await sairSessao();
        router.push("/login");
    }

    return (
        <header className="w-full py-3 px-6 bg-zinc-950 flex items-center gap-4  text-sm">
                <p className="flex-1"><span className="font-bold">Caso: </span>P1N467</p>
                <p><span className="font-bold">Agente: </span>{jogador?.usuario}</p>
                <button className="p-1 w-6 h-6 bg-orange-300 rounded-sm text-zinc-950"
                type="button"
                onClick={sair}
                ><LogOut size={16}/></button>
        </header>
    )
}
