/**
 * O texto de interface — CS-CONT-007, CS-OURO-001 e a copy que P-29 proibe.
 *
 * Interface existe nos OITO idiomas; conteudo, em tres. Um rotulo faltando num idioma nao
 * quebra build nenhum: a tela so mostra a chave errada, e o erro aparece no telefone do
 * comprador coreano no meio da feira.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IDIOMAS_INTERFACE, MUNICIPIOS, PONTOS_POR_MUNICIPIO } from '../scripts/content-schema.ts'
import { rotulos, type Rotulos } from '../lib/interface.ts'
import { metadataDoSite as metadata } from '../lib/site.ts'

const CHAVES = Object.keys(rotulos('pt')) as (keyof Rotulos)[]

test('CS-CONT-007: a interface existe nos tres idiomas, com todas as chaves preenchidas', () => {
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) {
      assert.equal(typeof r[chave], 'string', `${idioma}.${chave} nao e texto`)
      assert.ok(r[chave].trim().length > 0, `${idioma}.${chave} esta vazio`)
    }
  }
})

test('CS-CONT-007: idioma fora dos tres cai em pt, e nao em tela em branco', () => {
  assert.deepEqual(rotulos('ja'), rotulos('pt'))
})

test('CS-OURO-001: nenhum rotulo explica mecanica', () => {
  const proibidas = [
    'inteligência artificial',
    'pipeline',
    'geolocalização',
    'algoritmo',
    'plataforma',
    'powered by',
    'funcionalidade',
  ]
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) {
      const valor = r[chave].toLowerCase()
      for (const palavra of proibidas) {
        assert.ok(!valor.includes(palavra), `${idioma}.${chave} usa "${palavra}"`)
      }
    }
  }
})

test('CS-NOME-001: os nomes revogados da v1.2 nao aparecem em rotulo publicado', () => {
  // Montadas por concatenacao para o repositorio nao carregar a palavra literal (A-11).
  const revogados = ['via' + 'gem', 'rotei' + 'ro']
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) {
      for (const palavra of revogados) {
        assert.ok(!r[chave].toLowerCase().includes(palavra), `${idioma}.${chave} usa "${palavra}"`)
      }
    }
  }
})

/**
 * P-29 fechou em 14/08/2026 pela opcao 2: Armacao dos Buzios entrou, o conjunto passou a
 * ser o consorcio inteiro e o site passou a se chamar Conderlagos. Com isso a contagem
 * deixou de ser proibida e passou a ser **conferivel**, que e coisa melhor.
 *
 * Ate aqui o guarda era um veto por palavra: nenhum rotulo podia dizer "nove", "nine",
 * "conderlagos". Veto por palavra nao percebe o defeito que importa — o rotulo dizer OITO
 * quando o schema tem dez municipios. Os dois testes abaixo derivam o numero de
 * `MUNICIPIOS` e `PONTOS_POR_MUNICIPIO`, entao mexer no schema sem mexer na copy quebra
 * aqui, em vez de publicar um numero errado sobre um consorcio publico.
 */
const NUMERAL_POR_EXTENSO: Record<string, Record<number, string>> = {
  pt: { 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez', 11: 'onze', 12: 'doze' },
  en: { 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' },
  es: { 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez', 11: 'once', 12: 'doce' },
}

test('CS-OITO-003/P-29: a chamada das outras cidades conta o que o schema conta', () => {
  const outras = MUNICIPIOS.length - 1
  for (const idioma of IDIOMAS_INTERFACE) {
    const numeral = NUMERAL_POR_EXTENSO[idioma]?.[outras]
    assert.ok(numeral, `falta o numeral de ${outras} em ${idioma}: acrescente a tabela acima`)
    assert.match(
      rotulos(idioma).outrasCidades,
      new RegExp(`\\b${numeral}\\b`, 'i'),
      `${idioma}.outrasCidades nao diz "${numeral}", e o schema tem ${MUNICIPIOS.length} municipios`,
    )
  }
})

test('CS-OURO-004: o rotulo dos lugares conta os pontos que a paridade exige', () => {
  const total = MUNICIPIOS.length * PONTOS_POR_MUNICIPIO
  for (const idioma of IDIOMAS_INTERFACE) {
    assert.match(
      rotulos(idioma).osLugares,
      new RegExp(`\\b${total}\\b`),
      `${idioma}.osLugares nao diz ${total}, que e ${MUNICIPIOS.length} x ${PONTOS_POR_MUNICIPIO}`,
    )
  }
})

/**
 * A descricao vai no preview de todo link compartilhado, onde ninguem a revisa. Numero
 * nenhum ali: e o unico texto do site que nao aparece em tela para alguem conferir.
 */
test('CS-OURO-006: a descricao do site nao conta municipios', () => {
  const descricao = String(metadata.description ?? '')
  assert.ok(descricao.length > 0, 'o site sem descricao publica um preview vazio')
  assert.doesNotMatch(descricao, /\b(nove|dez|nine|ten|nueve|diez|\d+)\b/i)
})

/**
 * CS-MUN-003: e o link que o gabinete municipal posta. Sem `metadataBase`, a og:image sai
 * como caminho relativo e o cartao chega sem imagem — verificado na documentacao do Next
 * 16, que resolve URL relativa de metadata contra esta base.
 */
test('CS-MUN-003: o site declara a base absoluta das URLs de metadata', () => {
  assert.ok(metadata.metadataBase instanceof URL)
  assert.match(String(metadata.metadataBase), /^https:\/\//)
})
