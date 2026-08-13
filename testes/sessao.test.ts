/**
 * O sorteio de sessao — CS-SORT-001 a CS-SORT-004 e CS-HOME-006.
 *
 * Nada aqui toca o navegador: o que precisa ser provado e que a ordem e a escolha do
 * ponto dependem SO da semente. Se dependessem de mais alguma coisa, a promessa "voltar
 * para a home reproduz a mesma ordem" (CS-SORT-001) deixaria de valer sem que nada
 * quebrasse — e ninguem perceberia ate a feira.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { embaralhar, sortearIndice } from '../lib/sessao.ts'
import { MUNICIPIOS } from '../scripts/content-schema.ts'

const SLUGS = MUNICIPIOS.map((m) => m.slug)
const sementes = Array.from({ length: 20 }, (_, i) => `sessao-${i}`)

test('CS-SORT-001/004: a mesma semente reproduz a mesma ordem, sempre', () => {
  for (const semente of sementes) {
    assert.deepEqual(embaralhar(SLUGS, semente), embaralhar(SLUGS, semente))
  }
})

test('CS-SORT-004: duas sessoes distintas produzem ordens diferentes', () => {
  const ordens = new Set(sementes.map((s) => embaralhar(SLUGS, s).join(',')))
  // Nao se exige que as 20 sejam unicas — 9! permutacoes tornam colisao improvavel, mas o
  // que a regra promete e que a ordem NAO e constante entre sessoes.
  assert.ok(ordens.size > 1, 'a ordem nao muda entre sessoes: o sorteio nao esta sorteando')
})

test('CS-OURO-005/CS-SORT-002: o embaralhamento nao perde nem duplica municipio', () => {
  for (const semente of sementes) {
    const ordem = embaralhar(SLUGS, semente)
    assert.equal(ordem.length, SLUGS.length)
    assert.deepEqual([...ordem].sort(), [...SLUGS].sort())
  }
})

test('CS-HOME-006: um ponto por municipio, e o indice cai sempre dentro dos quatro', () => {
  for (const semente of sementes) {
    const escolhidos = SLUGS.map((slug) => ({ slug, indice: sortearIndice(semente, slug, 4) }))
    assert.equal(escolhidos.length, 9, 'A-09: nenhum municipio com zero ou dois cards')
    assert.equal(new Set(escolhidos.map((e) => e.slug)).size, 9)
    for (const { slug, indice } of escolhidos) {
      assert.ok(indice >= 0 && indice < 4, `${slug}: indice ${indice} fora dos quatro pontos`)
    }
  }
})

test('CS-HOME-006: o ponto sorteado varia entre sessoes, e nao entre recargas', () => {
  const porSemente = sementes.map((s) => SLUGS.map((slug) => sortearIndice(s, slug, 4)).join(','))
  assert.ok(new Set(porSemente).size > 1, 'A-09: o ponto exibido nao muda entre sessoes')

  for (const semente of sementes) {
    for (const slug of SLUGS) {
      assert.equal(sortearIndice(semente, slug, 4), sortearIndice(semente, slug, 4))
    }
  }
})

test('CS-HOME-006: numa mesma sessao os nove municipios nao caem todos no mesmo indice', () => {
  // Sem a chave por municipio no PRNG, uma semente sortearia um indice so e a home
  // mostraria o ponto 1 dos nove — paridade preservada e variedade nenhuma.
  const variados = sementes.filter(
    (s) => new Set(SLUGS.map((slug) => sortearIndice(s, slug, 4))).size > 1,
  )
  assert.equal(variados.length, sementes.length)
})

test('CS-SORT-003: a mesma semente rege a ordem e a escolha do ponto', () => {
  const semente = 'sessao-fixa'
  const primeira = {
    ordem: embaralhar(SLUGS, semente),
    pontos: SLUGS.map((slug) => sortearIndice(semente, slug, 4)),
  }
  const segunda = {
    ordem: embaralhar(SLUGS, semente),
    pontos: SLUGS.map((slug) => sortearIndice(semente, slug, 4)),
  }
  assert.deepEqual(primeira, segunda)
})
