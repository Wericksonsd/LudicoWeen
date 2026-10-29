/**
 * O Firebase Auth exige e-mail + senha. Como o agente digita só o "usuário",
 * convertemos para um e-mail sintético: "João Silva" -> "joao.silva@cassio.local".
 * Ao cadastrar os jogadores no console do Firebase, use exatamente esse formato.
 * Se o usuário digitar um e-mail completo, ele é usado como está.
 */
export const DOMINIO_USUARIOS = "cassio.local"

export function usuarioParaEmail(usuario: string): string {
    const limpo = usuario.trim().toLowerCase()
    if (limpo.includes("@")) return limpo

    const slug = limpo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")

    return `${slug}@${DOMINIO_USUARIOS}`
}
