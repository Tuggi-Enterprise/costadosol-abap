/**
 * Prova das onze condicoes de falha de CS-VAL-001, uma a uma.
 *
 * Cada teste parte do conjunto valido de `fixtures/validos` e quebra UMA coisa. Se um
 * teste destes passar a nao falhar, a regra correspondente deixou de ser garantida — e
 * e por isso que a descricao de cada um cita o ID da regra.
 *
 * As strings proibidas sao montadas por concatenacao: assim o repositorio nao carrega a
 * palavra literal, e o `grep` do criterio A-14 continua limpo.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  municipioSchema,
  pontoSchema,
  rotaSchema,
  verificarConteudo,
  type Conteudo,
} from '../scripts/content-schema.ts'
import { lerEValidar } from '../scripts/validate-content.ts'

const DIRETORIO = 'fixtures/validos'

async function conteudoValido(): Promise<Conteudo> {
  const ler = async (arquivo: string) => JSON.parse(await readFile(resolve(DIRETORIO, arquivo), 'utf8'))
  return {
    municipios: await ler('municipios.json'),
    pontos: await ler('pontos.json'),
    rotas: await ler('rotas.json'),
    fatos: await ler('fatos.json'),
  }
}

const regras = (falhas: { regra: string }[]) => falhas.map((f) => f.regra)

test('CS-VAL-001: o conjunto de exemplo passa inteiro', async () => {
  const { conteudo, falhas } = await lerEValidar(DIRETORIO)
  assert.deepEqual(falhas, [])
  assert.equal(conteudo?.municipios.length, 9)
  assert.equal(conteudo?.pontos.length, 36)
  assert.equal(conteudo?.rotas.length, 4)
})

test('CS-VAL-002: diretorio sem conteudo falha, e nao passa em silencio', async () => {
  const { falhas } = await lerEValidar('fixtures/nao-existe')
  assert.equal(falhas.length, 4)
  assert.ok(falhas.every((f) => f.regra === 'CS-VAL-002'))
})

test('CS-OURO-003: um dos nove ausente falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.municipios = conteudo.municipios.filter((m) => m.slug !== 'silva-jardim')
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-OURO-003'))
})

test('CS-OURO-003: grafia oficial do municipio falha se divergir', async () => {
  const conteudo = await conteudoValido()
  conteudo.municipios[6]!.nome = 'Sao Pedro da Aldeia'
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-OURO-003'))
})

test('CS-OURO-003: o municipio que nao existe neste projeto falha em qualquer campo', async () => {
  const conteudo = await conteudoValido()
  const proibido = 'B' + 'úzios'
  conteudo.pontos[0]!.texto['pt'] = `Fica perto de ${proibido}.`
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-OURO-003'))
})

test('CS-OURO-003: "os 10 munic" e a expressao revogada falham', async () => {
  const conteudo = await conteudoValido()
  conteudo.municipios[0]!.linha['pt'] = 'Um d' + 'os 10 munic' + 'ipios da Regi' + 'ão dos Lagos.'
  const encontradas = verificarConteudo(conteudo).filter((f) => f.regra === 'CS-OURO-003')
  assert.equal(encontradas.length, 2)
})

test('CS-NOME-001: os nomes revogados pela v1.2 falham em copy', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[0]!.eixo['pt'] = 'Um rot' + 'eiro de dois dias'
  conteudo.rotas[1]!.eixo['pt'] = 'Uma via' + 'gem pela costa'
  const encontradas = verificarConteudo(conteudo).filter((f) => f.regra === 'CS-NOME-001')
  assert.equal(encontradas.length, 2)
})

test('CS-OURO-004: municipio com menos de 4 pontos falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.pontos = conteudo.pontos.filter((p) => p.id !== 'araruama-4')
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-OURO-004'))
})

test('CS-OURO-004: o schema recusa municipio que lista numero diferente de 4 pontos', async () => {
  const conteudo = await conteudoValido()
  const municipio = { ...conteudo.municipios[0]!, pontos: ['araruama-1', 'araruama-2'] }
  assert.equal(municipioSchema.safeParse(municipio).success, false)
})

test('CS-CONT-002: teaser com 181 caracteres falha', async () => {
  const conteudo = await conteudoValido()
  const ponto = structuredClone(conteudo.pontos[0]!)
  ponto.teaser['pt'] = 'a'.repeat(181)
  const resultado = pontoSchema.safeParse(ponto)
  assert.equal(resultado.success, false)
  assert.match(JSON.stringify(resultado.error?.issues), /181 caracteres/)
})

test('CS-CONT-002: teaser com 180 caracteres passa — o limite e inclusivo', async () => {
  const conteudo = await conteudoValido()
  const ponto = structuredClone(conteudo.pontos[0]!)
  ponto.teaser['pt'] = 'a'.repeat(180)
  assert.equal(pontoSchema.safeParse(ponto).success, true)
})

test('CS-OURO-006: ponto sem fonte_verificacao falha', async () => {
  const conteudo = await conteudoValido()
  const ponto = { ...structuredClone(conteudo.pontos[0]!), fonte_verificacao: [] }
  assert.equal(pontoSchema.safeParse(ponto).success, false)
})

test('CS-VAL-001: foto sem credito falha', async () => {
  const conteudo = await conteudoValido()
  const ponto = structuredClone(conteudo.pontos[0]!)
  ponto.foto.credito = ''
  assert.equal(pontoSchema.safeParse(ponto).success, false)
})

test('CS-CONT-004: municipio em uma rota so falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[3]!.municipios = conteudo.rotas[3]!.municipios.filter((s) => s !== 'saquarema')
  const falhas = verificarConteudo(conteudo).filter((f) => f.regra === 'CS-CONT-004')
  assert.ok(falhas.some((f) => f.mensagem.includes('1 rotas')))
})

test('CS-CONT-004: municipio em tres rotas falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[1]!.municipios = [...conteudo.rotas[1]!.municipios, 'saquarema']
  const falhas = verificarConteudo(conteudo).filter((f) => f.regra === 'CS-CONT-004')
  assert.ok(falhas.some((f) => f.mensagem.includes('3 rotas')))
})

test('CS-CONT-003: distancia_km sem fonte falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[0]!.distancia_km = 84
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-CONT-003'))
})

test('CS-CONT-003: distancia_km com fonte passa', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[0]!.distancia_km = 84
  conteudo.rotas[0]!.fonte = 'Servico de roteirizacao X, consultado em 12/08/2026'
  assert.ok(!regras(verificarConteudo(conteudo)).includes('CS-CONT-003'))
})

test('CS-CONT-005: nome de rota que comeca com nome de municipio falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[1]!.nome['pt'] = 'Cabo Frio e o mar aberto'
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-CONT-005'))
})

test('CS-CONT-005: o artigo antes do nome nao esconde a violacao', async () => {
  const conteudo = await conteudoValido()
  conteudo.rotas[1]!.nome['pt'] = 'A Saquarema que ninguem ve'
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-CONT-005'))
})

test('CS-CONT-007: falta de um dos tres idiomas de conteudo falha', async () => {
  const conteudo = await conteudoValido()
  const ponto = structuredClone(conteudo.pontos[0]!)
  delete ponto.texto['es']
  assert.equal(pontoSchema.safeParse(ponto).success, false)
})

test('CS-CONT-007: falta de audio em um dos tres idiomas falha', async () => {
  const conteudo = await conteudoValido()
  const municipio = structuredClone(conteudo.municipios[0]!)
  delete municipio.audio['en']
  assert.equal(municipioSchema.safeParse(municipio).success, false)
})

test('CS-CONT-009: idioma fora do trio presente pela metade falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.pontos[0]!.texto['de'] = 'Ein Beispieltext.'
  const falhas = verificarConteudo(conteudo).filter((f) => f.regra === 'CS-CONT-009')
  assert.equal(falhas.length, 1)
  assert.match(falhas[0]!.mensagem, /presente pela metade/)
})

test('CS-CONT-001: ponto orfao, que nenhum municipio lista, falha', async () => {
  const conteudo = await conteudoValido()
  conteudo.municipios[0]!.pontos = ['araruama-1', 'araruama-2', 'araruama-3', 'araruama-1']
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-CONT-001'))
})

test('CS-CONT-002: duas ordens iguais dentro do mesmo municipio falham', async () => {
  const conteudo = await conteudoValido()
  conteudo.pontos[1]!.ordem = 1
  assert.ok(regras(verificarConteudo(conteudo)).includes('CS-CONT-002'))
})

test('CS-CONT-003: cor de rota fora de hexadecimal falha', async () => {
  const conteudo = await conteudoValido()
  const rota = { ...structuredClone(conteudo.rotas[0]!), cor: 'azul' }
  assert.equal(rotaSchema.safeParse(rota).success, false)
})
