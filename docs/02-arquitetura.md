# 02 — Arquitetura · Costa do Sol / ABAV Expo 2026

**Dono:** Fullstack. **Data:** 12/08/2026.
Regras que este documento implementa: [00-regras-de-negocio.md](00-regras-de-negocio.md).
Nenhuma decisão aqui pode contrariar uma regra `CS-*`; onde parecer contrariar, é defeito deste
documento.

---

## 1. Plataforma — Vercel, e o que isso mudou

**Decisão do operador em 12/08/2026: a hospedagem é a Vercel**, não o Cloudflare Pages do §4 do
briefing. Isso derrubou uma decisão anterior deste documento e melhorou o resultado.

Confirmado na documentação oficial em 12/08/2026, na versão que o projeto usa:

- **Next.js 16.3.0**. O guia *Static Exports* lista o que `output: 'export'` **não** suporta:
  `redirects`, `rewrites`, `headers`, middleware, Route Handlers que leem o request, ISR, Server
  Actions e `next/image` com o loader padrão.
- **Node** ≥ 20.9.0 exigido pelo Next 16; a máquina de build roda **v22.20.0**.
- **React 19.2.x**, exigido como peer.
- **TypeScript 5.9.3**, não a 7.0.2. A 7 é a reescrita nativa e é recente demais para um projeto
  com data de feira. Revisitar depois de 02/10.

Na Vercel, **`output: 'export'` deixa de ser necessário** — e sair dele é o movimento certo:

| Precisamos de | Com export estático | Na Vercel, sem export |
| :-- | :-- | :-- |
| CSP e cabeçalhos de segurança | arquivo do host (`_headers`) | `headers()` no `next.config.ts` |
| `/saquarema` achar a página de mesa | regra de reescrita do host | `rewrites()`, versionado no repo |
| Endpoint de leads | função do host, em outra linguagem de deploy | Route Handler, no mesmo projeto |
| Basic auth do `/painel` | recurso do host | middleware |

**O que não mudou, e é o que importa:** `CS-ARQ-001` continua valendo por inteiro. Toda página de
conteúdo é pré-renderizada no build (`generateStaticParams`), o site não consulta banco em tempo
de execução, e o build hoje emite 8 páginas de idioma + 72 páginas de município como HTML
estático. Sair do `output: 'export'` deu ferramentas de servidor; não colocou o banco no caminho
do visitante.

Custo assumido: a Vercel passa a ser dependência de plataforma para leads e painel. Se um dia
for preciso sair, o site estático sai inteiro; o que precisa ser reescrito são as duas funções.

---

## 2. Decisão de estilo — Tailwind CSS v4

`CS-DESIGN-003` exige que nenhuma cor seja codificada em componente e que tudo passe por custom
properties num único arquivo de tema, porque o manual de marca do Conderlagos ainda não chegou
([P-01](01-pendencias.md)) e vai chegar depois de as telas existirem.

Tailwind v4 declara o tema em CSS (`@theme`) e **emite custom properties nativas** — é
exatamente a forma exigida pela regra, sem camada de tradução. Trocar a paleta quando o manual
chegar é editar um arquivo.

O que decidiu contra CSS Modules: com Modules, o token vira convenção — nada impede um
`color: #0a4` dentro de um `.module.css`, e a regra passa a depender de disciplina. Com o tema em
Tailwind, cor fora do token é visível no diff e barrável por lint.

**Um arquivo de tema, um só:** `app/tema.css`. Nenhum outro arquivo declara cor, raio, sombra ou
escala tipográfica.

Custo aceito: classes utilitárias no JSX. O orçamento de `CS-PERF-001` não sofre — Tailwind v4
emite só o que é usado.

---

## 3. Estrutura de pastas

```
content/                     JSON versionado, emitido pelo export do DBA (CS-ARQ-001)
  municipios.json  pontos.json  rotas.json  fatos.json
fixtures/                    dados de exemplo — NUNCA vão ao ar
  validos/  invalidos/
scripts/
  content-schema.ts          o schema é código, e é a fonte única (CS-VAL-001)
  validate-content.ts        roda no prebuild; falha, não avisa
  export-content.ts          Supabase -> content/ (DBA; ver 03-modelo-de-dados.md)
  gen-redirects.ts           gera as 9 páginas de mesa em public/ (CS-NAV-002)
  perf-check.ts              Lighthouse CI em rede throttled (CS-PERF-002)
app/
  tema.css                   ÚNICO lugar com cor, raio, sombra, tipografia
  layout.tsx                 shell; nada de dado aqui
  page.tsx                   / — escolha de idioma (CS-NAV-007)
  [lang]/
    layout.tsx               barra de idioma, rodapé com a linha do CS-OURO-002
    page.tsx                 home
    [municipio]/page.tsx     página do município (CS-MUN-001)
    [municipio]/[ponto]/page.tsx
    rotas/page.tsx  rotas/[rota]/page.tsx
    lugares/page.tsx  para-quem-vende/page.tsx  imprensa/page.tsx
  painel/page.tsx            sem idioma; lê pela Function (P-15)
componentes/
  Foto.tsx  Audio.tsx  BarraDeIdioma.tsx  Mapa.tsx  GradeDeMunicipios.tsx
  OutrasOito.tsx  CardDePonto.tsx  Formulario.tsx
lib/
  conteudo.ts                leitura tipada de content/ em tempo de build
  idioma.ts                  CS-CONT-007: resolve idioma servido e fallback
  sessao.ts                  semente, qr_id, entry_municipio (CS-SORT-002, CS-NAV-005)
  track.ts                   ÚNICO ponto de contato com analytics (CS-EVT-001)
app/api/                     Route Handlers — rodam no servidor, fora do bundle do cliente
  leads/route.ts             grava em leads_abav_2026 (CS-LEAD-006)
  painel-dados/route.ts      proxy de leitura do analytics (P-15)
middleware.ts                basic auth do /painel (CS-PAINEL-001)
public/
  <slug>/index.html          GERADO por gen-redirects.ts — não editar à mão
  img/ audio/ pdf/ mapa/
testes/
```

Route Handler e middleware rodam **só no servidor**: a chave de escrita dos leads e o token de
leitura do analytics existem em variável de ambiente da Vercel e nunca entram no bundle do
cliente (`CS-OURO-009`). Nenhum componente de tela importa esses arquivos — se importar, o
segredo vaza para o navegador, e é essa a fronteira a vigiar em revisão.

---

## 4. Os nove pontos de entrada

`CS-NAV-002` pede uma página de ~2 KB sem framework, que grave a origem em `sessionStorage`
antes de sair. `redirects()` do Next não serve para isso — redirect de servidor não escreve
`sessionStorage`. Então a página é HTML gerado, e o `rewrites()` só a torna alcançável.

- `scripts/gen-redirects.ts` lê `content/municipios.json` e escreve
  `public/<slug>/index.html` para os nove. **Gerado, nunca escrito à mão** — nome de município é
  dado, e dado tem um dono só (SSOT).
- Cada página: lê `navigator.language`, resolve o idioma contra a lista de oito, grava
  `entry_municipio` e `qr_id` em `sessionStorage`, e faz `location.replace('/<lang>/<slug>/')`.
- `location.replace`, nunca `href` (`CS-NAV-003`).
- Sem CSS externo, sem fonte, sem imagem: a página é invisível por 40 ms e qualquer byte a mais
  entra no orçamento de "scan ao primeiro áudio" (`CS-MUN-004`).
- `trailingSlash: true`, e o `rewrites()` do `next.config.ts` aponta cada `/<slug>` para
  `public/<slug>/index.html`. **Medido, não deduzido:** removendo o rewrite e rebuildando,
  `/saquarema/` devolve 404 — o router do Next não acha a página sozinho.
- **O QR impresso precisa trazer a barra final** (`costadosol.tuggi.app/saquarema/`). Sem ela o
  servidor responde 308 antes de qualquer coisa, e um salto a mais é exatamente o que
  `CS-MUN-004` está contando. Vale para o cartão de mesa e para qualquer peça impressa.

**Colisão de nomes verificada:** as rotas do Next na raiz são os oito idiomas (`/pt/`, `/en/`…) e
`/painel/`. Os nove slugs de município não colidem com nenhuma. `gen-redirects.ts` falha se algum
slug colidir com um segmento reservado.

---

## 5. Idioma

`lib/idioma.ts` concentra `CS-CONT-007` inteiro:

```
IDIOMAS_INTERFACE = pt en es fr it de zh ko     (8 — a barra mostra os oito)
IDIOMAS_CONTEUDO  = pt en es                    (3 — conteúdo e áudio)
FALLBACK_CONTEUDO = en
```

Uma função só resolve qual idioma um campo de conteúdo realmente serve, e **todo componente que
mostra conteúdo passa por ela**. Segunda implementação disso é defeito: é a decisão "qual idioma
estou servindo" duplicada, e é assim que um bloco fica em inglês e o irmão em português.

O fallback é silencioso (`CS-CONT-008`) — nenhuma tela avisa. Mas `<html lang>` e `og:locale`
declaram o idioma **servido**, não o escolhido, porque leitor de tela pronuncia errado se
mentirmos e indexador registra errado.

---

## 6. Conteúdo em tempo de build

`lib/conteudo.ts` importa os JSON de `content/` diretamente. Os arquivos são pequenos (36 pontos)
e o Next resolve tudo em Server Component durante o `next build`: **nenhum byte de `content/`
chega ao cliente além do que a página usa**. `generateStaticParams()` enumera 8 idiomas × 9
municípios (72 páginas de município), × 36 pontos, 4 rotas e as fixas — ~450 páginas HTML, todas
pré-renderizadas.

O tipo vem do schema de `scripts/content-schema.ts` por inferência. **O schema é a fonte; o tipo
é derivado.** Declarar a interface à mão em outro arquivo seria a segunda declaração do mesmo
fato.

---

## 7. Hospedagem, segredo e o painel

| Coisa | Onde vive | Por quê |
| :-- | :-- | :-- |
| Site | Vercel, `costadosol.tuggi.app` | `CS-ARQ-005` |
| Cabeçalhos de segurança e CSP | `headers()` no `next.config.ts` | versionado com o código, não no painel do host |
| Basic auth do `/painel` | `middleware.ts` | `CS-PAINEL-001` |
| Chave de escrita dos leads | variável de ambiente da Vercel | `CS-LEAD-006`, `CS-OURO-009` |
| Token de leitura do analytics | variável de ambiente da Vercel | [P-15](01-pendencias.md) |

O painel é uma página estática que busca `/api/painel-dados` — um Route Handler que consulta o
analytics com o token do ambiente e devolve **já agregado**. O cliente nunca vê o token nem o
dado bruto. Se o painel consultasse o analytics direto, o token estaria no bundle e o dado de
nove prefeituras ficaria a um DevTools de distância.

**CSP** já está no `next.config.ts` e restringe `connect-src` ao próprio domínio; ganha o host do
analytics quando P-10 fechar.
É o que transforma `CS-OURO-010` ("nenhum script de terceiro") de intenção em bloqueio — e é o
que faz o critério A-17 passar sozinho, em vez de depender de alguém olhar a aba Network.

---

## 8. Analytics — adaptador, porque a ferramenta ainda não foi escolhida

[P-10](01-pendencias.md) está aberta e `CS-EVT-005` diz que a instrumentação não espera. As duas
coisas convivem assim:

`lib/track.ts` expõe **uma** função (`CS-EVT-001`), com a taxonomia de `CS-EVT-003` tipada em
union — evento fora da lista não compila. Por baixo, um adaptador com três implementações:

1. `console` — desenvolvimento;
2. `buffer` — enfileira em memória e é o que os testes leem para provar A-13;
3. a ferramenta escolhida — plugada quando P-10 fechar, sem tocar em nenhum componente.

O que **não** é adiável e já está no helper: `session_id`, `ts` e `lang` automáticos
(`CS-EVT-002`), e o par `entry_municipio` + `cruzamento` em todo `municipio_open`
(`CS-EVT-004`) — calculado dentro do helper, a partir do `sessionStorage`, e não passado pelo
componente que chama. Deixar o componente calcular `cruzamento` é entregar a métrica mais valiosa
do projeto a nove lugares diferentes, cada um com uma chance de errar.

---

## 9. Mapa

MapLibre GL JS 6.3 + PMTiles 4.5, tiles auto-hospedados — sem chave, sem custo por sessão
(`CS-ARQ-004`). PMTiles usa HTTP range request e busca só os tiles do viewport; o Cloudflare
Pages atende range.

Duas restrições de regra mandam no estilo:

- **[P-11] — nenhum rótulo do basemap.** O extrato de OSM rotula Búzios, e `CS-OURO-003` proíbe.
  O estilo não desenha `place labels`; os nove nomes são desenhados por nós, como camada de
  símbolos alimentada por `content/municipios.json`.
- **`CS-HOME-003`** — nove marcadores idênticos, nenhum destaque. O estilo não tem expressão
  condicional por município; se tivesse, a primeira "melhoria" seria destacar um.

`CS-HOME-004` obriga a **medir** antes de manter o mapa: se a primeira carga passar de 500 KB, cai
para SVG com a mesma geometria. A medição roda em `scripts/perf-check.ts` e o resultado fica em
`docs/04-medicao-do-mapa.md`. Enquanto não for medido, o mapa **não** entra na primeira dobra do
build de produção.

Mitigação já decidida: o componente `Mapa` é carregado com `dynamic(..., { ssr: false })` e só
depois da primeira dobra, então o peso dele nunca conta para o LCP — mas conta para os 500 KB, e
é isso que a medição decide.

---

## 10. Imagem e áudio

**Imagem** — `next/image` com loader padrão não existe no export estático, e um loader remoto
traria dependência de terceiro. Então: as variantes são geradas no build a partir dos originais
(`sharp`), e o componente `Foto` emite `<picture>` com AVIF, fallback WebP, `srcset`, `width`,
`height` e `loading="lazy"` fora da primeira dobra (`CS-PERF-003`). `credito` é **prop
obrigatória** do componente — foto sem crédito não compila, e o critério A-16 deixa de depender
de inspeção visual.

**Áudio** — um elemento `<audio>` por vez no documento inteiro, com `preload="none"`
(`CS-PERF-004`). Um controlador único garante que tocar um pausa o outro; é também onde vive o
encadeamento da rota (`CS-ROTA-002`) e o gesto que o Safari iOS exige (`CS-ROTA-003`).

**Service worker** — cacheia o shell e **só os áudios já ouvidos** (`CS-PERF-005`). Não
pré-cacheia nada: pré-cache de 36 áudios é o erro que quebra o QR no pavilhão lotado.

---

## 11. Ordem de execução

1. Scaffold, tema, `content-schema.ts`, `validate-content.ts`, fixtures — **agora**; é o portão
   do §16 do briefing.
2. `gen-redirects.ts` e as nove entradas de mesa — antes de qualquer tela, porque é o caminho
   real do visitante.
3. Página do município + `OutrasOito` — a porta de entrada (`CS-MUN-001`) e a métrica de
   cruzamento (`CS-OITO-006`).
4. `lib/track.ts` com o adaptador de buffer — **semana 3, junto com a navegação** (`CS-EVT-005`).
5. Home, rotas, mapa (com medição), lugares, para-quem-vende, imprensa.
6. Formulário e Function de leads.
7. Painel.

`perf-check.ts` roda em PR desde o item 1 (`CS-PERF-002`), senão o orçamento vira conversa no
final.
