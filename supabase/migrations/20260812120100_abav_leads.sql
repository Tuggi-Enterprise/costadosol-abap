-- Leads do formulario — docs/03-modelo-de-dados.md secao 4.
-- Rollback correspondente: supabase/rollback/20260812120100_abav_leads.down.sql
--
-- E a unica tabela que existe em tempo de execucao e a unica que guarda dado pessoal.
-- Toca dado pessoal e chave: passa por revisao de seguranca antes do merge.

create schema if not exists abav;

create table if not exists abav.leads_abav_2026 (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nome          text not null check (length(trim(nome)) > 0),
  email         text not null check (position('@' in email) > 1),
  empresa       text not null check (length(trim(empresa)) > 0),
  pais          text not null,
  tipo_negocio  text not null check (tipo_negocio in
                  ('agencia','operadora','receptivo','imprensa','orgao_publico','outro')),
  cidades       text[] not null check (cardinality(cidades) between 1 and 9),
  -- CS-LEAD-002: o checkbox nao pre-marcado e a interface; este check e a garantia.
  consentimento boolean not null check (consentimento),
  -- Guarda QUAL texto a pessoa aceitou: o de CS-LEAD-003 pode mudar quando P-20 fechar,
  -- e um lead antigo tem de continuar provando o que foi aceito naquele dia.
  consentimento_texto_versao text not null,
  qr_id         text,
  lang          text not null check (lang in ('pt','en','es','fr','it','de','zh','ko')),
  session_id    uuid not null
);

create index if not exists leads_por_data on abav.leads_abav_2026 (created_at);

-- RLS ligada e SEM policy: nega tudo. So a Cloudflare Function, com a chave de servico
-- no ambiente, grava (CS-LEAD-006, CS-OURO-009). Chave anonima vazada nao le nem escreve.
alter table abav.leads_abav_2026 enable row level security;
