/**
 * CS-DESIGN-005 — o peso de uma ação tem um dono só.
 *
 * Este arquivo prova duas coisas diferentes, e a segunda é a que importa a longo prazo:
 *
 *   1. Os três níveis existem e são visualmente distintos entre si.
 *   2. **Nenhum outro arquivo escreve aparência de botão à mão.** É essa varredura que
 *      impede o quinto tratamento de aparecer — o problema nunca foi faltar um estilo de
 *      botão, foi ter quatro, cada um com um detalhe diferente e nenhum sabendo do outro.
 *
 * A varredura é sobre o código-fonte, não sobre o HTML: um `bg-oceano` escrito num `.tsx`
 * novo falha aqui no mesmo commit, antes de virar tela.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { classesDeAcao, type NivelDeAcao } from '../componentes/acao.ts'

const NIVEIS: NivelDeAcao[] = ['primaria', 'secundaria', 'terciaria']

test('CS-DESIGN-005: os tres niveis existem e nenhum e igual a outro', () => {
  const vistos = new Map<string, NivelDeAcao>()
  for (const nivel of NIVEIS) {
    const classes = classesDeAcao(nivel)
    assert.ok(classes.length > 0, `${nivel} nao produz classe nenhuma`)
    const anterior = vistos.get(classes)
    assert.equal(anterior, undefined, `${nivel} e ${anterior} desenham a mesma coisa`)
    vistos.set(classes, nivel)
  }
})

/**
 * O defeito original: o link da secretaria e o link dos lugares eram os dois "contorno
 * oceano" e diferiam so no padding, e a diferenca de padding virou diferenca de peso.
 * Trocar de largura nao pode mudar o nivel, e trocar de nivel nao pode mudar o tamanho.
 */
/** Só cor de tema: `text-sm` e `text-lg` sao tamanho, e tamanho e o que a largura decide. */
const COR = /^(hover:)?(bg|text|border)-(oceano|borda|sal|tinta|lagoa|papel|areia|destaque|white)/

const cores = (classes: string) => classes.split(' ').filter((c) => COR.test(c)).sort().join(' ')

test('CS-DESIGN-005: largura e peso sao independentes', () => {
  for (const nivel of NIVEIS) {
    const cheia = classesDeAcao(nivel, 'cheia')
    const natural = classesDeAcao(nivel, 'natural')
    assert.notEqual(cheia, natural, `${nivel} desenha igual nas duas larguras`)
    // Trocar de largura nao pode mexer na cor: cor e o peso, e peso e o nivel.
    assert.equal(cores(cheia), cores(natural), `${nivel} muda de cor ao mudar de largura`)
  }

  // E trocar de nivel tem de mexer na cor, senao os niveis nao se distinguem na tela.
  const porCor = new Set(NIVEIS.map((nivel) => cores(classesDeAcao(nivel))))
  assert.equal(porCor.size, NIVEIS.length, 'dois niveis pintam a mesma coisa')
})

/**
 * `inline-flex` e `flex` no mesmo elemento deixavam o `display` por conta da ordem em que o
 * Tailwind emitiu as regras. Uma propriedade, uma classe.
 */
test('CS-DESIGN-005: nenhuma acao declara dois display ao mesmo tempo', () => {
  for (const nivel of NIVEIS) {
    for (const largura of ['cheia', 'natural'] as const) {
      const classes = classesDeAcao(nivel, largura).split(' ')
      const displays = classes.filter((c) => c === 'flex' || c === 'inline-flex')
      assert.equal(displays.length, 1, `${nivel}/${largura} declara ${displays.join(' e ')}`)
    }
  }
})

test('CS-DESIGN-004: toda acao nasce com alvo de toque de 44 px', () => {
  for (const nivel of NIVEIS) {
    for (const largura of ['cheia', 'natural'] as const) {
      assert.match(classesDeAcao(nivel, largura), /min-h-\[44px\]/, `${nivel}/${largura} sem piso de toque`)
    }
  }
})

test('CS-DESIGN-005: acao desabilitada perde o peso, e nao so a cor', () => {
  const normal = classesDeAcao('primaria', 'cheia')
  const morta = classesDeAcao('primaria', 'cheia', { desabilitada: true })
  assert.notEqual(normal, morta)
  assert.doesNotMatch(morta, /bg-oceano/, 'botao que nao responde continua gritando como principal')
})

// ---------------------------------------------------------------------------

async function fontes(diretorio: string): Promise<string[]> {
  const entradas = await readdir(diretorio, { withFileTypes: true })
  const achados: string[] = []
  for (const entrada of entradas) {
    const caminho = join(diretorio, entrada.name)
    if (entrada.isDirectory()) achados.push(...(await fontes(caminho)))
    else if (/\.tsx?$/.test(entrada.name)) achados.push(caminho)
  }
  return achados
}

/**
 * `rounded-pilula` sozinho nao acusa: ele veste tambem a barrinha de cor da rota e a cápsula
 * do seletor de idioma, que nao sao acao. O que denuncia botao escrito a mao e a COR de
 * acao — o fundo oceano e o contorno oceano — fora do modulo que os declara.
 */
const APARENCIA_DE_ACAO = /\b(bg-oceano(?!-fundo)|border-oceano)\b/

test('CS-DESIGN-005: nenhum arquivo desenha botao fora de componentes/acao.ts', async () => {
  const arquivos = [...(await fontes('componentes')), ...(await fontes('app')), ...(await fontes('lib'))]
  const infratores: string[] = []

  for (const arquivo of arquivos) {
    if (arquivo.endsWith(join('componentes', 'acao.ts'))) continue
    const linhas = (await readFile(arquivo, 'utf8')).split('\n')
    for (const [indice, linha] of linhas.entries()) {
      // Comentario que cita a regra nao e infracao — e como esta regra se explica.
      if (/^\s*(\/\/|\*|\/\*)/.test(linha)) continue
      if (APARENCIA_DE_ACAO.test(linha)) infratores.push(`${arquivo}:${indice + 1}`)
    }
  }

  assert.deepEqual(
    infratores,
    [],
    `aparencia de acao escrita a mao; use classesDeAcao() de componentes/acao.ts:\n  ${infratores.join('\n  ')}`,
  )
})
