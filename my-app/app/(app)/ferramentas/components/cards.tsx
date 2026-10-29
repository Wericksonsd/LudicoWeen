'use client'

import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { iconesFerramentas, type Ferramenta } from "../../../dataBank/ferramentasType"

type Props = {
    ferramenta: Ferramenta
    liberada?: boolean
}

export default function CardsFerramentas({ ferramenta, liberada = false }: Props) {
    const Icone = iconesFerramentas[ferramenta.icon]    
    const router = useRouter()

return (
    <div
    className={`h-full px-4 py-2 flex items-center justify-center rounded-2xl
        ${liberada ? "bg-zinc-300 text-zinc-900" : "bg-zinc-600 text-zinc-300"}`}
    >
        {liberada ? (
        <div  onClick={() => router.push(ferramenta.linkTo)}  className="h-full w-full flex items-center justify-center gap-4">
            <Icone size={48} />
            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="uppercase">{ferramenta.nome}</h1>
                <p className="text-[0.75rem] text-center">{ferramenta.descricao}</p>
            </div>
            </div>
        ) : (
            <div className="h-full w-full flex items-center justify-center gap-4">
                <Lock size={48} />
                <h1>FERRAMENTA BLOQUEADA</h1>
            </div>
        )}
    </div>
)
}