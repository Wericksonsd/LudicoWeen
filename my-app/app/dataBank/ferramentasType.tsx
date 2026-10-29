import { Flashlight, KeyboardMusic, PanelTopBottomDashed, type LucideIcon } from "lucide-react"

export type Ferramenta = {
    id: number
    nome: string
    descricao: string
    /** texto gravado no QR Code que libera esta ferramenta (placeholder por enquanto) */
    codigoQr: string
    icon: string    
    linkTo: string
}

export const iconesFerramentas: Record<string, LucideIcon> = {
    PanelTopBottomDashed,
    Flashlight,
    KeyboardMusic,
}