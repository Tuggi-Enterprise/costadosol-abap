/**
 * A copy publicada — tudo o que um visitante lê na tela, em qualquer um dos tres idiomas.
 *
 * Existe porque copy erra em silencio: o texto continua aparecendo, bonito, dizendo a
 * coisa errada. Os quatro defeitos abaixo ja estiveram no ar neste projeto.
 *
 *   1. `Foto pendente — banco das secretarias (P-05)` embaixo do hero de tres municipios.
 *      Marcador interno, com numero de card, publicado em pagina de ente publico.
 *   2. Travessao de aparte em frase de 100 caracteres, em quinze lugares. Nao e erro de
 *      gramatica, e ritmo de texto gerado — e o cliente reconhece.
 *   3. "consta da lista oficial de atracoes do municipio", quatro vezes identicas. Quem
 *      le quatro cards seguidos le a mesma frase quatro vezes.
 *   4. Traducao esquecida: en igual a pt e ninguem percebe ate a feira.
 *
 * O criterio de estilo (sem travessao, sem marcador interno) e decisao do operador de
 * 13/08/2026 e ainda NAO tem ID `CS-*`. Quando `produto` registrar, cite o ID aqui.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { IDIOMAS_CONTEUDO, IDIOMAS_INTERFACE } from '../scripts/content-schema.ts'
import { rotulos, type Rotulos } from '../lib/interface.ts'

type Bloco = Record<string, string>
type Campo = { onde: string; bloco: Bloco; prosa: boolean }

const ler = (arquivo: string) => JSON.parse(readFileSync(`content/${arquivo}`, 'utf8'))

/**
 * Todo campo de conteudo que chega a tela, e so eles. `afirmacao`, `fonte_verificacao` e
 * `duracao_sugerida` ficam de fora de proposito: sao dado interno, e o dia em que um
 * deles for renderizado e o dia de acrescentar aqui.
 */
function camposExibidos(): Campo[] {
  const campos: Campo[] = []
  for (const m of ler('municipios.json')) {
    campos.push({ onde: `${m.slug}.linha`, bloco: m.linha, prosa: true })
    campos.push({ onde: `${m.slug}.hero.alt`, bloco: m.hero.alt, prosa: false })
  }
  for (const p of ler('pontos.json')) {
    campos.push({ onde: `${p.id}.nome`, bloco: p.nome, prosa: false })
    campos.push({ onde: `${p.id}.teaser`, bloco: p.teaser, prosa: true })
    campos.push({ onde: `${p.id}.texto`, bloco: p.texto, prosa: true })
    campos.push({ onde: `${p.id}.foto.alt`, bloco: p.foto.alt, prosa: false })
  }
  for (const r of ler('rotas.json')) {
    campos.push({ onde: `${r.id}.nome`, bloco: r.nome, prosa: true })
    campos.push({ onde: `${r.id}.eixo`, bloco: r.eixo, prosa: true })
  }
  for (const f of ler('fatos.json')) {
    campos.push({ onde: `${f.id}.texto`, bloco: f.texto, prosa: true })
  }
  return campos
}

/** Creditos de foto: texto visível, mas fora do padrao de tres idiomas. */
function creditos(): { onde: string; valor: string }[] {
  const lista: { onde: string; valor: string }[] = []
  for (const m of ler('municipios.json')) lista.push({ onde: `${m.slug}.hero`, valor: m.hero.credito })
  for (const p of ler('pontos.json')) lista.push({ onde: `${p.id}.foto`, valor: p.foto.credito })
  return lista
}

const CHAVES = Object.keys(rotulos('pt')) as (keyof Rotulos)[]

function rotulosPublicados(): { onde: string; valor: string }[] {
  const lista: { onde: string; valor: string }[] = []
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) lista.push({ onde: `${idioma}.${chave}`, valor: r[chave] })
  }
  return lista
}

test('CS-CONT-007: todo campo exibido existe nos tres idiomas, sem string vazia', () => {
  for (const { onde, bloco } of camposExibidos()) {
    for (const idioma of IDIOMAS_CONTEUDO) {
      const valor = bloco[idioma]
      assert.equal(typeof valor, 'string', `${onde}.${idioma} nao e texto`)
      assert.ok(valor!.trim().length > 0, `${onde}.${idioma} esta vazio`)
    }
  }
})

/**
 * Nome proprio pode ser igual nos tres ("Praia Seca" e Praia Seca em qualquer idioma).
 * Prosa nao pode: duas linhas iguais significam uma traducao que ninguem escreveu.
 */
test('CS-CONT-007: prosa exibida e diferente entre os tres idiomas', () => {
  for (const { onde, bloco, prosa } of camposExibidos()) {
    if (!prosa) continue
    for (const [a, b] of [['pt', 'en'], ['pt', 'es'], ['en', 'es']] as const) {
      assert.notEqual(bloco[a], bloco[b], `${onde}: ${a} e ${b} tem o mesmo texto`)
    }
  }
})

/**
 * O travessao de aparte e o tique mais reconhecivel de texto gerado, e o texto deste site
 * e institucional de nove prefeituras. Ponto final, dois pontos ou virgula fazem o mesmo
 * trabalho sem a assinatura.
 */
test('nenhuma copy publicada usa travessao de aparte', () => {
  for (const { onde, bloco } of camposExibidos()) {
    for (const idioma of IDIOMAS_CONTEUDO) {
      assert.doesNotMatch(bloco[idioma]!, /—|–/, `${onde}.${idioma} usa travessao`)
    }
  }
  for (const { onde, valor } of rotulosPublicados()) {
    assert.doesNotMatch(valor, /—|–/, `rotulo ${onde} usa travessao`)
  }
})

/**
 * Numero de card, ID de regra e "TODO" sao conversa do time. Um deles ja foi ao ar
 * embaixo do hero de tres municipios, e so aparecia em cidade sem foto.
 */
test('CS-OURO-006: nenhum marcador interno do time chega a tela', () => {
  const marcador = /\bP-\d+|\bCS-[A-Z]+-\d+|\bTODO\b|\bFIXME\b|pendente\s*\(/
  for (const { onde, bloco } of camposExibidos()) {
    for (const idioma of IDIOMAS_CONTEUDO) {
      assert.doesNotMatch(bloco[idioma]!, marcador, `${onde}.${idioma} carrega marcador interno`)
    }
  }
  for (const { onde, valor } of creditos()) {
    assert.doesNotMatch(valor, marcador, `credito de ${onde} carrega marcador interno`)
  }
  for (const { onde, valor } of rotulosPublicados()) {
    assert.doesNotMatch(valor, marcador, `rotulo ${onde} carrega marcador interno`)
  }
})

/**
 * "Secretaria de Turismo de Cabo Frio" em pt e es, "Cabo Frio Tourism Office" em ingles:
 * a cidade muda de lado. Concatenacao com separador fixo produzia as tres erradas.
 */
/**
 * A lista e explicita de proposito. Chaveta em rotulo so vale onde alguem substitui, e quem
 * substitui esta em `app/[lang]/[municipio]/page.tsx`; acrescentar uma chave aqui sem
 * acrescentar o `.replace()` la publica `{cidade}` na tela do visitante.
 */
const ROTULOS_COM_CIDADE = ['secretariaDaCidade', 'redesDaCidade'] as const

test('CS-CONT-007: o rotulo que recebe nome de cidade traz o lugar do nome', () => {
  for (const idioma of IDIOMAS_INTERFACE) {
    for (const chave of ROTULOS_COM_CIDADE) {
      assert.match(
        rotulos(idioma)[chave],
        /\{cidade\}/,
        `${idioma}.${chave} nao tem onde encaixar a cidade`,
      )
    }
  }
  for (const { onde, valor } of rotulosPublicados()) {
    if (ROTULOS_COM_CIDADE.some((chave) => onde.endsWith(`.${chave}`))) continue
    assert.doesNotMatch(valor, /\{/, `rotulo ${onde} tem chaveta que ninguem substitui`)
  }
})

/** Espaco duplo e ponto duplo passam por revisao humana e nao passam por leitura em pe. */
test('CS-OURO-006: copy publicada nao tem espaco nem pontuacao duplicados', () => {
  for (const { onde, bloco } of camposExibidos()) {
    for (const idioma of IDIOMAS_CONTEUDO) {
      assert.doesNotMatch(bloco[idioma]!, / {2}|\.\.|,,/, `${onde}.${idioma} tem pontuacao duplicada`)
    }
  }
})
