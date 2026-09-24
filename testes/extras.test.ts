/**
 * Prova de apresentacao.json e eventos.json — os dois arquivos fora do espelho do banco,
 * que entraram em 23/09/2026 (ver scripts/content-schema.ts).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  SLUGS,
  apresentacaoSchema,
  eventoSchema,
  paridadeDeApresentacao,
  palavrasProibidasEm,
  type Apresentacao,
} from '../scripts/content-schema.ts'
import { lerEValidar } from '../scripts/validate-content.ts'

const tres = (valor: string) => ({ pt: valor, en: valor, es: valor })
const foto = (n: number) => ({ src: `/img/gal/x-${n}`, alt: tres('Vista'), credito: 'Autor · CC BY 4.0' })

const apresentacao = (municipio: string, fotos = 3): Apresentacao => ({
  municipio,
  descricao: tres('Texto.'),
  fontes: ['https://www.turismo.rj.gov.br/'],
  galeria: Array.from({ length: fotos }, (_, i) => foto(i)),
})

const evento = {
  id: 'festival-do-peixe',
  municipio: 'sao-pedro-da-aldeia',
  inicio: '2026-12-05',
  fim: '2026-12-06',
  data_confirmada: true,
  tipo: 'gastronomia',
  nome: tres('Festival do Peixe'),
  resumo: tres('Festival.'),
  fonte_nome: 'Calendário de Eventos 2026',
  fonte_url: '',
}

test('CS-OURO-004: as dez cidades com galeria do mesmo tamanho passam', () => {
  assert.deepEqual(paridadeDeApresentacao(SLUGS.map((s) => apresentacao(s))), [])
})

test('CS-OURO-004: galeria maior numa cidade é destaque visual e falha', () => {
  const lista = SLUGS.map((s, i) => apresentacao(s, i === 0 ? 4 : 3))
  assert.equal(paridadeDeApresentacao(lista)[0]?.regra, 'CS-OURO-004')
})

test('CS-OURO-004: descrição com mais parágrafos numa cidade é destaque e falha', () => {
  const lista = SLUGS.map((s, i) => ({ ...apresentacao(s), ...(i === 0 && { descricao: tres('Um.\n\nDois.') }) }))
  assert.match(paridadeDeApresentacao(lista)[0]?.mensagem ?? '', /paragrafos/)
})

test('CS-OURO-004: cidade sem apresentação falha', () => {
  const falhas = paridadeDeApresentacao(SLUGS.slice(1).map((s) => apresentacao(s)))
  assert.ok(falhas.some((f) => f.onde.endsWith(SLUGS[0]!)))
})

test('CS-OURO-006: descrição sem fonte não vai ao ar', () => {
  assert.equal(apresentacaoSchema.safeParse({ ...apresentacao('araruama'), fontes: [] }).success, false)
})

test('CS-OURO-006: evento com data não confirmada exige o texto da fonte', () => {
  assert.equal(eventoSchema.safeParse(evento).success, true)
  assert.equal(eventoSchema.safeParse({ ...evento, data_confirmada: false }).success, false)
  const previsto = { ...evento, data_confirmada: false, data_texto: tres('Previsto para dezembro') }
  assert.equal(eventoSchema.safeParse(previsto).success, true)
})

test('evento que termina antes de começar falha', () => {
  assert.equal(eventoSchema.safeParse({ ...evento, fim: '2026-12-01' }).success, false)
})

test('CS-OURO-003: evento fora dos dez municípios falha', () => {
  assert.equal(eventoSchema.safeParse({ ...evento, municipio: 'marica' }).success, false)
})

test('CS-NOME-001: palavra proibida em evento falha', () => {
  const falhas = palavrasProibidasEm([{ ...evento, resumo: tres('Um ' + 'roteiro gastronômico.') }], 'eventos.json')
  assert.equal(falhas[0]?.regra, 'CS-NOME-001')
})

test('CS-VAL-001: content/ publicado passa inteiro, com apresentação e eventos', async () => {
  const { falhas } = await lerEValidar('content')
  assert.deepEqual(falhas, [])
  const eventos = JSON.parse(await readFile('content/eventos.json', 'utf8')) as unknown[]
  assert.ok(eventos.length > 0)
})
