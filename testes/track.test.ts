/**
 * A leitura de origem da abertura — CS-DADO-002 e CS-EVT-003.
 *
 * A entrada por mesa chega na pagina do municipio sem passar por clique nenhum, e por
 * isso a abertura do municipio de ENTRADA nao era contada: faltava justo a linha que
 * CS-DADO-002 descreve como "inflada para o municipio de entrada". Quem inventa a origem
 * quando nao ha clique e `inferirOrigem`, e o painel de nove prefeituras depende dela
 * dizer a verdade sobre o que e fluxo de mesa e o que e navegacao pelo site.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inferirOrigem } from '../lib/track.ts'

test('CS-DADO-002: chegar na cidade da propria mesa e origem "mesa"', () => {
  assert.equal(inferirOrigem('saquarema', 'saquarema'), 'mesa')
})

test('CS-DADO-002: chegar em outra cidade sem clique marcado nao vira fluxo de mesa', () => {
  // Se isto virasse "mesa", o bloco "desempenho por mesa" do painel (CS-PAINEL-002)
  // contaria como fluxo fisico de uma mesa uma navegacao que aconteceu no telefone.
  assert.equal(inferirOrigem('saquarema', 'arraial-do-cabo'), 'interno')
})

test('CS-EVT-004: sessao sem entrada por mesa nunca produz origem "mesa"', () => {
  assert.equal(inferirOrigem(null, 'cabo-frio'), 'interno')
})
