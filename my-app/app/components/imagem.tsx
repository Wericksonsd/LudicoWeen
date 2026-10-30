'use client'

import Image, { type ImageProps } from "next/image"
import { ehRemota, urlImagem } from "../lib/imagens"

type Props = Omit<ImageProps, "src"> & { src: string }

/** <Image> que respeita app/lib/imagens.ts (public ou Drive). Imagens remotas não passam pelo otimizador do Next. */
export default function Imagem({ src, alt, ...resto }: Props) {
    const url = urlImagem(src)
    return <Image src={url} alt={alt} unoptimized={ehRemota(url)} {...resto} />
}
