/**
 * CS-NAV-002 — as nove entradas de mesa.
 *
 * Export estatico do Next nao suporta `redirects` (verificado na doc oficial do Next
 * 16.3.0, ver docs/02-arquitetura.md secao 1), entao cada entrada e um HTML de verdade,
 * escrito em public/<slug>/index.html e servido pelo Cloudflare Pages.
 *
 * Gerado a partir de scripts/content-schema.ts, nunca escrito a mao: nome e slug de
 * municipio tem um dono so.
 *
 *   npm run gen:redirects
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { IDIOMAS_INTERFACE, MUNICIPIOS } from './content-schema.ts'

/** Teto da pagina de redirecionamento. Cada byte aqui entra no orcamento de CS-MUN-004. */
export const TETO_BYTES = 2048

/**
 * Segmentos que ja existem na raiz do site. Um slug que colidisse com um destes faria o
 * QR da mesa abrir outra coisa — e so daria para descobrir na feira.
 */
export const SEGMENTOS_RESERVADOS = [...IDIOMAS_INTERFACE, 'painel', '_next', 'img', 'audio', 'pdf', 'mapa', 'api']

export function paginaDeRedirecionamento(slug: string, nome: string): string {
  const idiomas = IDIOMAS_INTERFACE.map((i) => `"${i}"`).join(',')
  return `<!doctype html>
<html lang="pt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${nome}, Conderlagos</title>
<script>(function(){var I=[${idiomas}],S="${slug}",n=(navigator.language||"pt").toLowerCase(),l="pt";
for(var i=0;i<I.length;i++){if(n===I[i]||n.indexOf(I[i]+"-")===0){l=I[i];break}}
try{sessionStorage.setItem("entry_municipio",S);sessionStorage.setItem("qr_id","mesa-"+S)}catch(e){}
location.replace("/"+l+"/"+S+"/")})();</script>
<noscript><meta http-equiv="refresh" content="0;url=/pt/${slug}/"></noscript>
</head><body><noscript><a href="/pt/${slug}/">${nome}, Conderlagos</a></noscript></body></html>
`
}

export function verificarColisao(slug: string): void {
  if (SEGMENTOS_RESERVADOS.includes(slug)) {
    throw new Error(`CS-NAV-002: o slug "${slug}" colide com um segmento reservado da raiz do site`)
  }
}

const executadoDiretamente = process.argv[1]?.endsWith('gen-redirects.ts')

if (executadoDiretamente) {
  for (const { slug, nome } of MUNICIPIOS) {
    verificarColisao(slug)
    const html = paginaDeRedirecionamento(slug, nome)
    const bytes = Buffer.byteLength(html, 'utf8')
    if (bytes > TETO_BYTES) {
      throw new Error(`CS-NAV-002: /${slug} tem ${bytes} bytes, acima do teto de ${TETO_BYTES}`)
    }
    const destino = resolve('public', slug)
    await mkdir(destino, { recursive: true })
    await writeFile(resolve(destino, 'index.html'), html, 'utf8')
  }
  console.log(`${MUNICIPIOS.length} entradas de mesa geradas em public/ (teto ${TETO_BYTES} bytes).`)
}
