-- ROLLBACK de 20260812120100_abav_leads.sql
--
-- ACAO DESTRUTIVA E IRRECUPERAVEL. Nenhum agente executa este arquivo (CS-OURO-008).
--
-- Impacto: apaga os leads da feira. Diferente do conteudo, lead NAO tem copia em lugar
-- nenhum — nao esta no git, nao esta em planilha (CS-LEAD-005). Dump primeiro, e o dump
-- carrega dado pessoal, entao nao entra no repositorio.
--
-- Antes de executar em ambiente com dado real, confirmar com quem responde pelos dados
-- (P-20: controlador, retencao e canal de exclusao).

drop table if exists abav.leads_abav_2026;
drop schema if exists abav;
