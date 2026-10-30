'use client'
import {type Fantasma} from "../../../dataBank/fantasmasType"
import Image from "next/image"
import { capitalizar, ligacaoPorOrdem, presencaPorUv } from "../../../lib/fantasma"

type Props = {
    fantasmas: Fantasma
    /** false = só nome e descrição visíveis; o resto aparece como "?" e a imagem como bloqueada */
    liberado: boolean
}

export default function CardsFantasma({ fantasmas, liberado }: Props) {
    const info = (valor: string) => (liberado ? valor : "?")

    return(
        <div className="w-full flex-1 text-zinc-800 flex flex-col items-center justify-between rounded-lg pt-4"
            style={{backgroundImage: "url('/papiroBG2.png')", backgroundSize: "cover", backgroundPosition: "center"}}>
            <div className="w-full flex flex-col items-center justify-center px-4">
                <h1 className="text-lg font-black">{fantasmas.nome}</h1>
                <p className="text-sm text-center">{fantasmas.descricao}</p>
            </div>
            <div className="w-full flex items-center justify-center pr-2">
                <Image
                    src={liberado ? fantasmas.imagem : "/bloqueado.png"}
                    alt={liberado ? fantasmas.nome : "Imagem bloqueada"}
                    height={400} width={200} loading="eager" className="flex-1 mix-blend-multiply"/>
                <div className="text-right text-xs flex flex-col gap-2 px-4 pb-4 items-end">
                    <p><span className="font-bold">Região:</span> {info(fantasmas.regiao)}</p>
                    <p><span className="font-bold">Origem:</span> {info(fantasmas.surgimento)}</p>
                    <p><span className="font-bold">Motivação:</span> {info(fantasmas.motivacao)}</p>
                    <p><span className="font-bold">Presença:</span> {info(presencaPorUv(fantasmas.uv))}</p>
                    <p><span className="font-bold">Ligação:</span> {info(ligacaoPorOrdem(fantasmas.ordem))}</p>
                    <p><span className="font-bold">Agressividade:</span> {info(capitalizar(fantasmas.agressao))}</p>
                </div>
            </div>
        </div>
    )
}
