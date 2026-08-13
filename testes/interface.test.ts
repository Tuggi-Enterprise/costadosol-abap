/**
 * O texto de interface — CS-CONT-007, CS-OURO-001 e a copy que P-29 proibe.
 *
 * Interface existe nos OITO idiomas; conteudo, em tres. Um rotulo faltando num idioma nao
 * quebra build nenhum: a tela so mostra a chave errada, e o erro aparece no telefone do
 * comprador coreano no meio da feira.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IDIOMAS_INTERFACE } from '../scripts/content-schema.ts'
import { rotulos, type Rotulos } from '../lib/interface.ts'
import { metadataDoSite as metadata } from '../lib/site.ts'

const CHAVES = Object.keys(rotulos('pt')) as (keyof Rotulos)[]

test('CS-CONT-007: a interface existe nos oito idiomas, com todas as chaves preenchidas', () => {
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) {
      assert.equal(typeof r[chave], 'string', `${idioma}.${chave} nao e texto`)
      assert.ok(r[chave].trim().length > 0, `${idioma}.${chave} esta vazio`)
    }
  }
})

test('CS-CONT-007: idioma fora dos oito cai em pt, e nao em tela em branco', () => {
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
 * P-29: as duas expressoes que CS-OURO-003 autoriza contam municipios, e a apuracao de
 * 12/08/2026 mostrou que a contagem esta errada — o Conderlagos tem dez, e a regiao
 * turistica da Setur-RJ tem treze e nao inclui Silva Jardim. Ate o cliente decidir,
 * nenhum texto publicado conta cidade.
 *
 * A excecao e a chamada prescrita por CS-OITO-003 ("mais oito cidades"), que e texto de
 * regra: se P-29 fechar pela opcao 2 ou 3, ela muda junto.
 */
test('CS-OURO-006/P-29: nenhum rotulo publicado conta municipios', () => {
  const contagens = [
    /\bnove\s+(munic|cidad)/i,
    /\bdez\s+(munic|cidad)/i,
    /\bnine\s+(munic|cit)/i,
    /\bten\s+(munic|cit)/i,
    /\bnueve\s+(munic|ciudad)/i,
    /\bos\s+9\s+(munic|cidad)/i,
    /conderlagos/i,
  ]
  for (const idioma of IDIOMAS_INTERFACE) {
    const r = rotulos(idioma)
    for (const chave of CHAVES) {
      for (const contagem of contagens) {
        assert.doesNotMatch(r[chave], contagem, `${idioma}.${chave} conta municipios`)
      }
    }
  }
})

test('CS-OURO-006/P-29: a descricao do site nao conta municipios', () => {
  const descricao = String(metadata.description ?? '')
  assert.ok(descricao.length > 0, 'o site sem descricao publica um preview vazio')
  assert.doesNotMatch(descricao, /\bnove\b|conderlagos/i)
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
