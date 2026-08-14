-- ROLLBACK de 20260814100000_municipio_redes.sql
--
-- **AÇÃO DESTRUTIVA — o operador humano executa, nenhum agente executa.**
--
-- Impacto: apaga a coluna `redes` de `costadosol.municipio` e, com ela, os dez perfis de
-- rede social e a procedência de cada um (`fonte`, `consultado_em`). O levantamento que os
-- produziu está em `scripts/compor-conteudo.ts` (constante `REDES`) e em
-- `content/municipios.json`, então o dado é reconstruível por `npm run conteudo` seguido de
-- `npm run db:seed` — mas só enquanto esses dois arquivos existirem.
--
-- Antes de executar: confirme que `content/municipios.json` está no git com os perfis
-- dentro. Depois de executar, o build recusa o conteúdo até `redes` sair também do schema
-- Zod, porque CS-MUN-005 exige pelo menos um canal por município.

alter table costadosol.municipio
  drop constraint if exists redes_e_lista;

alter table costadosol.municipio
  drop column if exists redes;
