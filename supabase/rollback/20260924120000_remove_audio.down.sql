-- ROLLBACK de 20260924120000_remove_audio.sql
--
-- Recria as colunas `audio` vazias. O conteúdo anterior eram URLs de marcador para
-- arquivos que nunca existiram; não há dado a restaurar. As constraints de três idiomas
-- não voltam: com as colunas vazias, elas recusariam todas as linhas.

alter table costadosol.municipio add column if not exists audio jsonb not null default '{}'::jsonb;
alter table costadosol.ponto add column if not exists audio jsonb not null default '{}'::jsonb;
