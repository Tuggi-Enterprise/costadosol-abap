/**
 * Banco local — enquanto nao existe projeto Supabase para este repositorio (P-27).
 *
 * Roda em PGlite: Postgres de verdade (18.3) compilado para WASM, em processo, sem Docker
 * e sem daemon. A maquina aqui nao tem Docker, entao `supabase start` nao e opcao hoje.
 *
 * As migrations sao as mesmas de supabase/migrations/ que vao rodar no Supabase depois —
 * este banco existe para exercita-las, nao para substitui-las.
 *
 * Atencao ao portar: PGlite embarca Postgres 18; o Supabase hospedado hoje serve 15/17.
 * Nada usado nas migrations e novidade de 18, mas confirmar antes de assumir.
 *
 *   npm run db:local      aplica o que estiver pendente (idempotente)
 */
import { mkdir, readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

export const DIRETORIO_DE_DADOS = '.dados-locais/pg'
export const DIRETORIO_DE_MIGRATIONS = 'supabase/migrations'

export async function abrir(dataDir: string = DIRETORIO_DE_DADOS): Promise<PGlite> {
  // PGlite cria o proprio diretorio, mas nao o pai. `memory://` nao tem pai nenhum.
  if (!dataDir.startsWith('memory://')) {
    await mkdir(dirname(resolve(dataDir)), { recursive: true })
  }
  return PGlite.create(dataDir)
}

/** Aplica em ordem de nome de arquivo o que ainda nao foi aplicado. Devolve o que rodou. */
export async function aplicarMigrations(db: PGlite): Promise<string[]> {
  await db.exec(`
    create table if not exists public._migracoes (
      nome text primary key,
      aplicada_em timestamptz not null default now()
    );
  `)

  const aplicadas = await db.query<{ nome: string }>('select nome from public._migracoes')
  const jaAplicadas = new Set(aplicadas.rows.map((r) => r.nome))

  const arquivos = (await readdir(DIRETORIO_DE_MIGRATIONS)).filter((a) => a.endsWith('.sql')).sort()
  const rodadas: string[] = []

  for (const arquivo of arquivos) {
    if (jaAplicadas.has(arquivo)) continue
    const sql = await readFile(resolve(DIRETORIO_DE_MIGRATIONS, arquivo), 'utf8')
    // Cada migration em uma transacao: metade de migration aplicada e pior que nenhuma.
    await db.transaction(async (tx) => {
      await tx.exec(sql)
      await tx.query('insert into public._migracoes (nome) values ($1)', [arquivo])
    })
    rodadas.push(arquivo)
  }
  return rodadas
}

const executadoDiretamente = process.argv[1]?.endsWith('db-local.ts')

if (executadoDiretamente) {
  const db = await abrir()
  const rodadas = await aplicarMigrations(db)
  await db.close()
  console.log(
    rodadas.length === 0
      ? `Banco local em ${DIRETORIO_DE_DADOS}: nada pendente.`
      : `Banco local em ${DIRETORIO_DE_DADOS}: ${rodadas.length} migration(s) aplicada(s):\n  ${rodadas.join('\n  ')}`,
  )
}
