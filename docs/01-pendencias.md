# 01 — Pendências · Costa do Sol / ABAV Expo 2026

**Dono:** Product Owner. Lista viva — atualizada a cada resposta recebida.
**Última atualização:** 12/08/2026.

Duas classes, e elas se resolvem em lugares diferentes:

- **Bloco A — pendências com o cliente** (P-01 a P-09): dependem do Conderlagos ou das nove
  secretarias. Só o operador humano cobra.
- **Bloco B — ambiguidades do briefing** (P-10 a P-26): dependem de uma decisão interna ou de uma
  confirmação em fonte oficial. Nenhum agente resolve sozinho (CS-OURO-008); as que já têm
  encaminhamento proposto estão marcadas como tal e esperam só o "sim".

**Prazo duro que rege tudo:** congelamento de conteúdo em **19/09/2026**; feira de 30/09 a
02/10/2026.

---

## Bloco A — com o cliente

| # | Pendência | Bloqueia | Prazo |
| :-- | :-- | :-- | :-- |
| P-01 | Manual de marca, logotipo e paleta do Conderlagos | design system inteiro | urgente |
| P-02 | Grafia exata do nome e do cargo do presidente | rodapé e release | 19/09 |
| P-03 | Aprovação da lista dos 36 pontos | conteúdo, áudio, fotos — tudo a jusante | urgente |
| P-04 | Distâncias e tempos entre municípios de cada rota, apurados em fonte de roteirização | campos `distancia_km` e `tempo_estimado` | 19/09 |
| P-05 | Banco de fotos das nove secretarias | hero e cards; sem foto o município entra em fila de licenciamento | **22/08 — duro** |
| P-06 | Gravação de 20 s da voz do presidente | produção de áudio da home | urgente |
| P-07 | Regras de visitação do Parque Ecológico Mico-Leão-Dourado (Silva Jardim) | ponto de Silva Jardim | 19/09 |
| P-08 | Planta e metragem do estande | nº de pontos de acesso wi-fi e divisórias | crítico |
| P-09 | Confirmação de que são nove mesas nomeadas por município, e quem opera cada uma | CS-NAV-001 e toda a leitura de dado por mesa | crítico |
| P-09b | Decisão sobre fones: dois pares no ponto central (recomendado) ou um par por mesa | custo ~9× maior na segunda opção | 19/09 |

**P-01** — Até chegar, o design roda com tokens neutros e nenhuma cor codificada em componente
(CS-DESIGN-003). Quanto mais tarde chegar, mais caro fica trocar.

**P-04** — Enquanto não houver fonte, os campos ficam `null` e o site publica as rotas **sem**
tempos. **Não estimar** (CS-CONT-003). A alternativa é decidir publicar sem tempos de vez.

**P-05** — É a pendência com o pior custo de atraso: sem foto não há hero, não há card, não há
`og:image`, e licenciamento de banco de imagem leva dias.

**P-07** — Reserva biológica tem restrição legal de visitação e o parque ecológico é outra coisa.
Não publicar nada antes de confirmar com a secretaria.

**P-08 / P-09** — Viraram críticos com a mudança para uma mesa por município: uma mesa sem sinal
é uma mesa cujo QR não funciona, e o prefeito daquele município vai perceber.

---

## Bloco B — ambiguidades do briefing

### P-10 · Qual analytics, e ele suporta propriedades de evento?

O briefing diz "Umami ou Plausible auto-hospedado". A taxonomia de CS-EVT-003 depende de eventos
com **várias propriedades** (`municipio_open` tem cinco) e o painel depende de conseguir cruzar
duas delas (matriz 9×9 de `entry_municipio` × `municipio`). Nem toda ferramenta cookieless faz
isso na versão auto-hospedada, e o painel inteiro do §10.1 morre se não fizer.

**Ninguém escolhe por preferência.** Confirmar na documentação oficial, na versão que vamos
hospedar: (a) propriedades customizadas por evento, quantas e de que tipo; (b) API de leitura
para alimentar `/painel`; (c) retenção de dado bruto no plano auto-hospedado.
**Situação em 12/08/2026:** não há instância hospedada ainda. O Fullstack verifica em documentação
oficial e propõe, com a verificação anexada; Product Owner homologa.
**Bloqueia:** semana 3 (instrumentação, CS-EVT-005) — e, junto com P-15, a hospedagem toda.

### P-11 · O basemap do mapa rotula Búzios

CS-OURO-003 proíbe Búzios em traçado **e em rótulo**. O PMTiles da região, derivado de OSM,
traz Búzios rotulado como qualquer outro município vizinho — e o mapa da home é a peça mais
visível do site. Isso não é detalhe de estilo: é a regra de ouro mais política do projeto sendo
violada por padrão da ferramenta.

**Opções:** (a) estilo que suprima rótulos de lugar fora dos nove, mantendo a geografia;
(b) basemap sem rótulo nenhum, com os nove rótulos desenhados por nós; (c) cair para SVG
estilizado (já previsto em CS-HOME-004 como plano de peso).
**Encaminhamento proposto:** (b) — resolve o rótulo e ainda tira peso; nenhuma cidade vizinha
aparece nomeada, o que é defensável como escolha cartográfica.
**Decide:** UX/UI + Fullstack. **Bloqueia:** implementação do mapa.

### ~~P-12 · Nomenclatura residual da v1.2~~ — RESOLVIDA em 12/08/2026

Ver "O que já está decidido", ao final.

### P-13 · "Cinco lugares, nenhuma busca."

Encerramento fixo do "ouvir a rota", mas a `costa-do-sol-inteira` atravessa nove municípios e
não terá cinco pontos. Número em copy sem lastro no dado viola CS-OURO-006.

**Encaminhamento proposto:** contagem dinâmica a partir de `rotas.json`. A segunda metade da
frase ("nenhuma busca") precisa de leitura do UX/UI quanto a CS-OURO-001.
**Decide:** UX/UI. **Bloqueia:** copy da página de rota.

### ~~P-14 · Cobertura real dos oito idiomas~~ — RESOLVIDA em 12/08/2026

Ver "O que já está decidido", ao final. Deixou um resíduo pequeno, **P-14b**.

### ~~P-14b · A barra mostra oito idiomas e cinco deles servem conteúdo em inglês~~ — RESOLVIDA em 13/08/2026

O operador cortou o site para **três idiomas** (`pt`, `en`, `es`), e o risco descrito aqui deixou
de existir: cada idioma oferecido serve interface, conteúdo e áudio no próprio idioma. Regras
atualizadas: CS-NAV-006, CS-CONT-007, CS-CONT-009. A ordem de expansão continua registrada em
CS-CONT-009, e agora um idioma novo só entra com o pacote inteiro.

### P-15 · Como o `/painel` lê o dado sem credencial no cliente

CS-OURO-009 proíbe chave no cliente, e `/painel` precisa consultar a API do analytics. Uma página
estática com token de leitura embutido entrega o dado de nove prefeituras a quem abrir o
DevTools.

**Encaminhamento proposto:** Cloudflare Function como proxy de leitura, atrás do mesmo basic auth,
com o token só no ambiente da Function — mesmo padrão do endpoint de leads (CS-LEAD-006).
**Decide:** Fullstack. **Bloqueia:** implementação do painel.

### P-16 · Distribuição dos tipos de ponto

`tipo ∈ {essencial, complementar, inesperado}` e cada município tem exatamente 4 pontos, mas a
distribuição não está definida. Se um município tiver 4 essenciais e outro 1, a paridade
(CS-OURO-004) quebra na percepção mesmo com a contagem igual.

**Opções:** (a) mesma distribuição obrigatória nos nove, validada no build; (b) livre, com o
`tipo` sem efeito visual nenhum.
**Decide:** Product Owner. **Bloqueia:** regra 1 de CS-VAL-001.

### P-17 · Geração das `og:image` por município

CS-MUN-003 pede `og:image` com o nome do município renderizado sobre a foto. Falta decidir se é
gerada no build (dependência de renderização de imagem) ou entregue pronta pelo design, nove
arquivos à mão.
**Decide:** Fullstack + UX/UI. **Impacto:** tempo de build vs. trabalho manual repetido a cada
troca de foto.

### P-18 · Onde `session_start` dispara na entrada por mesa

A página de redirect (CS-NAV-002) tem 2 KB e nenhum framework — não carrega o helper de tracking.
Se `session_start` disparar só depois do `location.replace`, ele precisa ler `qr_id` e
`entry_municipio` do `sessionStorage`, e a sessão que abandona durante o redirect nunca é contada.

**Encaminhamento proposto:** disparar na página de destino, lendo do `sessionStorage`. Perde-se o
abandono no redirect, que é desprezível e assim mesmo precisa estar escrito no painel.
**Decide:** Fullstack. **Bloqueia:** a coluna "entrada" do painel — o dado de fluxo por mesa.

### P-19 · Bandeira não é idioma

CS-NAV-006 lista oito idiomas e o briefing fala em "8 bandeiras". Bandeira representa país, não
idioma: `es` tem mais de vinte países, `zh` esbarra em escolha politicamente carregada, e o
público é comprador internacional.

**Opções:** (a) nome do idioma no próprio idioma ("Português", "English", "Español") — padrão da
indústria; (b) bandeira + nome; (c) só bandeira, como no briefing.
**Encaminhamento proposto:** (a), e é o que está no ar desde 13/08/2026, agora em `<option>` com
`lang` próprio. Com três idiomas latinos o argumento contra a bandeira ficou mais fraco, mas
continua valendo para `es`.
**Decide:** UX/UI + Product Owner. **Bloqueia:** nada — implementado.

### P-20 · LGPD dos leads

CS-LEAD-003 nomeia Conderlagos **e** Tuggi como destinatários. Falta definir, e o texto exibido
depende disso: quem é o controlador e quem é o operador; por quanto tempo o dado fica; qual canal
atende o pedido de exclusão que o próprio texto promete; e se há aviso de privacidade linkado.
**Decide:** humano (é decisão jurídica, não de produto). **Bloqueia:** publicação do formulário.

### P-21 · A rota `costa-do-sol-inteira` cabe num PDF de uma página?

Nove municípios, e CS-VENDE-001 promete "PDF de uma página" para cada rota. Também falta definir
quantos pontos ela lista em `pontos[]` — todos os 36 tornariam a página de rota longa demais para
o padrão de 60 segundos no balcão.
**Decide:** Product Owner + UX/UI. **Bloqueia:** `rotas.json` e o layout da página de rota.

### P-22 · Fonte dos três fatos da home

`fatos.json` fixa os ids `aereo`, `wsl` e `natureza`, mas os números e as fontes não existem
ainda. Sem `fonte_url` e `fonte_nome`, os três fatos não vão ao ar (CS-OURO-006) — e são a
primeira dobra depois do hero.
**Decide:** Product Owner busca a fonte; humano confirma se pode citar.
**Bloqueia:** seção de fatos da home.

### P-23 · Quem revisa a tradução — **reduzida** em 13/08/2026

Era sobre oito idiomas, incluindo `zh` e `ko`. Com o corte para `pt`, `en` e `es` (CS-NAV-006),
some a parte que não tinha como ser revisada aqui dentro; **fica** a que sempre importou: `en` e
`es` são material institucional de ente público, e erro de tradução em nome próprio ou em nome de
praia é o defeito que aparece na foto que o gabinete posta. Falta definir o revisor humano dos
dois. Os textos de conteúdo continuam marcados com `revisor` em `fonte_verificacao`.
**Decide:** humano. **Bloqueia:** congelamento de 19/09.

### P-24 · A palavra da presidência nos outros sete idiomas

CS-HOME-002 pede 20 s na voz do presidente. P-06 destrava só o português. Falta decidir: legenda
em texto nos outros sete, versão dublada, ou o card só aparece em `pt`.
**Decide:** Product Owner + humano. **Bloqueia:** produção de áudio da home.

### P-25 · Senha do painel — quem tem, e quantas

CS-PAINEL-001 pede basic auth. Uma senha só, compartilhada entre presidência e nove prefeituras,
não permite revogar acesso de ninguém isoladamente e não distingue quem viu o quê. O recorte
individual por município (CS-PAINEL-002, bloco 10) sugere que cada prefeitura veria o próprio
bloco — mas o painel é uma URL única para todos.
**Opções:** (a) uma senha para todos, PDF por município distribuído pela presidência (mais
simples, e é o que o briefing descreve); (b) uma senha por prefeitura.
**Encaminhamento proposto:** (a) para a feira; (b) só se o cliente pedir.
**Decide:** humano.

### P-26 · Protótipo do painel

CS-PAINEL-003 cita `painel-conderlagos-amostra.html` como referência. **O arquivo não está no
repositório.** Sem ele, a estrutura e os cortes são reconstruídos por leitura do §10.1, o que
diverge do que o cliente já viu.
**Precisa:** o humano colocar o arquivo em `docs/referencia/`. **Bloqueia:** layout do painel.

### P-29 · As duas expressões autorizadas por CS-OURO-003 são factualmente falsas

**Esta é a pendência mais grave da lista, e ela bloqueia copy — não desenho, não código.**

CS-OURO-003 autoriza duas expressões e proíbe as outras: *"os nove municípios do
Conderlagos"* e *"Costa do Sol"*. A apuração em fonte oficial, em 12/08/2026, mostra que
nenhuma das duas descreve o conjunto de nove deste projeto:

| Fato apurado | Fonte |
| :-- | :-- |
| O **Conderlagos tem dez municípios**, incluindo Armação de Búzios. Criado em 17/10/2025; presidente Carlos Augusto Balthazar (Rio das Ostras), vice Lucimar Vidal (Saquarema) | [Prefeitura de Saquarema](https://www.saquarema.rj.gov.br/municipios-da-costa-do-sol-criam-novo-consorcio-intermunicipal-que-une-forcas-por-um-desenvolvimento-conjunto/) |
| A **região turística Costa do Sol tem treze municípios** — inclui Búzios, Macaé, Maricá, Quissamã e Carapebus — e **não inclui Silva Jardim** | [Setur-RJ](https://www.turismo.rj.gov.br/regioes/costa-do-sol/) |
| Existe um **Parque Estadual da Costa do Sol** (Decreto 42.929/2011, 9.790,44 ha) em seis municípios, um deles Búzios | [Decreto estadual](https://www.saquarema.rj.gov.br/wp-content/uploads/2020/07/DECRETO-N%C2%B0-42.929-11-PCSOL.pdf) |

Ou seja: escrever "os nove municípios do Conderlagos" publica um número errado sobre um
consórcio público, e chamar o conjunto de "Costa do Sol" inclui Silva Jardim numa região
turística oficial da qual ele não faz parte. As duas coisas violam CS-OURO-006, e a
primeira é do tipo que a assessoria de um prefeito percebe no primeiro dia de feira.

**O que já foi feito para não travar o trabalho:** nenhuma das duas expressões foi escrita
no conteúdo. As nove páginas usam o nome do próprio município, e a home usa "Costa do Sol"
apenas como **nome do site**, sem afirmar que ele corresponde ao consórcio ou à região
turística. Nenhum texto publicado hoje conta municípios.

Uma exceção, e ela é da própria regra: a chamada obrigatória de CS-OITO-003 — *"A Costa do
Sol tem mais oito cidades."* — carrega a contagem embutida. Ela está no ar porque é texto
prescrito por regra; se a decisão de P-29 for pela opção 2 ou 3, essa frase muda junto.

**Opções, e todas são decisão do cliente:**

1. **Confirmar que a exclusão de Búzios é decisão comercial do consórcio** — nesse caso a
   expressão correta passa a ser algo como "nove dos dez municípios do Conderlagos", ou
   simplesmente não contar municípios em lugar nenhum.
2. **Incluir Búzios**, revogando CS-OURO-003 — muda dez mesas, dez QRs, quarenta pontos e
   a cobertura das rotas.
3. **Manter os nove sem nomear o conjunto** como consórcio nem como região turística: o
   site fala de nove cidades, e ponto.

**Decide:** humano, com o Conderlagos. **Bloqueia:** toda copy institucional — home,
release de imprensa, PDF das rotas e a página "para quem vende". **Prazo real:** antes de
qualquer material impresso, não 19/09.

### P-28 · As coordenadas dos 36 pontos são aproximadas

Foram derivadas da localização geral de cada ponto durante a composição do conteúdo, não
de levantamento em campo nem de base oficial. Servem para posicionar marcador num mapa de
região; **não servem para navegação**, e um marcador no lugar errado numa tela vista por
nove prefeituras é constrangimento barato de evitar.
**Precisa:** conferência ponto a ponto antes de o mapa da home ir ao ar (CS-HOME-003).
**Decide:** quem revisar o conteúdo, junto de P-03.

### P-27 · Não há projeto Supabase designado para este repositório

Levantado ao escrever [03-modelo-de-dados.md](03-modelo-de-dados.md). Os projetos existentes do
Tuggi não servem: misturar conteúdo de destino e lead de ente público com as tabelas de produto
contraria CS-ESCOPO-004 e CS-LEAD-005.

**Só uma parte disso bloqueia:** o site inteiro funciona sem banco, porque lê de `content/*.json`
em tempo de build (CS-ARQ-001). O que **não** funciona sem banco é a gravação de leads, que
acontece ao vivo durante a feira.

**Precisa:** um projeto Supabase novo para `costadosol-abav`, com a tabela `leads_abav_2026` (§4
do 03) criada antes de 30/09. O schema de conteúdo é conveniência de produção e pode nunca
existir — nesse caso o conteúdo é escrito à mão nos JSON, que é o que já está acontecendo.
**Decide:** humano (criação de projeto e custo). **Executa:** operador humano, nunca agente
(CS-OURO-007).

**Estado em 12/08/2026 — parcialmente contornada.** Existe banco local em PGlite (Postgres 18 em
processo, sem Docker), com as duas migrations aplicadas, testadas e o caminho banco → JSON
fechado (§5 do 03). Isso tira o bloqueio de desenvolvimento **e não resolve a feira**: o
formulário grava ao vivo em 30/09 e PGlite não atende requisição de rede. O que continua
pendente é só isto — um Postgres alcançável pela Cloudflare Function, com `leads_abav_2026`
criada. Prazo real: antes do primeiro teste de ponta a ponta do formulário, não 30/09.

---

## O que já está decidido e não é pendência

Registrado aqui para não voltar como dúvida:

- **Nomenclatura da v1.2 (ex-P-12)** — decidido pelo operador em 12/08/2026: as quatro correções
  valem. `roteiro_download` → `rota_download`; `audio_play.origem: "viagem"` → `"rota"`; funil
  `viagem_complete` → `rota_ouvir_complete`; "os três roteiros" → **as quatro rotas**. O critério
  de aceite A-11 (zero ocorrências de "viagem"/"roteiro") fica como está. Regra: CS-NOME-002.
- **Cobertura de idioma (ex-P-14)** — decidido pelo operador em 12/08/2026: interface nos oito,
  **conteúdo e áudio só em `pt`, `en` e `es`**, com fallback silencioso para `en`. São 135 áudios
  em vez de 360. Regras: CS-CONT-007, CS-CONT-008, CS-CONT-009; aceite A-20 e A-21. O resíduo
  vive em P-14b.
- **Ordem das rotas e cobertura 2× por município** — fechada em CS-CONT-004; os quatro conjuntos
  do briefing satisfazem a regra, verificado.
- **Nenhum dado do site em tempo de execução** — CS-ARQ-001, não se reabre por conveniência de
  atualização.
- **A entrada não pergunta o idioma** — decidido pelo operador em 13/08/2026. `/` resolve por
  `navigator.language` e redireciona. Revoga a tela cheia do §7.1 do briefing e reduz
  `lang_select` a troca deliberada. Regra: CS-NAV-007.
  Reverter é editar um arquivo (`app/page.tsx`).
- **Três idiomas, e a escolha mora no rodapé** — decidido pelo operador em 13/08/2026. O site
  serve `pt`, `en` e `es`, e a barra fixa de pílulas no topo virou um `select` no rodapé, que
  navega ao escolher. Fecha P-14b, reduz P-23 e revoga a lista de oito de CS-NAV-006. Regras:
  CS-NAV-006, CS-NAV-008, CS-NAV-010, CS-CONT-007, CS-CONT-009.
- **Hospedagem: Vercel** — decidido pelo operador em 12/08/2026, no lugar do Cloudflare Pages do
  briefing. Consequência: sai o `output: 'export'`, e CSP, rewrites das entradas de mesa,
  endpoint de leads e basic auth do painel passam a ser código versionado neste repositório em
  vez de configuração no painel do host. CS-ARQ-001 continua inteiro — as páginas seguem
  pré-renderizadas no build e o site não consulta banco em tempo de execução. Detalhe em
  [02-arquitetura.md §1](02-arquitetura.md).
- **Domínio de construção** — `costadosol.tuggi.app`; o CNAME do consórcio não bloqueia deploy
  (CS-ARQ-005).
- **Tailwind vs. CSS Modules** — decisão livre do UX/UI, documentada em `02-arquitetura.md`.
