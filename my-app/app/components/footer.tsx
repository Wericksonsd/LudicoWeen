'use client'

import { BookOpenText, House, LucideIcon, Notebook, RobotVacuum } from "lucide-react";
import {useRouter, useSelectedLayoutSegments} from "next/navigation";

export default function Footer () {
    const router = useRouter()
    const itensMenu: { title: string; path: string; Icon: LucideIcon }[] = [
    { title: "CENTRAL", path: "/central", Icon: House },
    { title: "FERRAMENTAS", path: "/ferramentas", Icon: RobotVacuum },
    { title: "DOCUMENTOS", path: "/documentos", Icon: BookOpenText },
    { title: "EVIDENCIAS", path: "/evidencias", Icon: Notebook }
    ]
    
    return (
        <footer className="bg-zinc-950 w-full h-16 grid grid-cols-4 items-stretch justify-stretch">
            {itensMenu.map(({ title, path, Icon }) => (
                <button
                key={path}
                type="button"
                className="bg-orange-300 text-zinc-950 text-xs flex flex-col items-center justify-center gap-2"
                onClick={() => router.push(path)}>
                    <Icon size={18} />
                    <p>{title}</p>
                </button>
            ))}
        </footer>
    )
}