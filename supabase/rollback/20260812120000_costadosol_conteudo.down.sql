-- ROLLBACK de 20260812120000_costadosol_conteudo.sql
--
-- ACAO DESTRUTIVA. Nenhum agente executa este arquivo (CS-OURO-008). O operador humano
-- executa, e so depois de dump.
--
-- Impacto: apaga o schema costadosol inteiro — nove municipios, 36 pontos, as fontes de
-- verificacao e as quatro rotas. O conteudo tambem vive em content/*.json, versionado no
-- git (CS-ARQ-002), entao o que se perde aqui e a base de producao, nao o site publicado.
--
-- Rollback do rollback: reaplicar a migration e rodar `npm run db:seed`.

drop schema if exists costadosol cascade;
