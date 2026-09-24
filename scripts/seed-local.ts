/**
 * Carrega um diretorio de conteudo no banco local (P-27).
 *
 * O conteudo passa pelo MESMO validador do build antes de entrar: banco com dado que o
 * site recusaria e uma armadilha de horas.
 *
 *   npm run db:seed                     carrega fixtures/validos (dado de marcador)
 *   npm run db:seed content             carrega o conteudo real, quando existir
 *
 * Idempotente: reescreve o que ja existe, nunca apaga em massa (CS-OURO-008).
 */
import type { PGlite } from '@electric-sql/pglite'
import { COBERTURA_ROTAS, type Conteudo } from './content-schema.ts'
import { abrir, aplicarMigrations } from './db-local.ts'
import { lerEValidar } from './validate-content.ts'

export async function semear(db: PGlite, conteudo: Conteudo, dadosDeExemplo: boolean): Promise<void> {
  await db.query(
    `insert into costadosol.ambiente (id, dados_de_exemplo, descricao) values (true, $1, $2)
     on conflict (id) do update set dados_de_exemplo = excluded.dados_de_exemplo, descricao = excluded.descricao`,
    [dadosDeExemplo, dadosDeExemplo ? 'marcadores de fixtures/validos' : 'conteudo aprovado'],
  )

  for (const m of conteudo.municipios) {
    await db.query(
      `insert into costadosol.municipio (slug, nome, linha, hero_src, hero_alt, hero_credito, secretaria, redes)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (slug) do update set
         nome = excluded.nome, linha = excluded.linha, hero_src = excluded.hero_src,
         hero_alt = excluded.hero_alt, hero_credito = excluded.hero_credito,
         secretaria = excluded.secretaria, redes = excluded.redes`,
      [m.slug, m.nome, m.linha, m.hero.src, m.hero.alt, m.hero.credito, m.secretaria, JSON.stringify(m.redes)],
    )
  }

  for (const p of conteudo.pontos) {
    await db.query(
      `insert into costadosol.ponto (id, municipio, tipo, categoria, nome, teaser, texto, foto, lat, lon, ordem)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       on conflict (id) do update set
         municipio = excluded.municipio, tipo = excluded.tipo, categoria = excluded.categoria,
         nome = excluded.nome, teaser = excluded.teaser, texto = excluded.texto,
         foto = excluded.foto, lat = excluded.lat, lon = excluded.lon,
         ordem = excluded.ordem`,
      [p.id, p.municipio, p.tipo, p.categoria, p.nome, p.teaser, p.texto, p.foto, p.coords[0], p.coords[1], p.ordem],
    )
    // fonte_verificacao nao tem chave natural: troca o conjunto do ponto, com WHERE.
    await db.query('delete from costadosol.fonte_verificacao where ponto_id = $1', [p.id])
    for (const f of p.fonte_verificacao) {
      await db.query(
        `insert into costadosol.fonte_verificacao (ponto_id, afirmacao, url, consultado_em, revisor)
         values ($1,$2,$3,$4,$5)`,
        [p.id, f.afirmacao, f.url, f.consultado_em, f.revisor],
      )
    }
  }

  for (const r of conteudo.rotas) {
    await db.query(
      `insert into costadosol.rota (id, nome, eixo, cor, geometria, duracao_sugerida, distancia_km, tempo_estimado, fonte, pdf)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do update set
         nome = excluded.nome, eixo = excluded.eixo, cor = excluded.cor, geometria = excluded.geometria,
         duracao_sugerida = excluded.duracao_sugerida, distancia_km = excluded.distancia_km,
         tempo_estimado = excluded.tempo_estimado, fonte = excluded.fonte, pdf = excluded.pdf`,
      [r.id, r.nome, r.eixo, r.cor, r.geometria, r.duracao_sugerida, r.distancia_km, r.tempo_estimado, r.fonte ?? null, r.pdf],
    )
    for (const [ordem, slug] of r.municipios.entries()) {
      await db.query(
        `insert into costadosol.rota_municipio (rota_id, municipio, ordem) values ($1,$2,$3)
         on conflict (rota_id, municipio) do update set ordem = excluded.ordem`,
        [r.id, slug, ordem + 1],
      )
    }
    for (const [ordem, ponto] of r.pontos.entries()) {
      await db.query(
        `insert into costadosol.rota_ponto (rota_id, ponto_id, ordem) values ($1,$2,$3)
         on conflict (rota_id, ponto_id) do update set ordem = excluded.ordem`,
        [r.id, ponto, ordem + 1],
      )
    }
  }

  for (const f of conteudo.fatos) {
    await db.query(
      `insert into costadosol.fato (id, titulo, numero, texto, fonte_url, fonte_nome, confianca)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set
         titulo = excluded.titulo, numero = excluded.numero, texto = excluded.texto,
         fonte_url = excluded.fonte_url, fonte_nome = excluded.fonte_nome, confianca = excluded.confianca`,
      [f.id, f.titulo, f.numero, f.texto, f.fonte_url, f.fonte_nome, f.confianca],
    )
  }

  if (conteudo.rotas.length !== Object.keys(COBERTURA_ROTAS).length) {
    throw new Error('CS-CONT-004: numero de rotas diferente da cobertura da regra')
  }
}

const executadoDiretamente = process.argv[1]?.endsWith('seed-local.ts')

if (executadoDiretamente) {
  const origem = process.argv[2] ?? 'fixtures/validos'
  const { conteudo, falhas } = await lerEValidar(origem)

  if (falhas.length > 0 || !conteudo) {
    console.error(`\n${origem}/ nao passa no validador — o banco nao recebe o que o site recusaria.\n`)
    for (const falha of falhas) console.error(`  [${falha.regra}] ${falha.onde}\n      ${falha.mensagem}`)
    process.exit(1)
  }

  const db = await abrir()
  await aplicarMigrations(db)
  await semear(db, conteudo, origem !== 'content')
  const { rows } = await db.query<{ municipios: number; pontos: number; rotas: number }>(`
    select (select count(*) from costadosol.municipio) as municipios,
           (select count(*) from costadosol.ponto) as pontos,
           (select count(*) from costadosol.rota) as rotas
  `)
  await db.close()

  const total = rows[0]
  console.log(
    `Banco local carregado de ${origem}/: ${total?.municipios} municipios, ${total?.pontos} pontos, ${total?.rotas} rotas` +
      (origem === 'content' ? '.' : ' — marcados como dado de exemplo.'),
  )
}
