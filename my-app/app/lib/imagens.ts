/**
 * De onde as imagens são carregadas.
 *
 * Padrão: pasta public do projeto (caminhos como "/uv/uv-1.png").
 * Para puxar de outro lugar (Google Drive, CDN, Firebase Storage):
 *   1. suba o arquivo e deixe-o público ("qualquer pessoa com o link");
 *   2. troque COLE_O_ID_DO_ARQUIVO abaixo pelo ID do arquivo (a parte entre /d/ e /view no link de compartilhamento)
 *      ou coloque uma URL completa no lugar de driveUrl(...);
 *   3. mude USAR_IMAGENS_REMOTAS para true.
 * Arquivos cujo ID ainda é o placeholder continuam sendo carregados da pasta public.
 */
export const USAR_IMAGENS_REMOTAS = false

/** Formato de link direto do Google Drive (placeholder: ajuste se usar outro formato/host). */
export const driveUrl = (id: string) => `https://drive.google.com/uc?export=view&id=${id}`

const PLACEHOLDER = "COLE_O_ID_DO_ARQUIVO"

export const IMAGENS_REMOTAS: Record<string, string> = {
    "/banshee.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/bgQuadro.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/bloqueado.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/corpo_seco.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/espirito.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/folha.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/fundo.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/ghoull.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/kuchisake_onna.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/la_llorona.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/oni.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/onryo.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/papiroBG2.png": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/azul-1.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/azul-2.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/azul-3.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verde-1.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verde-2.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verde-3.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verm-1.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verm-2.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
    "/retalhos/verm-3.svg": driveUrl("COLE_O_ID_DO_ARQUIVO"),
}

export function urlImagem(caminho: string): string {
    if (!USAR_IMAGENS_REMOTAS) return caminho
    const url = IMAGENS_REMOTAS[caminho]
    return url && !url.includes(PLACEHOLDER) ? url : caminho
}

export const ehRemota = (url: string) => url.startsWith("http")
