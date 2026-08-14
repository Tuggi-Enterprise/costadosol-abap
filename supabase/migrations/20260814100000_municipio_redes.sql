-- CS-MUN-005 — canais de rede social por municipio.
-- Rollback correspondente: supabase/rollback/20260814100000_municipio_redes.down.sql
--
-- Aditiva: cria uma coluna com default e nao toca em nenhum dado existente. Nao ha
-- `DROP`, `TRUNCATE` nem `UPDATE` sem `WHERE` aqui, entao ela roda sozinha; o que exige
-- mao humana e o rollback, que apaga a coluna.
--
-- **jsonb e nao tabela filha, e a razao e a mesma do resto do schema:** sao dez registros
-- com um item cada, lidos sempre inteiros junto do municipio. Tabela filha custaria um
-- join para economizar nada, e a lista ja e validada em Zod por scripts/content-schema.ts
-- antes de chegar aqui.
--
-- **`default '[]'` existe so para a migration aplicar sobre linha ja gravada.** O piso de
-- verdade e CS-MUN-005 (pelo menos um canal por municipio) e ele mora no schema Zod, que
-- e quem recusa o conteudo antes do build. O check abaixo garante a forma, nao a
-- quantidade: banco vazio no meio de um seed nao pode falhar por causa de ordem de insert.

alter table costadosol.municipio
  add column if not exists redes jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'redes_e_lista'
  ) then
    alter table costadosol.municipio
      add constraint redes_e_lista check (jsonb_typeof(redes) = 'array');
  end if;
end $$;

comment on column costadosol.municipio.redes is
  'CS-MUN-005: [{rede, perfil, url, dono, fonte, consultado_em}]. Conta da Secretaria de '
  'Turismo quando existe; da prefeitura quando nao existe (dono diz qual). O piso de um '
  'canal por municipio e de CS-MUN-005, verificado em scripts/content-schema.ts.';
