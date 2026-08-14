/**
 * CS-DESIGN-006 — as preferências de leitura.
 *
 * O que se prova aqui é o que quebra em silêncio: valor inválido virando atributo inválido,
 * e o script de arranque do layout se afastando da biblioteca que ele imita.
 *
 * **A duplicação testada.** `app/layout.tsx` carrega um script embutido que lê
 * `sessionStorage` e escreve os dois atributos ANTES da primeira pintura — sem ele, quem
 * escolheu "A++" vê a página montar pequena e saltar, que é pior justamente para quem
 * precisa do texto grande. Esse script não pode importar `lib/preferencias.ts`, porque roda
 * antes de qualquer módulo. É a única duplicação do projeto que não dá para eliminar, então
 * ela vira teste: chave e valores têm de bater com os da biblioteca.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { CHAVE, MOVIMENTOS, PADRAO, TAMANHOS, normalizar } from '../lib/preferencias.ts'

test('CS-DESIGN-006: preferencia ausente ou corrompida cai no padrao', () => {
  assert.deepEqual(normalizar(null), PADRAO)
  assert.deepEqual(normalizar('lixo'), PADRAO)
  assert.deepEqual(normalizar({}), PADRAO)
  // Um valor bom e um ruim: o bom sobrevive, o ruim não contamina o outro campo.
  assert.deepEqual(normalizar({ texto: 'maior', movimento: 'girar' }), {
    texto: 'maior',
    movimento: 'sistema',
  })
})

test('CS-DESIGN-006: todo valor declarado e aceito de volta', () => {
  for (const texto of TAMANHOS) assert.equal(normalizar({ texto }).texto, texto)
  for (const movimento of MOVIMENTOS) assert.equal(normalizar({ movimento }).movimento, movimento)
})

/**
 * O padrão de movimento é `sistema`, não `completo`: quem já pediu `prefers-reduced-motion`
 * no aparelho não pode precisar pedir de novo aqui. Trocar este padrão passaria por cima da
 * escolha que a pessoa fez no sistema operacional.
 */
test('CS-DESIGN-006: o padrao de movimento respeita o sistema', () => {
  assert.equal(PADRAO.movimento, 'sistema')
  assert.equal(PADRAO.texto, 'padrao')
})

test('CS-DESIGN-006: o script de arranque do layout usa a mesma chave e os mesmos valores', async () => {
  const layout = await readFile('app/layout.tsx', 'utf8')
  const arranque = /const ARRANQUE_DE_PREFERENCIAS = `([^`]*)`/.exec(layout)?.[1]
  assert.ok(arranque, 'o script de arranque sumiu do layout: o texto volta a saltar na carga')

  assert.ok(arranque.includes(`'${CHAVE}'`), `o arranque nao le a chave "${CHAVE}"`)
  for (const tamanho of TAMANHOS) {
    assert.ok(arranque.includes(`'${tamanho}'`), `o arranque nao conhece o tamanho "${tamanho}"`)
  }
  assert.ok(arranque.includes(`'reduzido'`), 'o arranque nao conhece o movimento reduzido')
  // Roda antes de tudo e não pode derrubar a página: sem try/catch, navegação privada que
  // lança ao ler sessionStorage deixaria o site em branco.
  assert.match(arranque, /^try\{/, 'o arranque roda sem protecao contra sessionStorage que lanca')
})

test('CS-DESIGN-006: o tema reage aos dois atributos que o arranque escreve', async () => {
  const css = await readFile('app/tema.css', 'utf8')
  for (const tamanho of TAMANHOS.filter((t) => t !== 'padrao')) {
    assert.match(css, new RegExp(`data-texto='${tamanho}'`), `app/tema.css ignora o tamanho "${tamanho}"`)
  }
  assert.match(css, /data-movimento='reduzido'/, 'app/tema.css ignora o movimento reduzido')
})

/**
 * O piso de toque é px de propósito (CS-DESIGN-004): ele é piso, não altura. Se virasse
 * `rem`, o alvo encolheria junto com quem escolhesse texto menor — e o dia em que alguém
 * acrescentar um tamanho menor que o padrão, o alvo cairia abaixo de 44 px sem aviso.
 */
test('CS-DESIGN-004: o alvo de toque nao acompanha o tamanho do texto', async () => {
  const acao = await readFile('componentes/acao.ts', 'utf8')
  assert.match(acao, /min-h-\[44px\]/)
  assert.doesNotMatch(acao, /min-h-\[[\d.]+rem\]/, 'alvo de toque em rem encolhe com o texto')
})
