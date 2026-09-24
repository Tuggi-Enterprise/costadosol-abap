-- Sai o áudio do projeto — decisão do operador em 24/09/2026.
-- Rollback correspondente: supabase/rollback/20260924120000_remove_audio.down.sql
--
-- **AÇÃO DESTRUTIVA em banco real: o operador humano executa, nenhum agente executa.** Os
-- testes aplicam esta migration só no PGlite em memória.
--
-- Nenhuma faixa foi gravada: as colunas guardavam URLs de marcador (`/audio/<idioma>/...mp3`)
-- apontando para arquivos que nunca existiram. O que se perde é só esse marcador, e o
-- rollback o recria vazio.

alter table costadosol.municipio drop constraint if exists audio_tem_conteudo;
alter table costadosol.municipio drop column if exists audio;

alter table costadosol.ponto drop constraint if exists audio_do_ponto_tem_conteudo;
alter table costadosol.ponto drop column if exists audio;
