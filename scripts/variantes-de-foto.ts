/**
 * Gera as larguras menores de cada foto (CS-PERF-001).
 *
 * O card da grade mede ~180 px de largura e estava baixando o arquivo de 1600 px: um hero
 * de 340 KB, nove vezes. Com `srcset`, o navegador baixa a largura que vai desenhar.
 *
 *   npx tsx scripts/variantes-de-foto.ts
 */
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

export const LARGURAS = [400, 800] as const

/**
 * `marca/` fica de fora: o logotipo nao e foto, nao passa pelo componente `Foto` e nao usa
 * `<picture>` com avif. Varrido junto, ele ganhava quatro arquivos que nenhuma tag pede.
 */
const FORA_DA_VARREDURA = new Set(['marca'])

async function arquivosWebp(diretorio: string): Promise<string[]> {
  const entradas = await readdir(diretorio, { withFileTypes: true })
  const achados: string[] = []
  for (const entrada of entradas) {
    const caminho = join(diretorio, entrada.name)
    if (entrada.isDirectory() && FORA_DA_VARREDURA.has(entrada.name)) continue
    else if (entrada.isDirectory()) achados.push(...(await arquivosWebp(caminho)))
    else if (entrada.name.endsWith('.webp') && !LARGURAS.some((l) => entrada.name.endsWith(`-${l}.webp`))) {
      achados.push(caminho)
    }
  }
  return achados
}

const originais = await arquivosWebp('public/img')
let geradas = 0

for (const original of originais) {
  const base = original.replace(/\.webp$/, '')
  for (const largura of LARGURAS) {
    const fonte = sharp(original).resize({ width: largura, withoutEnlargement: true })
    await fonte.clone().webp({ quality: 70 }).toFile(`${base}-${largura}.webp`)
    await fonte.clone().avif({ quality: 52 }).toFile(`${base}-${largura}.avif`)
    geradas += 2
  }
}

console.log(`${geradas} variantes geradas a partir de ${originais.length} fotos.`)
