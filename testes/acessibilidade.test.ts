/**
 * CS-DESIGN-004 — a régua de acessibilidade, provada em duas frentes.
 *
 *   1. **O verificador funciona.** `scripts/a11y-check.ts` roda no `postbuild` sobre as 176
 *      páginas geradas e derruba o build. Um verificador que nunca acusou nada é
 *      indistinguível de um verificador quebrado, então aqui ele recebe marcação com defeito
 *      conhecido e precisa acusar cada um.
 *   2. **O contraste dos tokens fecha 4,5:1.** Este é calculado, não olhado: as cores de
 *      `app/tema.css` estão em OKLCH, e ninguém estima contraste de OKLCH de cabeça. A conta
 *      abaixo é a da WCAG, sobre os pares que de fato aparecem na tela.
 *
 * O que ISTO NÃO cobre, e continua precisando de navegador e de gente: ordem de foco,
 * comportamento real de leitor de tela e contraste de texto sobre foto. Ver A-22.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { auditar } from '../scripts/a11y-check.ts'

const regras = (html: string) => auditar('teste.html', html).map((a) => a.regra).sort()

const pagina = (corpo: string) => `<!DOCTYPE html><html lang="pt"><body>${corpo}</body></html>`

test('CS-DESIGN-004: o verificador acusa imagem sem alt', () => {
  assert.deepEqual(regras(pagina('<h1>Título</h1><img src="/a.webp">')), ['img-sem-alt'])
  // `alt=""` é imagem decorativa declarada, e declarar é o oposto de esquecer.
  assert.deepEqual(regras(pagina('<h1>Título</h1><img src="/a.webp" alt="">')), [])
})

test('CS-DESIGN-004: o verificador acusa controle sem nome, e aceita as tres formas de nomear', () => {
  assert.deepEqual(regras(pagina('<h1>T</h1><button><svg></svg></button>')), ['controle-sem-nome'])
  assert.deepEqual(regras(pagina('<h1>T</h1><button aria-label="Ouvir"><svg></svg></button>')), [])
  assert.deepEqual(regras(pagina('<h1>T</h1><button>Ouvir</button>')), [])
  // Ícone dentro do link não nomeia; o `alt` da imagem dentro dele, sim.
  assert.deepEqual(regras(pagina('<h1>T</h1><a href="/x"><img src="/a.webp" alt="Mapa"></a>')), [])
})

test('CS-DESIGN-004: o verificador nao se perde em controle aninhado', () => {
  // Um `</a>` interno não pode encerrar a contagem do externo: se encerrasse, o link de
  // fora pareceria vazio e o verificador acusaria defeito que não existe.
  const html = pagina('<h1>T</h1><a href="/fora"><span><a href="/dentro">Dentro</a></span>Fora</a>')
  assert.deepEqual(regras(html), [])
})

test('CS-DESIGN-004: o verificador acusa pagina sem h1 e pagina com dois', () => {
  assert.deepEqual(regras(pagina('<p>sem titulo</p>')), ['sem-h1'])
  assert.deepEqual(regras(pagina('<h1>Um</h1><h1>Dois</h1>')), ['h1-repetido'])
  // `<h1>` vazio não é título: ele existe na árvore e não diz nada.
  assert.deepEqual(regras(pagina('<h1></h1>')), ['sem-h1'])
})

test('CS-DESIGN-004: o verificador acusa id repetido e aba nova sem noopener', () => {
  assert.deepEqual(regras(pagina('<h1>T</h1><p id="a"></p><p id="a"></p>')), ['id-repetido'])
  assert.deepEqual(
    regras(pagina('<h1>T</h1><a href="https://x.org" target="_blank">Fora</a>')),
    ['blank-sem-noopener'],
  )
  assert.deepEqual(
    regras(pagina('<h1>T</h1><a href="https://x.org" target="_blank" rel="noopener noreferrer">Fora</a>')),
    [],
  )
})

test('CS-CONT-008: o verificador acusa documento sem lang', () => {
  assert.deepEqual(regras('<!DOCTYPE html><html><body><h1>T</h1></body></html>'), ['lang'])
})

test('CS-DESIGN-004: o payload dentro de <script> nao vira marcacao', () => {
  // O HTML do Next carrega o payload do RSC dentro de `<script>`, e ali existem strings com
  // `<img` sem alt e `id=` repetido. Lidas como marcação, cada página acusaria dezenas de
  // defeitos inexistentes e o verificador viraria ruído que todo mundo ignora.
  const html = pagina('<h1>T</h1><script>self.__f.push("<img src=x><p id=a><p id=a>")</script>')
  assert.deepEqual(regras(html), [])
})

// ---------------------------------------------------------------------------
// Contraste calculado a partir de app/tema.css
// ---------------------------------------------------------------------------

/** OKLCH -> sRGB, o caminho que o navegador percorre para pintar o token. */
function oklchParaRgb(L: number, C: number, hGraus: number): [number, number, number] {
  const h = (hGraus * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

/** Luminância relativa da WCAG. Entra sRGB linear, sai o número que a razão usa. */
function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => Math.max(0, Math.min(1, v))
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

const razao = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

async function tokens(): Promise<Record<string, number>> {
  const css = await readFile('app/tema.css', 'utf8')
  const achados: Record<string, number> = {}
  for (const m of css.matchAll(/--color-([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
    achados[m[1] as string] = luminancia(oklchParaRgb(Number(m[2]), Number(m[3]), Number(m[4])))
  }
  achados['white'] = 1
  return achados
}

/**
 * Os pares que existem na tela hoje. Par novo entra aqui junto com o componente que o cria;
 * é a lista que transforma "contraste 4,5:1" de intenção em conta.
 */
const PARES: [texto: string, fundo: string, onde: string][] = [
  ['tinta', 'papel', 'texto corrido'],
  ['tinta-suave', 'papel', 'credito de foto, rodape, terciaria'],
  ['tinta-suave', 'sal', 'secao das outras cidades'],
  ['oceano', 'papel', 'acao secundaria'],
  ['white', 'oceano', 'acao primaria'],
  ['white', 'oceano-fundo', 'bloco de fatos e titulo da capa'],
  ['lagoa-tinta', 'papel', 'rotulo de caixa alta: numero do ponto, volta, nome do grupo'],
  ['lagoa', 'oceano-fundo', 'numero grande do bloco de fatos'],
]

/**
 * O par que a conta reprovou media 3,35:1 e estava em quatro telas. Depois de corrigido,
 * nada impede alguém de escrever `text-lagoa` de novo num fundo claro — a classe existe e
 * parece certa. Esta varredura é o que impede: sobre papel, o turquesa de texto é
 * `lagoa-tinta`; `lagoa` continua valendo para superfície e para o fundo escuro dos fatos.
 */
test('CS-DESIGN-004: o turquesa de superficie nao volta a virar texto sobre papel', async () => {
  const fontes = [
    'componentes/CardDePonto.tsx',
    'componentes/LugaresDaHome.tsx',
    'app/[lang]/lugares/page.tsx',
    'app/[lang]/rotas/[rota]/page.tsx',
    'app/[lang]/[municipio]/[ponto]/page.tsx',
  ]
  for (const arquivo of fontes) {
    const codigo = await readFile(arquivo, 'utf8')
    assert.doesNotMatch(
      codigo,
      /\btext-lagoa\b(?!-tinta)/,
      `${arquivo} usa text-lagoa sobre fundo claro; sobre papel o token e text-lagoa-tinta`,
    )
  }
})

test('CS-DESIGN-004: todo par de cor publicado fecha 4,5:1', async () => {
  const luz = await tokens()
  const falhas: string[] = []
  for (const [texto, fundo, onde] of PARES) {
    const a = luz[texto]
    const b = luz[fundo]
    assert.ok(a !== undefined, `token --color-${texto} nao existe em app/tema.css`)
    assert.ok(b !== undefined, `token --color-${fundo} nao existe em app/tema.css`)
    const contraste = razao(a, b)
    if (contraste < 4.5) falhas.push(`${texto} sobre ${fundo} (${onde}): ${contraste.toFixed(2)}:1`)
  }
  assert.deepEqual(falhas, [], `abaixo de 4,5:1:\n  ${falhas.join('\n  ')}`)
})
