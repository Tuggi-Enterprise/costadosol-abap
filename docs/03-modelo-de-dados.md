# 03 — Modelo de dados · Costa do Sol / ABAV Expo 2026

**Dono:** DBA. **Data:** 12/08/2026.
Regras: [00-regras-de-negocio.md](00-regras-de-negocio.md). Arquitetura:
[02-arquitetura.md](02-arquitetura.md).

**Nada neste documento foi executado contra banco nenhum.** Ele é o mapeamento pedido no §16.4
do briefing: o que o contrato de conteúdo exige, o que existe hoje, e o que precisa ser criado ou
preenchido à mão. Execução é do operador humano (`CS-OURO-007`, `CS-OURO-008`).

---

## 1. O que existe hoje: nada, e isso muda a ordem de trabalho

Este repositório é novo e isolado (`CS-ESCOPO-004`). **Não há projeto Supabase designado para
ele** — ver [P-27](01-pendencias.md). Os projetos existentes do Tuggi não servem: misturar
conteúdo de destino e lead de ente público com as tabelas de produto contraria `CS-ESCOPO-004` e
`CS-LEAD-005`.

Consequência prática, e ela é boa para o prazo:

- **`content/*.json` é a fonte operacional até a feira.** Os arquivos são versionados
  (`CS-ARQ-002`) e o site lê deles em tempo de build (`CS-ARQ-001`). O site funciona inteiro sem
  banco algum.
- **O banco entra por duas portas, e só duas:** produção de conteúdo (`export-content.ts`, §3) e
  gravação de leads (§4). A segunda é a única que precisa existir **antes** de 30/09, porque o
  formulário grava ao vivo.
- Se P-27 não for resolvida a tempo, o conteúdo continua sendo escrito à mão nos JSON e a única
  perda é a ferramenta de edição — não o site.

**Ordem recomendada:** criar o projeto e a tabela de leads primeiro (§4, curto), e tratar o
schema de conteúdo (§2) como conveniência de produção, não como bloqueio.

---

## 2. Schema de conteúdo proposto — `costadosol`

Schema dedicado, sem relação com tabelas de produto. Multilíngue em `jsonb` com chaves de idioma,
não em tabela de tradução: são 45 registros e três idiomas de conteúdo (`CS-CONT-007`), e uma
tabela de tradução aqui custaria três joins para economizar nada.

A forma executável está em
[`supabase/migrations/20260812120000_costadosol_conteudo.sql`](../supabase/migrations/20260812120000_costadosol_conteudo.sql),
com o rollback em `supabase/rollback/`. O que está abaixo é a leitura; a migration é a fonte.

```sql
create schema if not exists costadosol;

-- Diz, em uma linha, se este banco carrega marcador ou conteudo aprovado.
-- E o que impede o export de escrever exemplo em content/ (CS-OURO-006).
create table costadosol.ambiente (
  id               boolean primary key default true check (id),
  dados_de_exemplo boolean not null,
  descricao        text not null
);

create table costadosol.municipio (
  slug            text primary key,
  nome            text not null,
  linha           jsonb not null,
  hero_src        text not null,
  hero_alt        jsonb not null,
  hero_credito    text not null,
  audio           jsonb not null,
  secretaria      jsonb not null,
  ordem_alfabetica smallint not null,
  constraint linha_tem_conteudo check (linha ?& array['pt','en','es']),
  constraint hero_alt_tem_conteudo check (hero_alt ?& array['pt','en','es']),
  constraint hero_credito_nao_vazio check (length(trim(hero_credito)) > 0)
);

create table costadosol.ponto (
  id            text primary key,
  municipio     text not null references costadosol.municipio(slug),
  tipo          text not null check (tipo in ('essencial','complementar','inesperado')),
  categoria     text not null check (categoria in ('natureza','historia','cultura','gastronomia','esporte')),
  nome          jsonb not null,
  teaser        jsonb not null,
  texto         jsonb not null,
  audio         jsonb not null,
  foto          jsonb not null,
  lat           double precision not null,
  lon           double precision not null,
  ordem         smallint not null check (ordem between 1 and 4),
  constraint teaser_tem_conteudo check (teaser ?& array['pt','en','es']),
  constraint ordem_unica_no_municipio unique (municipio, ordem)
);

create table costadosol.fonte_verificacao (
  id            bigint generated always as identity primary key,
  ponto_id      text not null references costadosol.ponto(id) on delete cascade,
  afirmacao     text not null,
  url           text not null,
  consultado_em date not null,
  revisor       text not null
);

create table costadosol.rota (
  id                text primary key,
  nome              jsonb not null,
  eixo              jsonb not null,
  cor               text not null,
  geometria         jsonb not null,
  duracao_sugerida  jsonb not null,
  distancia_km      numeric,
  tempo_estimado    text,
  fonte             text,
  pdf               jsonb not null,
  constraint numero_exige_fonte check (
    (distancia_km is null and tempo_estimado is null) or fonte is not null
  )
);

create table costadosol.rota_municipio (
  rota_id    text not null references costadosol.rota(id) on delete cascade,
  municipio  text not null references costadosol.municipio(slug),
  ordem      smallint not null,
  primary key (rota_id, municipio)
);

create table costadosol.rota_ponto (
  rota_id  text not null references costadosol.rota(id) on delete cascade,
  ponto_id text not null references costadosol.ponto(id),
  ordem    smallint not null,
  primary key (rota_id, ponto_id)
);

create table costadosol.fato (
  id         text primary key check (id in ('aereo','wsl','natureza')),
  titulo     jsonb not null,
  numero     text not null,
  texto      jsonb not null,
  fonte_url  text not null,
  fonte_nome text not null,
  confianca  text not null
);
```

### 2.1 Três regras que o banco **não** consegue garantir

O `CHECK` cobre o que é local a uma linha. Estas três são globais, e por isso vivem em
`scripts/validate-content.ts` (`CS-VAL-001`) — e é ali que a prova acontece, não aqui:

| Regra | Por que o banco não cobre |
| :-- | :-- |
| Exatamente 4 pontos por município (`CS-OURO-004`) | agregação entre linhas; um `CHECK` não vê a tabela |
| Cada município em exatamente 2 rotas (`CS-CONT-004`) | idem, e atravessa três tabelas |
| Ausência de "Búzios" / "Região dos Lagos" / "os 10 munic" (`CS-OURO-003`) | é texto livre em `jsonb`, em qualquer campo, em qualquer idioma |

`constraint trigger` resolveria as duas primeiras e custaria uma armadilha: a regra passaria a
existir em dois lugares, e a versão do banco não roda no CI. Uma casa só, e é o validador — que é
também o que roda antes de todo build (`CS-VAL-002`).

### 2.2 O que não existe e precisa ser preenchido à mão

Nenhum destes campos é derivável de nada; alguém digita, e o prazo de 19/09 é sobre eles:

- `linha` dos nove municípios, em 3 idiomas — 27 frases.
- `teaser` (≤180 caracteres) e `texto` dos 36 pontos, em 3 idiomas.
- `fonte_verificacao` de **cada um dos 36 pontos**, com `revisor` nomeado ([P-23](01-pendencias.md)).
- `coords` dos 36 pontos.
- `geometria` das 4 rotas.
- `credito` de toda foto ([P-05](01-pendencias.md)).
- os 3 fatos com fonte ([P-22](01-pendencias.md)).
- 135 arquivos de áudio (45 × 3 idiomas, `CS-CONT-007`).

---

## 3. `scripts/export-content.ts`

Contrato, na ordem em que roda:

1. lê o schema `costadosol` inteiro com a chave de serviço, **na máquina do dev** — nunca em CI,
   nunca no cliente;
2. monta os quatro arquivos na forma exata de `CS-CONT-001` a `CS-CONT-006`;
3. **valida com o mesmo schema de `scripts/content-schema.ts`** antes de escrever um byte
   (`CS-VAL-002`) — o validador é um só, o do build; duas cópias divergiriam no pior momento;
4. escreve `content/*.json` com chaves ordenadas, para o diff do git ser legível;
5. falha com código ≠ 0 e mensagem apontando registro e campo.

O script **não** escreve no banco, em nenhuma hipótese. Fluxo é de mão única: banco → JSON → git.

---

## 4. Leads — `leads_abav_2026`

É a única tabela que existe em tempo de execução, e é a única que guarda dado pessoal. Toca dado
pessoal e chave: **passa por revisão de segurança antes do merge**, sem exceção.

```sql
create schema if not exists abav;

create table abav.leads_abav_2026 (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  nome           text not null,
  email          text not null,
  empresa        text not null,
  pais           text not null,
  tipo_negocio   text not null check (tipo_negocio in
                   ('agencia','operadora','receptivo','imprensa','orgao_publico','outro')),
  cidades        text[] not null check (cardinality(cidades) between 1 and 9),
  consentimento  boolean not null check (consentimento = true),
  consentimento_texto_versao text not null,
  qr_id          text,
  lang           text not null,
  session_id     uuid not null
);

alter table abav.leads_abav_2026 enable row level security;
-- Nenhuma policy: nega tudo. A Function escreve com service role, que ignora RLS.
```

Quatro decisões que não são estilo:

- **`check (consentimento = true)`** — o banco recusa a linha sem consentimento. O checkbox não
  pré-marcado (`CS-LEAD-002`) é a interface; isto é a garantia. Sem ele, um bug de formulário vira
  problema jurídico.
- **`consentimento_texto_versao`** — guarda **qual** texto a pessoa aceitou. O texto de
  `CS-LEAD-003` pode mudar quando [P-20](01-pendencias.md) fechar, e um lead antigo tem de
  continuar provando o que foi aceito naquele dia.
- **RLS ligada sem policy** — nega tudo por padrão. Só a Cloudflare Function, com a chave de
  serviço no ambiente, grava (`CS-LEAD-006`, `CS-OURO-009`). Se a chave anônima vazar, ela não lê
  nem escreve nada aqui.
- **`cidades` como `text[]`, não N linhas** — a submissão é um fato só. Os N eventos de
  `interesse_declarado` (`CS-LEAD-004`) são de analytics, não de banco; confundir os dois faria a
  contagem de leads inflar por município e reproduzir exatamente o erro que `CS-DADO-001` proíbe.

Migration versionada com `up`/`down` em `supabase/migrations/`, escrita pelo DBA e **executada
pelo operador humano**.

### 4.1 O que o `down` não desfaz

O `down` derruba a tabela e leva os leads junto. É ação destrutiva: documentada, nunca executada
por agente. Antes de qualquer `down` em ambiente com dado real, dump primeiro — e o dump tem dado
pessoal, então não vai para o repositório.

---

## 5. Banco local — o que existe hoje

Enquanto [P-27](01-pendencias.md) não fecha, o banco roda **em PGlite**: Postgres de verdade
(18.3) compilado para WASM, em processo, gravando em `.dados-locais/pg`. A máquina de
desenvolvimento não tem Docker, então `supabase start` não era opção.

```bash
npm run db:local              # aplica as migrations pendentes (idempotente)
npm run db:seed               # carrega fixtures/validos e marca o banco como exemplo
npm run db:seed content       # carrega o conteudo real, quando existir
npm run export -- content-dev # banco -> JSON, para desenvolvimento
npm run export                # banco -> content/ — recusa se o banco for de exemplo
```

Três coisas que este banco já garante, e que nenhuma delas era garantida por documento:

- **As migrations aplicam.** O teste roda as duas contra um Postgres limpo. SQL que não executa
  é o defeito mais barato de achar e o mais caro de descobrir tarde.
- **Os `CHECK` recusam o que deviam recusar** — distância sem fonte, foto sem crédito, teaser sem
  `es`, lead sem consentimento, dois pontos na mesma ordem. Cada um tem um teste que tenta violar
  e espera a recusa.
- **O caminho banco → JSON fecha.** O teste semeia, exporta e compara: o que sai é igual ao que
  entrou e passa no validador do build.

**Ao portar para o Supabase:** PGlite embarca Postgres **18**; o Supabase hospedado serve 15/17.
Nada usado nas migrations é novidade da 18 — mas isso se confirma na versão do projeto, não se
assume.

O controle de migrations aplicadas fica em `public._migracoes`, escrito por
`scripts/db-local.ts`. Quando o projeto Supabase existir, quem controla é o CLI do Supabase e
essa tabela deixa de ser usada.

---

## 6. Retenção e exclusão

`CS-LEAD-003` promete, por escrito, que a pessoa pode pedir exclusão. Hoje **não existe** canal
para atender esse pedido, nem prazo de retenção definido — é [P-20](01-pendencias.md), e é
decisão jurídica, não de produto.

Está registrado aqui porque a promessa já está no texto do formulário: publicar o formulário sem
o canal existir é prometer o que não se pode cumprir. A implementação mínima é um endereço de
e-mail monitorado e um procedimento escrito de quem executa a exclusão.
