/**
 * Prova do banco local e do caminho banco -> content/ (docs/03-modelo-de-dados.md).
 *
 * Roda em PGlite `memory://`: Postgres de verdade, descartado ao fim do teste. Nenhum
 * teste toca o diretorio persistente `.dados-locais/`.
 */
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { abrir, aplicarMigrations } from '../scripts/db-local.ts'
import { lerDoBanco } from '../scripts/export-content.ts'
import { semear } from '../scripts/seed-local.ts'
import { verificarConteudo, type Conteudo } from '../scripts/content-schema.ts'

const DIRETORIO = 'fixtures/validos'
let db: PGlite
let fixtures: Conteudo

before(async () => {
  const ler = async (arquivo: string) => JSON.parse(await readFile(resolve(DIRETORIO, arquivo), 'utf8'))
  fixtures = {
    municipios: await ler('municipios.json'),
    pontos: await ler('pontos.json'),
    rotas: await ler('rotas.json'),
    fatos: await ler('fatos.json'),
  }
  db = await abrir('memory://')
  await aplicarMigrations(db)
  await semear(db, fixtures, true)
})

after(async () => {
  await db.close()
})

/**
 * A lista sai do diretorio, nao de uma copia escrita a mao aqui: a copia obrigava a editar
 * este teste a cada migration nova, e um teste que so pede para ser atualizado nao prova
 * nada. O que ele prova agora e que **toda** migration versionada aplicou, em ordem.
 */
async function migrationsNoDisco(): Promise<string[]> {
  const nomes = await readdir('supabase/migrations')
  return nomes.filter((n) => n.endsWith('.sql')).sort()
}

test('as migrations de supabase/migrations aplicam em Postgres de verdade', async () => {
  const { rows } = await db.query<{ nome: string }>('select nome from public._migracoes order by nome')
  assert.deepEqual(rows.map((r) => r.nome), await migrationsNoDisco())
})

/**
 * O protocolo do time exige migration versionada **com up/down**. Sem rollback escrito no
 * mesmo commit, desfazer vira improviso sob pressao, que e exatamente quando nao se
 * improvisa em banco.
 */
test('toda migration tem rollback correspondente em supabase/rollback', async () => {
  const rollbacks = new Set(await readdir('supabase/rollback'))
  const sem = (await migrationsNoDisco()).filter(
    (nome) => !rollbacks.has(nome.replace(/\.sql$/, '.down.sql')),
  )
  assert.deepEqual(sem, [], `migration sem rollback: ${sem.join(', ')}`)
})

test('aplicar duas vezes nao repete migration — o controle e idempotente', async () => {
  const rodadas = await aplicarMigrations(db)
  assert.deepEqual(rodadas, [])
})

test('CS-ARQ-001: o que sai do banco e igual ao que entrou, e passa no validador', async () => {
  const conteudo = await lerDoBanco(db)
  assert.deepEqual(verificarConteudo(conteudo), [])

  const porId = <T extends { id?: string; slug?: string }>(lista: T[]) =>
    new Map(lista.map((item) => [item.id ?? item.slug, item]))

  assert.deepEqual(porId(conteudo.municipios), porId(fixtures.municipios))
  assert.deepEqual(porId(conteudo.pontos), porId(fixtures.pontos))
  assert.deepEqual(porId(conteudo.rotas), porId(fixtures.rotas))
  assert.deepEqual(porId(conteudo.fatos), porId(fixtures.fatos))
})

test('CS-OURO-006: o banco se declara como dado de exemplo, e e isso que trava o export', async () => {
  const { rows } = await db.query<{ dados_de_exemplo: boolean }>('select dados_de_exemplo from costadosol.ambiente where id')
  assert.equal(rows[0]?.dados_de_exemplo, true)
})

test('CS-CONT-003: o banco recusa distancia sem fonte', async () => {
  await assert.rejects(
    () => db.query(`update costadosol.rota set distancia_km = 84 where id = 'rota-do-mar'`),
    /numero_exige_fonte/,
  )
})

test('CS-VAL-001: o banco recusa foto sem credito', async () => {
  await assert.rejects(
    () =>
      db.query(
        `update costadosol.ponto set foto = jsonb_set(foto, '{credito}', '""') where id = 'saquarema-1'`,
      ),
    /foto_tem_credito/,
  )
})

test('CS-CONT-007: o banco recusa texto sem um dos tres idiomas de conteudo', async () => {
  await assert.rejects(
    () => db.query(`update costadosol.ponto set teaser = teaser - 'es' where id = 'saquarema-1'`),
    /teaser_tem_conteudo/,
  )
})

test('CS-OURO-004: o banco recusa um quinto ponto na mesma ordem do municipio', async () => {
  await assert.rejects(
    () =>
      db.query(
        `insert into costadosol.ponto (id, municipio, tipo, categoria, nome, teaser, texto, audio, foto, lat, lon, ordem)
         select 'saquarema-5', municipio, tipo, categoria, nome, teaser, texto, audio, foto, lat, lon, ordem
         from costadosol.ponto where id = 'saquarema-1'`,
      ),
    /ordem_unica_no_municipio/,
  )
})

test('CS-LEAD-002: o banco recusa lead sem consentimento', async () => {
  await assert.rejects(
    () =>
      db.query(
        `insert into abav.leads_abav_2026
           (nome, email, empresa, pais, tipo_negocio, cidades, consentimento, consentimento_texto_versao, lang, session_id)
         values ('Teste','teste@example.org','Empresa','BR','agencia', array['saquarema'], false, 'v1', 'pt', gen_random_uuid())`,
      ),
    /consentimento/,
  )
})

test('CS-LEAD-004: um lead com tres cidades e UMA linha, nao tres', async () => {
  await db.query(
    `insert into abav.leads_abav_2026
       (nome, email, empresa, pais, tipo_negocio, cidades, consentimento, consentimento_texto_versao, lang, session_id)
     values ('Teste','teste@example.org','Empresa','BR','operadora',
             array['saquarema','arraial-do-cabo','cabo-frio'], true, 'v1', 'en', gen_random_uuid())`,
  )
  const { rows } = await db.query<{ total: number; cidades: string[] }>(
    'select count(*)::int as total, max(cidades) as cidades from abav.leads_abav_2026',
  )
  assert.equal(rows[0]?.total, 1)
  assert.equal(rows[0]?.cidades.length, 3)
})

test('CS-LEAD-006: RLS esta ligada na tabela de leads', async () => {
  const { rows } = await db.query<{ relrowsecurity: boolean }>(
    `select relrowsecurity from pg_class where oid = 'abav.leads_abav_2026'::regclass`,
  )
  assert.equal(rows[0]?.relrowsecurity, true)
})

test('CS-LEAD-006: nao existe policy alguma — negar tudo e o padrao', async () => {
  const { rows } = await db.query<{ total: number }>(
    `select count(*)::int as total from pg_policies where schemaname = 'abav' and tablename = 'leads_abav_2026'`,
  )
  assert.equal(rows[0]?.total, 0)
})
