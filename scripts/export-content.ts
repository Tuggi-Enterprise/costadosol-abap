/**
 * Banco -> content/*.json (CS-ARQ-001). Mao unica: este script nunca escreve no banco.
 *
 *   npm run export                 le o banco local, escreve em content/
 *   npm run export -- content-dev  escreve em outro diretorio
 *
 * Duas travas, nesta ordem:
 *   1. content/ so recebe conteudo aprovado. Se o banco estiver marcado como dado de
 *      exemplo (costadosol.ambiente), o script recusa — senao um marcador vira promessa
 *      publicada (CS-OURO-006).
 *   2. valida com o MESMO schema do build antes de escrever um byte (CS-VAL-002).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { conteudoSchema, verificarConteudo, type Conteudo } from './content-schema.ts'
import { abrir } from './db-local.ts'

type LinhaMunicipio = {
  slug: string; nome: string; linha: object; hero_src: string; hero_alt: object
  hero_credito: string; audio: object; secretaria: object; redes: unknown[]; pontos: string[]
}
type LinhaPonto = {
  id: string; municipio: string; tipo: string; categoria: string; nome: object; teaser: object
  texto: object; audio: object; foto: object; lat: number; lon: number; ordem: number
  fonte_verificacao: object[] | null
}
type LinhaRota = {
  id: string; nome: object; eixo: object; cor: string; geometria: unknown; duracao_sugerida: object
  distancia_km: string | number | null; tempo_estimado: string | null; fonte: string | null
  pdf: object; municipios: string[]; pontos: string[]
}

export async function lerDoBanco(db: PGlite): Promise<Conteudo> {
  const municipios = await db.query<LinhaMunicipio>(`
    select m.*, coalesce(
      (select array_agg(p.id order by p.ordem) from costadosol.ponto p where p.municipio = m.slug),
      '{}'
    ) as pontos
    from costadosol.municipio m order by m.slug
  `)

  const pontos = await db.query<LinhaPonto>(`
    select p.*, (
      select json_agg(json_build_object(
        'afirmacao', f.afirmacao, 'url', f.url,
        'consultado_em', to_char(f.consultado_em, 'YYYY-MM-DD'), 'revisor', f.revisor
      ) order by f.id)
      from costadosol.fonte_verificacao f where f.ponto_id = p.id
    ) as fonte_verificacao
    from costadosol.ponto p order by p.municipio, p.ordem
  `)

  const rotas = await db.query<LinhaRota>(`
    select r.*,
      coalesce((select array_agg(rm.municipio order by rm.ordem)
                from costadosol.rota_municipio rm where rm.rota_id = r.id), '{}') as municipios,
      coalesce((select array_agg(rp.ponto_id order by rp.ordem)
                from costadosol.rota_ponto rp where rp.rota_id = r.id), '{}') as pontos
    from costadosol.rota r order by r.id
  `)

  const fatos = await db.query(`select * from costadosol.fato order by id`)

  return conteudoSchema.parse({
    municipios: municipios.rows.map((m) => ({
      slug: m.slug,
      nome: m.nome,
      linha: m.linha,
      hero: { src: m.hero_src, alt: m.hero_alt, credito: m.hero_credito },
      audio: m.audio,
      secretaria: m.secretaria,
      redes: m.redes,
      pontos: m.pontos,
    })),
    pontos: pontos.rows.map((p) => ({
      id: p.id,
      municipio: p.municipio,
      tipo: p.tipo,
      categoria: p.categoria,
      nome: p.nome,
      coords: [p.lat, p.lon],
      teaser: p.teaser,
      texto: p.texto,
      audio: p.audio,
      foto: p.foto,
      fonte_verificacao: p.fonte_verificacao ?? [],
      ordem: p.ordem,
    })),
    rotas: rotas.rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      eixo: r.eixo,
      cor: r.cor,
      municipios: r.municipios,
      pontos: r.pontos,
      geometria: r.geometria,
      duracao_sugerida: r.duracao_sugerida,
      // numeric volta como string no protocolo do Postgres; null continua null.
      distancia_km: r.distancia_km === null ? null : Number(r.distancia_km),
      tempo_estimado: r.tempo_estimado,
      fonte: r.fonte,
      pdf: r.pdf,
    })),
    fatos: fatos.rows,
  })
}

export async function escrever(conteudo: Conteudo, destino: string): Promise<void> {
  await mkdir(destino, { recursive: true })
  for (const [arquivo, dados] of [
    ['municipios.json', conteudo.municipios],
    ['pontos.json', conteudo.pontos],
    ['rotas.json', conteudo.rotas],
    ['fatos.json', conteudo.fatos],
  ] as const) {
    await writeFile(resolve(destino, arquivo), JSON.stringify(dados, null, 2) + '\n', 'utf8')
  }
}

const executadoDiretamente = process.argv[1]?.endsWith('export-content.ts')

if (executadoDiretamente) {
  const destino = process.argv[2] ?? 'content'
  const db = await abrir()

  const ambiente = await db.query<{ dados_de_exemplo: boolean; descricao: string }>(
    'select dados_de_exemplo, descricao from costadosol.ambiente where id',
  )
  const exemplo = ambiente.rows[0]?.dados_de_exemplo ?? true

  if (exemplo && destino === 'content') {
    await db.close()
    console.error(
      '\nRecusado: o banco local carrega dado de exemplo (' +
        (ambiente.rows[0]?.descricao ?? 'nao identificado') +
        ')\ne content/ so recebe conteudo aprovado — CS-OURO-006.\n' +
        'Para desenvolver, exporte para outro diretorio: npm run export -- content-dev\n',
    )
    process.exit(1)
  }

  const conteudo = await lerDoBanco(db)
  await db.close()

  const falhas = verificarConteudo(conteudo)
  if (falhas.length > 0) {
    console.error(`\nO banco tem ${falhas.length} problema(s) — nada foi escrito:\n`)
    for (const falha of falhas) console.error(`  [${falha.regra}] ${falha.onde}\n      ${falha.mensagem}`)
    process.exit(1)
  }

  await escrever(conteudo, destino)
  console.log(`${destino}/: ${conteudo.municipios.length} municipios, ${conteudo.pontos.length} pontos, ${conteudo.rotas.length} rotas.`)
}
