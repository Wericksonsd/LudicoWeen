'use client'

import Link from "next/dist/client/link";
import { useRouter } from "next/navigation";
import { BookOpenText, Camera, RobotVacuum } from "lucide-react";
import { useState } from "react";
import ModalIntro from "./components/modalIntro";
import InfosTitulo from "./components/infosTituto";
import dadosFerramentas from "../../dataBank/ferramentas.json";
import { useJogador } from "../../context/JogadorContext";

export default function Central () {
    const { jogador } = useJogador();
    const ferramentas = Object.values(jogador?.progresso.ferramentas ?? {}).filter(f => f.liberada).length;
    const [documentos, setDocumentos] = useState(0);
    
    const [modalIntro, setModalIntro] = useState(false);

    const router = useRouter()

    const handleCloseModalIntro = () => {
        setModalIntro(modalIntro => !modalIntro);
    }

    return(
        <div className="flex-1 w-full flex flex-col items-center gap-4 px-6 py-4 bg-zinc-800">
            <InfosTitulo/>            
            <div className="w-full flex-1 py-6 px-2 bg-orange-300 rounded-xs text-center text-zinc-950 flex flex-col items-center justify-center gap-1" onClick={() => router.push("/cameraQRCode")}>
                <span className="p-2 border-2 border-dashed rounded-md">
                    <Camera size={36}/>
                </span>
                <h1>LIBERAR FERRAMENTA</h1>
                <p className="text-xs">Escaneie os QR Codes espalhados pelo evento para liberar as ferramentas.</p>
            </div>
            <div className="w-full flex gap-4">
                <Link href={"./ferramentas"} className="w-full bg-zinc-100 p-2 text-zinc-950 rounded-xs flex flex-col gap-1 items-center">
                    <RobotVacuum size={22}/>
                    <h1>FERRAMENTAS</h1>
                    <p className="text-[0.75rem]">{ferramentas}/{dadosFerramentas.ferramentas.length} Desbloqueadas</p>
                </Link>

                <Link href={"./documentos"} className="w-full bg-zinc-100 p-2 text-zinc-950 rounded-xs flex flex-col gap-1 items-center">
                    <BookOpenText size={22}/>
                    <h1>DOCUMENTOS</h1>
                    <p className="text-[0.75rem]">{documentos}/16 Desbloqueadas</p>
                </Link>
            </div>

            <button onClick={handleCloseModalIntro} className="w-full p-2 bg-zinc-950 text-orange-300 rounded-2">CARTA DE INTRODUÇÃO</button>    

            {modalIntro && (
                <ModalIntro onClose={handleCloseModalIntro} />
            )}

        </div>
    )
}