/**
 * CS-VAL-001 — falha, nao avisa.
 *
 * Roda no `prebuild`. Le um diretorio de conteudo (padrao `content/`), valida cada
 * arquivo contra o schema e depois aplica as regras que nenhum schema de linha alcanca.
 *
 *   npm run validate                  -> valida content/
 *   npm run validate fixtures/validos -> valida outro diretorio
 */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'
import {
  conteudoSchema,
  fatoSchema,
  municipioSchema,
  pontoSchema,
  rotaSchema,
  verificarConteudo,
  type Conteudo,
  type Falha,
} from './content-schema.ts'

const ARQUIVOS = [
  { nome: 'municipios.json', chave: 'municipios', schema: municipioSchema },
  { nome: 'pontos.json', chave: 'pontos', schema: pontoSchema },
  { nome: 'rotas.json', chave: 'rotas', schema: rotaSchema },
  { nome: 'fatos.json', chave: 'fatos', schema: fatoSchema },
] as const

export type Resultado = { conteudo: Conteudo | null; falhas: Falha[] }

function falhasDoZod(erro: z.ZodError, arquivo: string, indice?: number): Falha[] {
  return erro.issues.map((issue) => ({
    regra: 'CS-VAL-001',
    onde: `${arquivo}${indice === undefined ? '' : `[${indice}]`}${issue.path.length ? `/${issue.path.join('.')}` : ''}`,
    mensagem: issue.message,
  }))
}

export async function lerEValidar(diretorio: string): Promise<Resultado> {
  const falhas: Falha[] = []
  const bruto: Record<string, unknown[]> = {}

  for (const arquivo of ARQUIVOS) {
    const caminho = resolve(diretorio, arquivo.nome)
    let texto: string
    try {
      texto = await readFile(caminho, 'utf8')
    } catch {
      falhas.push({ regra: 'CS-VAL-002', onde: arquivo.nome, mensagem: `arquivo nao encontrado em ${diretorio}` })
      continue
    }

    let dados: unknown
    try {
      dados = JSON.parse(texto)
    } catch (erro) {
      falhas.push({ regra: 'CS-VAL-002', onde: arquivo.nome, mensagem: `JSON invalido: ${(erro as Error).message}` })
      continue
    }

    if (!Array.isArray(dados)) {
      falhas.push({ regra: 'CS-VAL-002', onde: arquivo.nome, mensagem: 'o arquivo precisa ser uma lista' })
      continue
    }

    const validos: unknown[] = []
    for (const [indice, item] of dados.entries()) {
      const resultado = arquivo.schema.safeParse(item)
      if (resultado.success) validos.push(resultado.data)
      else falhas.push(...falhasDoZod(resultado.error, arquivo.nome, indice))
    }
    bruto[arquivo.chave] = validos
  }

  // As regras globais so fazem sentido sobre dado que passou pelo schema; sem isso,
  // uma falha de forma vira dez falhas de regra e ninguem acha a origem.
  if (falhas.length > 0) return { conteudo: null, falhas }

  const conteudo = conteudoSchema.parse(bruto)
  return { conteudo, falhas: verificarConteudo(conteudo) }
}

const executadoDiretamente = process.argv[1]?.endsWith('validate-content.ts')

if (executadoDiretamente) {
  const diretorio = process.argv[2] ?? process.env['CONTENT_DIR'] ?? 'content'
  const { conteudo, falhas } = await lerEValidar(diretorio)

  if (falhas.length > 0) {
    console.error(`\nConteudo invalido em ${diretorio}/ — ${falhas.length} falha(s):\n`)
    for (const falha of falhas) {
      console.error(`  [${falha.regra}] ${falha.onde}\n      ${falha.mensagem}`)
    }
    console.error('\nA regra esta em docs/00-regras-de-negocio.md. O build nao segue.\n')
    process.exit(1)
  }

  const pontos = conteudo?.pontos.length ?? 0
  console.log(`Conteudo valido: ${conteudo?.municipios.length} municipios, ${pontos} pontos, ${conteudo?.rotas.length} rotas.`)
}
