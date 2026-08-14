/**
 * A régua de acessibilidade — CS-DESIGN-004 e a meta de 95 de CS-PERF-002.
 *
 * **Por que este arquivo existe.** CS-PERF-002 prometia `scripts/perf-check.ts` com
 * Lighthouse CI rodando em cada PR, e esse arquivo nunca existiu. A meta de acessibilidade
 * ≥ 95 era, na prática, intenção: nenhum critério de aceite cobria teclado, nome de botão ou
 * texto alternativo, e ninguém tinha como saber se o que já estava no ar passava.
 *
 * **Por que estático, e não Lighthouse.** Lighthouse precisa de Chrome e de um servidor de
 * pé, o que o torna caro e frágil justamente onde ele mais importa: rodando sozinho, em
 * todo build, sem ninguém lembrar. Esta varredura lê o HTML que o `next build` acabou de
 * escrever — as 174 páginas, não uma amostra —, roda em segundos e não depende de rede nem
 * de navegador. Ela **não substitui** Lighthouse: contraste percebido, ordem de foco e
 * leitura por leitor de tela continuam pedindo o navegador e o critério A-22.
 *
 * **O que ela pega é o que apodrece em silêncio:** foto que perdeu o `alt` numa refatoração,
 * botão que virou só ícone, link "saiba mais" sem destino legível, `id` duplicado por um
 * componente renderizado duas vezes, página sem `h1`, `target="_blank"` sem `rel`. Nenhum
 * desses quebra a tela; todos quebram para quem não vê a tela.
 *
 *   npx tsx scripts/a11y-check.ts            # roda sozinho no postbuild
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

export type Achado = { arquivo: string; regra: string; detalhe: string }

const RAIZ_PADRAO = '.next/server/app'

// ---------------------------------------------------------------------------
// Varredura de marcação
// ---------------------------------------------------------------------------

/** Conteúdo de `<script>` e `<style>` não é marcação: ali mora o payload do RSC. */
function semScriptNemEstilo(html: string): string {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
}

const ATRIBUTO = (fonte: string, nome: string): string | null => {
  const achado = new RegExp(`\\b${nome}\\s*=\\s*"([^"]*)"`, 'i').exec(fonte)
  return achado ? (achado[1] as string) : null
}

const temAtributo = (fonte: string, nome: string) => new RegExp(`\\b${nome}\\b`, 'i').test(fonte)

/** Texto que sobra depois de tirar as tags, com entidades comuns resolvidas. */
function textoVisivel(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, 'x')
    .replace(/&[a-z]+;/gi, 'x')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Devolve, para cada abertura de `tag`, a marcação de abertura e o conteúdo até o fechamento
 * correspondente. Conta profundidade para não parar no primeiro `</a>` de um link aninhado.
 */
function elementos(html: string, tag: string): { abertura: string; dentro: string }[] {
  const achados: { abertura: string; dentro: string }[] = []
  const abre = new RegExp(`<${tag}\\b[^>]*>`, 'gi')
  const limite = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi')

  for (let inicio = abre.exec(html); inicio; inicio = abre.exec(html)) {
    limite.lastIndex = inicio.index + inicio[0].length
    let profundidade = 1
    let fim = html.length
    for (let passo = limite.exec(html); passo; passo = limite.exec(html)) {
      profundidade += passo[1] === '/' ? -1 : 1
      if (profundidade === 0) {
        fim = passo.index
        break
      }
    }
    achados.push({ abertura: inicio[0], dentro: html.slice(inicio.index + inicio[0].length, fim) })
  }
  return achados
}

/**
 * O nome acessível de um controle, na ordem em que o navegador o monta: `aria-label` vence
 * o conteúdo; o conteúdo inclui o `alt` de imagem dentro dele; `title` é o último recurso.
 */
function nomeAcessivel(abertura: string, dentro: string): string {
  const rotulo = ATRIBUTO(abertura, 'aria-label')
  if (rotulo?.trim()) return rotulo.trim()

  const alts = [...dentro.matchAll(/\balt\s*=\s*"([^"]*)"/gi)].map((m) => m[1] ?? '')
  const texto = [textoVisivel(dentro), ...alts].join(' ').trim()
  if (texto) return texto

  return (ATRIBUTO(abertura, 'title') ?? '').trim()
}

// ---------------------------------------------------------------------------
// As regras
// ---------------------------------------------------------------------------

export function auditar(arquivo: string, htmlBruto: string): Achado[] {
  const html = semScriptNemEstilo(htmlBruto)
  const achados: Achado[] = []
  const anotar = (regra: string, detalhe: string) => achados.push({ arquivo, regra, detalhe })

  const lang = /<html\b[^>]*>/i.exec(html)
  if (!lang) anotar('lang', 'a página não tem elemento <html>')
  else if (!ATRIBUTO(lang[0], 'lang')?.trim()) {
    // CS-CONT-008: o leitor de tela troca de voz por este atributo. Sem ele, o texto em
    // espanhol sai lido com fonemas de português.
    anotar('lang', '<html> sem atributo lang')
  }

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = img[0]
    // `alt=""` é declaração válida de imagem decorativa; ausência de `alt` não é.
    if (!temAtributo(tag, 'alt') && !temAtributo(tag, 'aria-hidden')) {
      anotar('img-sem-alt', `<img src="${ATRIBUTO(tag, 'src') ?? '?'}"> sem alt`)
    }
  }

  for (const tag of ['a', 'button'] as const) {
    for (const { abertura, dentro } of elementos(html, tag)) {
      if (tag === 'a' && !ATRIBUTO(abertura, 'href')) continue
      if (temAtributo(abertura, 'aria-hidden')) continue
      if (!nomeAcessivel(abertura, dentro)) {
        const pista = ATRIBUTO(abertura, 'href') ?? ATRIBUTO(abertura, 'class') ?? ''
        anotar('controle-sem-nome', `<${tag}> sem nome acessível (${pista.slice(0, 60)})`)
      }
    }
  }

  for (const a of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = a[0]
    if (!/target\s*=\s*"_blank"/i.test(tag)) continue
    if (!/rel\s*=\s*"[^"]*noopener/i.test(tag)) {
      anotar('blank-sem-noopener', `${ATRIBUTO(tag, 'href') ?? '?'} abre em nova aba sem rel=noopener`)
    }
  }

  const ids = [...html.matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map((m) => m[1] as string)
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i)
  for (const id of new Set(repetidos)) {
    // `aria-labelledby` e `<label for>` apontam para UM elemento. Com id repetido, apontam
    // para o primeiro, que quase nunca é o que a pessoa está usando.
    anotar('id-repetido', `id="${id}" aparece ${ids.filter((x) => x === id).length} vezes`)
  }

  const h1 = elementos(html, 'h1').filter(({ abertura, dentro }) => nomeAcessivel(abertura, dentro))
  if (h1.length === 0) anotar('sem-h1', 'a página não tem <h1> com texto')
  if (h1.length > 1) anotar('h1-repetido', `${h1.length} elementos <h1>`)

  return achados
}

// ---------------------------------------------------------------------------

/**
 * A ÚNICA página fora da varredura, e a razão está escrita porque exclusão sem razão vira
 * exclusão sem fim.
 *
 * `_global-error.html` é o casco que o próprio Next emite (`<html id="__next_error__">`),
 * sem `lang` e sem como recebê-lo: não passa por `app/layout.tsx`. Foi este verificador que
 * a encontrou, e o que deu para fazer está feito — `app/global-error.tsx` desenha a tela de
 * erro de verdade, com `lang="pt"`, e é ela que substitui o casco assim que o cliente
 * hidrata. O casco continua indo antes disso; se algum dia o Next aceitar `lang` nele,
 * tira-se esta linha.
 */
const FORA_DA_VARREDURA = new Map([
  ['_global-error.html', 'casco do framework; a tela real e com lang esta em app/global-error.tsx'],
])

async function paginas(raiz: string): Promise<string[]> {
  const entradas = await readdir(raiz, { withFileTypes: true })
  const achados: string[] = []
  for (const entrada of entradas) {
    const caminho = join(raiz, entrada.name)
    if (entrada.isDirectory()) achados.push(...(await paginas(caminho)))
    else if (entrada.name.endsWith('.html')) achados.push(caminho)
  }
  return achados
}

export async function auditarBuild(
  raiz = RAIZ_PADRAO,
): Promise<{ arquivos: number; ignorados: string[]; achados: Achado[] }> {
  const todas = await paginas(raiz)
  const ignorados: string[] = []
  const achados: Achado[] = []

  for (const arquivo of todas) {
    const motivo = FORA_DA_VARREDURA.get(arquivo.split('/').pop() ?? '')
    if (motivo) {
      ignorados.push(`${arquivo} — ${motivo}`)
      continue
    }
    achados.push(...auditar(arquivo, await readFile(arquivo, 'utf8')))
  }
  return { arquivos: todas.length - ignorados.length, ignorados, achados }
}

const executadoDiretamente = process.argv[1]?.endsWith('a11y-check.ts')

if (executadoDiretamente) {
  const { arquivos, ignorados, achados } = await auditarBuild()
  if (arquivos === 0) {
    console.error('a11y: nenhuma página em .next/server/app — rode `npm run build` antes.')
    process.exit(1)
  }
  // Nada de corte silencioso: o que ficou de fora aparece toda vez, com o motivo.
  for (const ignorado of ignorados) console.log(`a11y: fora da varredura — ${ignorado}`)
  if (achados.length > 0) {
    // Agrupado por regra: 174 páginas com o mesmo defeito são UM defeito, e listar 174
    // linhas esconde o segundo.
    const porRegra = new Map<string, Achado[]>()
    for (const achado of achados) porRegra.set(achado.regra, [...(porRegra.get(achado.regra) ?? []), achado])
    for (const [regra, lista] of porRegra) {
      console.error(`\n${regra} — ${lista.length} ocorrência(s)`)
      for (const achado of lista.slice(0, 5)) console.error(`  ${achado.arquivo}: ${achado.detalhe}`)
      if (lista.length > 5) console.error(`  ... e mais ${lista.length - 5}`)
    }
    console.error(`\nCS-DESIGN-004: ${achados.length} problema(s) de acessibilidade em ${arquivos} páginas.`)
    process.exit(1)
  }
  console.log(`a11y: ${arquivos} páginas, nenhum problema de marcação.`)
}
