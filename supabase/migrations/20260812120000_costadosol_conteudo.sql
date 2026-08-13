-- Schema de conteudo — docs/03-modelo-de-dados.md secao 2.
-- Rollback correspondente: supabase/rollback/20260812120000_costadosol_conteudo.down.sql
--
-- Multilingue em jsonb com chave de idioma, nao em tabela de traducao: sao 45 registros
-- e tres idiomas de conteudo (CS-CONT-007). Tabela de traducao aqui custaria tres joins
-- para economizar nada.

create schema if not exists costadosol;

-- Diz, em uma linha, se este banco carrega dado de marcador ou conteudo de verdade.
-- E o que impede scripts/export-content.ts de escrever exemplo em content/ (CS-OURO-006).
create table if not exists costadosol.ambiente (
  id                boolean primary key default true check (id),
  dados_de_exemplo  boolean not null,
  descricao         text not null
);

create table if not exists costadosol.municipio (
  slug             text primary key,
  nome             text not null,
  linha            jsonb not null,
  hero_src         text not null,
  hero_alt         jsonb not null,
  hero_credito     text not null,
  audio            jsonb not null,
  secretaria       jsonb not null,
  constraint linha_tem_conteudo check (linha ?& array['pt','en','es']),
  constraint hero_alt_tem_conteudo check (hero_alt ?& array['pt','en','es']),
  constraint audio_tem_conteudo check (audio ?& array['pt','en','es']),
  constraint hero_credito_nao_vazio check (length(trim(hero_credito)) > 0)
);

create table if not exists costadosol.ponto (
  id         text primary key,
  municipio  text not null references costadosol.municipio(slug),
  tipo       text not null check (tipo in ('essencial','complementar','inesperado')),
  categoria  text not null check (categoria in ('natureza','historia','cultura','gastronomia','esporte')),
  nome       jsonb not null,
  teaser     jsonb not null,
  texto      jsonb not null,
  audio      jsonb not null,
  foto       jsonb not null,
  lat        double precision not null,
  lon        double precision not null,
  ordem      smallint not null check (ordem between 1 and 4),
  constraint teaser_tem_conteudo check (teaser ?& array['pt','en','es']),
  constraint texto_tem_conteudo check (texto ?& array['pt','en','es']),
  constraint audio_do_ponto_tem_conteudo check (audio ?& array['pt','en','es']),
  constraint foto_tem_credito check (length(trim(foto->>'credito')) > 0),
  constraint ordem_unica_no_municipio unique (municipio, ordem)
);

create index if not exists ponto_por_municipio on costadosol.ponto (municipio, ordem);

create table if not exists costadosol.fonte_verificacao (
  id             bigint generated always as identity primary key,
  ponto_id       text not null references costadosol.ponto(id) on delete cascade,
  afirmacao      text not null,
  url            text not null,
  consultado_em  date not null,
  revisor        text not null
);

create index if not exists fonte_por_ponto on costadosol.fonte_verificacao (ponto_id);

create table if not exists costadosol.rota (
  id                text primary key,
  nome              jsonb not null,
  eixo              jsonb not null,
  cor               text not null check (cor ~ '^#[0-9a-fA-F]{6}$'),
  geometria         jsonb not null,
  duracao_sugerida  jsonb not null,
  distancia_km      numeric,
  tempo_estimado    text,
  fonte             text,
  pdf               jsonb not null,
  -- CS-CONT-003: numero de distancia ou tempo so existe com fonte apurada. Nunca estimar.
  constraint numero_exige_fonte check (
    (distancia_km is null and tempo_estimado is null) or fonte is not null
  )
);

create table if not exists costadosol.rota_municipio (
  rota_id    text not null references costadosol.rota(id) on delete cascade,
  municipio  text not null references costadosol.municipio(slug),
  ordem      smallint not null,
  primary key (rota_id, municipio)
);

create table if not exists costadosol.rota_ponto (
  rota_id   text not null references costadosol.rota(id) on delete cascade,
  ponto_id  text not null references costadosol.ponto(id),
  ordem     smallint not null,
  primary key (rota_id, ponto_id)
);

create table if not exists costadosol.fato (
  id          text primary key check (id in ('aereo','wsl','natureza')),
  titulo      jsonb not null,
  numero      text not null,
  texto       jsonb not null,
  fonte_url   text not null,
  fonte_nome  text not null,
  confianca   text not null check (confianca in ('alta','media','baixa'))
);

-- As tres regras que nenhum CHECK alcanca — 4 pontos por municipio, cada municipio em
-- 2 rotas, e palavra proibida em texto livre — vivem em scripts/validate-content.ts.
-- Uma casa so: a versao do banco nao roda no CI, e duas casas divergem no pior momento.
