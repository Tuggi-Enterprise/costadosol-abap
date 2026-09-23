/**
 * Leitura tipada de content/ em tempo de build (CS-ARQ-001).
 *
 * Roda no servidor durante `next build`; nenhum byte de content/ chega ao cliente alem
 * do que a pagina renderizada usa. O tipo vem do schema, nao de uma interface escrita a
 * mao — o schema e a fonte (docs/02-arquitetura.md §6).
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  apresentacaoSchema,
  conteudoSchema,
  eventoSchema,
  type Apresentacao,
  type Conteudo,
  type Evento,
  type Municipio,
  type Ponto,
  type Rota,
} from '../scripts/content-schema.ts'

export type { Apresentacao, Conteudo, Evento, Municipio, Ponto, Rota }

const DIRETORIO = process.env['CONTENT_DIR'] ?? 'content'

function carregar(): Conteudo {
  // O bundler avisa sobre leitura de arquivo em Server Component porque ela quebraria em
  // runtime. Aqui nao quebra: toda pagina de conteudo e pre-renderizada no build
  // (CS-ARQ-001), e nenhuma le disco depois disso.
  const ler = (arquivo: string) =>
    JSON.parse(readFileSync(/* turbopackIgnore: true */ resolve(DIRETORIO, arquivo), 'utf8'))
  try {
    return conteudoSchema.parse({
      municipios: ler('municipios.json'),
      pontos: ler('pontos.json'),
      rotas: ler('rotas.json'),
      fatos: ler('fatos.json'),
    })
  } catch (erro) {
    throw new Error(
      `Nao foi possivel ler o conteudo de ${DIRETORIO}/.\n` +
        `content/ esta vazio ate P-03 e P-05 fecharem; em desenvolvimento use CONTENT_DIR=fixtures/validos.\n` +
        `Causa: ${(erro as Error).message}`,
    )
  }
}

let cache: Conteudo | null = null

export function conteudo(): Conteudo {
  cache ??= carregar()
  return cache
}

export function municipios(): Municipio[] {
  return conteudo().municipios
}

export function municipio(slug: string): Municipio {
  const achado = municipios().find((m) => m.slug === slug)
  if (!achado) throw new Error(`municipio desconhecido: ${slug}`)
  return achado
}

/** Os quatro pontos do municipio, na ordem publicada (CS-CONT-002). */
export function pontosDo(slug: string): Ponto[] {
  return conteudo()
    .pontos.filter((p) => p.municipio === slug)
    .sort((a, b) => a.ordem - b.ordem)
}

/** CS-OITO-001: as outras oito, nunca a atual. Em nenhuma das nove paginas. */
export function outrasCidades(slug: string): Municipio[] {
  return municipios().filter((m) => m.slug !== slug)
}

export function rotas(): Rota[] {
  return conteudo().rotas
}

/** Arquivo fora do espelho do banco: ausente vira lista vazia (ver content-schema). */
function lerLista<T>(arquivo: string, schema: { parse: (v: unknown) => T }): T[] {
  const caminho = resolve(DIRETORIO, arquivo)
  if (!existsSync(/* turbopackIgnore: true */ caminho)) return []
  const dados = JSON.parse(readFileSync(/* turbopackIgnore: true */ caminho, 'utf8')) as unknown[]
  return dados.map((item) => schema.parse(item))
}

let apresentacoes: Apresentacao[] | null = null
let agenda: Evento[] | null = null

/** Descricao e galeria do municipio; `null` quando o arquivo ainda nao existe. */
export function apresentacaoDo(slug: string): Apresentacao | null {
  apresentacoes ??= lerLista('apresentacao.json', apresentacaoSchema)
  return apresentacoes.find((a) => a.municipio === slug) ?? null
}

/**
 * Eventos que ainda nao acabaram na data do build, em ordem de inicio. O site e estatico:
 * o corte e o dia do build, e evento vencido some no build seguinte.
 */
export function eventosFuturos(hoje = new Date().toISOString().slice(0, 10)): Evento[] {
  agenda ??= lerLista('eventos.json', eventoSchema)
  return agenda
    .filter((e) => e.fim >= hoje)
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.municipio.localeCompare(b.municipio))
}
