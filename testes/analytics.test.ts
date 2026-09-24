/**
 * P-10 — o adaptador do Google Analytics, decidido pelo operador em 24/09/2026.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NOME_NO_GA } from '../lib/ga.ts'
import { profundidade } from '../lib/track.ts'

test('P-10: session_start nosso nao colide com o evento reservado do GA4', () => {
  assert.equal(NOME_NO_GA['session_start'], 'site_session_start')
})

test('P-10: rolagem conta a janela — pagina que cabe na tela e 100%', () => {
  assert.equal(profundidade(0, 800, 600), 100)
  assert.equal(profundidade(0, 800, 3200), 25)
  assert.equal(profundidade(1600, 800, 3200), 75)
  assert.equal(profundidade(9999, 800, 3200), 100)
})
