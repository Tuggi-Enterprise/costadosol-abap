# 00 — Regras de negócio · Conderlagos / ABAV Expo 2026

**Fonte:** briefing de implementação `costadosol-abav` v1.2, de 11/08/2026.
**Dono deste documento:** Product Owner. Nenhum outro agente escreve aqui.
**Status:** consolidado em 12/08/2026. As lacunas estão em [01-pendencias.md](01-pendencias.md).

Este documento é a única fonte de verdade do projeto. Onde ele divergir do briefing colado
na conversa, ele vence — e a divergência precisa ser reportada, porque significa que alguém
consolidou errado.

Cada regra tem um ID. **Teste que prova uma regra cita o ID dela na descrição.** Regra sem
teste correspondente é promessa sem prova; a lista do §11 diz quais são obrigatórias.

---

## 1. Missão e escopo

**CS-ESCOPO-001** — O produto é uma experiência web mobile-first que apresenta o **Conderlagos**
— os dez municípios do consórcio — ao público profissional da ABAV Expo 2026 (30/09 a
02/10/2026, com congelamento de conteúdo em 19/09/2026).

**CS-ESCOPO-002** — O material é institucional, do destino. **Não é demonstração de produto.**
Nenhuma tela pública explica como a experiência funciona por dentro.

**CS-ESCOPO-003** — O projeto entrega duas coisas: o site público e um painel de dados
consolidado, usado pela presidência do consórcio e por cada uma das dez prefeituras.

**CS-ESCOPO-004** — Repositório novo e isolado (`costadosol-abav`). Nada é importado de, nem
escrito em, `tuggi-cms`, `tuggi-drive-v2` ou `tuggi-enterprise`.

---

## 2. Glossário canônico — nomes que não têm sinônimo

A v1.2 fundiu três nomes num só. Usar qualquer dos nomes revogados em código, arquivo, copy
ou conversa é defeito, porque reabre a confusão que a fusão resolveu.

| Termo canônico | O que é | Nomes **revogados** |
| :-- | :-- | :-- |
| **rota** | um dos quatro percursos entre municípios | "modo viagem", "roteiro", "viagem" |
| **ponto** | um dos 40 lugares | "POI" em copy (`poi_id` permanece só como nome de campo de evento) |
| **município** | uma das dez cidades | "cidade" em nome de campo de dado (em copy, "cidade" é permitido) |
| **mesa** | ponto de entrada físico no estande, um por município | — |
| **cruzamento** | sessão que entrou por um município e abriu outro | — |

**CS-NOME-001** — As strings `viagem`, `modo viagem` e `roteiro` não aparecem como nome de
rota de URL, de componente, de arquivo, de evento, de propriedade de evento ou em copy
publicada. Verificado por script sobre o código-fonte e sobre o HTML gerado.

**CS-NOME-002** — Correções que a v1.2 exige e que o briefing ainda carrega no texto antigo:
o evento `roteiro_download` passa a ser **`rota_download`** (prop `rota_id`); a propriedade
`origem: "viagem"` de `audio_play` passa a ser **`origem: "rota"`**; a etapa `viagem_complete`
do funil do painel passa a ser **`rota_ouvir_complete`**; a página `/[lang]/para-quem-vende`
oferece **as quatro rotas**, não "os três roteiros". **Confirmado pelo operador em 12/08/2026** —
as quatro correções valem, e o critério de aceite A-11 fica como está.

---

## 3. Regras de ouro — invioláveis

Precedem qualquer decisão técnica ou estética. Desvio só com aprovação registrada do Product
Owner neste documento.

**CS-OURO-001 · Nenhuma explicação de tecnologia em tela pública.** Proibido em copy:
"IA", "inteligência artificial", "pipeline", "geolocalização", "algoritmo", "plataforma",
"app", "demo", "modo", "recurso", "funcionalidade", "powered by". A mecânica fala por si; se
precisa de legenda explicando, está mal feita.
*Escopo:* texto exibido ao usuário. Nome interno de campo de dado (`modo` em `lang_select`)
não é copy e não viola esta regra.

**CS-OURO-002 · A marca Tuggi só aparece no rodapé**, na forma exata `Conteúdo e tecnologia:
Tuggi` — e no idioma da página: `Content and technology: Tuggi`, `Contenido y tecnología: Tuggi`.
Em nenhum outro lugar, em nenhum tamanho. Única exceção: o texto de consentimento do formulário
(CS-LEAD-003), que é texto jurídico e precisa nomear o controlador dos dados.

*Revisão de 13/08/2026, decidida pelo operador:* a linha é uma sentença, não um logotipo, e ficava
em português nas páginas em inglês e espanhol. O nome **Tuggi** não se traduz; o resto, sim.

**CS-OURO-003 · Dez municípios — o consórcio inteiro.** Araruama, Armação dos Búzios, Arraial
do Cabo, Cabo Frio, Casimiro de Abreu, Iguaba Grande, Rio das Ostras, São Pedro da Aldeia,
Saquarema, Silva Jardim.

> **Revisão de 14/08/2026, decidida pelo operador, que fecha [P-29](01-pendencias.md) pela
> opção 2.** Até esta data a regra listava **nove** municípios e proibia Búzios por escrito. A
> apuração de 12/08/2026 mostrou o preço disso: o Conderlagos tem dez, e "os nove municípios
> do Conderlagos" publicava número errado sobre um consórcio público. Búzios
> entrou, e a mesma decisão trocou o nome do site de "Costa do Sol" para **Conderlagos** — o
> que também resolve a outra metade de P-29, já que a região turística Costa do Sol da
> Setur-RJ tem treze municípios e não inclui Silva Jardim.

**A contagem tem um dono só:** `MUNICIPIOS`, em `scripts/content-schema.ts`. Copy que conta
município ou lugar deriva daquela constante, e um teste de interface confere os dois números
publicados contra ela. Nenhum documento, rótulo ou rota repete o número por conta própria.

**"Região dos Lagos" continua proibido em copy**, e a razão mudou: não é nome errado, é a razão
social. O consórcio se chama Consórcio Intermunicipal de Desenvolvimento da Região dos Lagos, e
o que vai à tela é a marca, **Conderlagos**. *Consequência não óbvia:* o basemap do mapa (§7.2-A
do briefing) rotulava Búzios por padrão, e isso deixou de ser defeito — ver
[P-11](01-pendencias.md).

**CS-OURO-004 · Paridade absoluta entre municípios.** Exatamente 4 pontos cada, 40 no total.
Nenhum ranking, contador, badge de "mais visto" ou destaque visual em nenhuma tela pública.

**CS-OURO-005 · Ordem sorteada** em toda listagem clicável de municípios (grade da home, módulo
das outras cidades). **Ordem alfabética** em toda listagem não clicável: rodapé, créditos, PDF,
relatório, tabela de secretarias, blocos por município do painel.

**CS-OURO-006 · Nenhum dado inventado.** Nenhum número de leitos, ocupação, receita, fluxo
turístico ou superlativo do tipo "melhor praia do Brasil". Toda afirmação factual precisa de
`fonte_verificacao` preenchida. Sem fonte, a frase não vai ao ar.

**CS-OURO-007 · Só o agente DBA fala com o banco.** Nenhum outro agente executa query, migration
ou script contra o Supabase.

**CS-OURO-008 · Nenhum agente supõe.** Diante de ambiguidade: este documento, depois fonte
oficial, depois **perguntar ao humano**. Nunca decidir sozinho e seguir. Ação destrutiva
(`DROP`, `TRUNCATE`, reset, remoção de bucket, revogação de chave) é documentada pelo agente e
**executada pelo operador humano**.

**CS-OURO-009 · Nenhuma chave secreta no cliente.** O site é estático e não conversa com o banco
em tempo de execução.

**CS-OURO-010 · Sem cookies e sem identificação individual no site público.** Nenhum pixel de
terceiro, nenhum Google Analytics, nenhum Meta Pixel, nenhum banner de consentimento — porque
não haverá cookie. O formulário de leads (§8) é a única coleta de dado pessoal, é explícita e
consentida.

---

## 4. Arquitetura de conteúdo

**CS-ARQ-001** — O site nunca consulta o banco de produção em tempo de execução. O fluxo é:
Supabase → `scripts/export-content.ts` (rodado pelo DBA na máquina do dev) → `content/*.json`
→ commit → build Next.js estático (`output: 'export'`).

**CS-ARQ-002** — Os arquivos de `content/` são versionados no git. O que estava no ar em 30/09
fica congelado no commit e é auditável.

**CS-ARQ-003** — Atualizar conteúdo exige rebuild (2–4 min). Custo aceito para uma feira de três
dias.

**CS-ARQ-004** — Stack fixada: Next.js 14+ App Router com `output: 'export'`; TypeScript strict;
MapLibre GL JS + PMTiles auto-hospedado; analytics cookieless auto-hospedado (Umami ou Plausible
— ver [P-10](01-pendencias.md)); Cloudflare Pages; Supabase apenas no build e para gravar leads.
**Proibido:** Google Maps JS API, qualquer analytics de terceiro com cookie, biblioteca de UI
pesada. Tailwind vs. CSS Modules é decisão do UX/UI, documentada em `docs/02-arquitetura.md`.

**CS-ARQ-005** — Domínio: `revista.conderlagos.com.br`, decidido pelo operador em 14/08/2026.
Era `revista.conderlagos.com.br`, domínio de terceiro com o nome antigo. **O domínio entra dentro do
QR impresso:** QR gerado antes desta troca aponta para o host velho, e reimprimir mesa é prazo
de gráfica, não de deploy. Antes de mandar imprimir, conferir que o DNS já responde.

---

## 5. Entrada e navegação

### 5.1 Dez pontos de entrada — uma mesa por município

**CS-NAV-001** — O estande tem uma mesa por município, cada uma com seu QR, apontando para uma
URL curta digitável: `revista.conderlagos.com.br/<slug>` (ex.: `/saquarema`).

**CS-NAV-002** — Cada `/[slug]/index.html` é uma página estática de redirecionamento (~2 KB, sem
framework, sem CSS externo) que: lê `navigator.language` e resolve o idioma (fallback `pt`);
grava `entry_municipio=<slug>` e `qr_id=mesa-<slug>` em `sessionStorage`; e faz
`location.replace('/<lang>/<slug>')`.

**CS-NAV-003** — `location.replace`, **nunca** `href`: o botão voltar não pode devolver a pessoa
para a página de redirect.

**CS-NAV-004** — QRs gerais apontam para `/` com `?p=cartao | totem | tela`.

**CS-NAV-005** — `qr_id` e `entry_municipio` são lidos uma vez, guardados em `sessionStorage` e
**removidos da URL** com `history.replaceState`. `entry_municipio` é **imutável dentro da
sessão**: não muda quando a pessoa navega para outro município.

| Peça | URL | `qr_id` | `entry_municipio` |
| :-- | :-- | :-- | :-- |
| Mesa de cada município (×9) | `/saquarema` | `mesa-saquarema` | `saquarema` |
| Cartão A6 de mão | `/?p=cartao` | `cartao` | `null` |
| Totem central | `/?p=totem` | `totem` | `null` |
| Tela vertical | `/?p=tela` | `tela` | `null` |

### 5.2 Idioma

**CS-NAV-006** — `lang ∈ { pt, en, es }`. Três idiomas, e a interface e o conteúdo cobrem os
mesmos três.

*Revisão de 13/08/2026, decidida pelo operador, que revoga a lista de oito.* Os cinco que saíram
(fr, it, de, zh, ko) tinham interface traduzida e conteúdo em inglês, e nenhum deles passou por
revisor humano — era a P-14b, aberta desde 12/08. O comprador alemão escolhia "Deutsch", via cinco
rótulos em alemão e o texto de cada lugar em inglês: a lista de oito prometia uma cobertura que o
conteúdo não tinha. Com três, nenhuma tela mente sobre o que existe atrás dela, e P-14b e P-23
fecham juntas.

**CS-NAV-007 · Entrada pela home (`/`)** — **o idioma é resolvido, não perguntado.**
`navigator.language` decide, com fallback `pt`, e a pessoa cai direto em `/<lang>/`. Não há tela
de escolha, e **nenhum `lang_select` é emitido** — ninguém selecionou nada; o sinal de idioma da
entrada é `locale_navegador`, em `session_start`.

*Revisão de 13/08/2026, decidida pelo operador, que revoga a tela cheia de oito bandeiras do §7.1
do briefing.* O motivo é o mesmo que já valia para a entrada por mesa (CS-NAV-008): o aparelho já
sabe o idioma, e uma tela a mais entre o QR e o conteúdo perde gente em pé, num corredor de feira.
O argumento de alcance internacional (CS-NAV-006) não dependia daquela tela: a troca deliberada
acontece no seletor do rodapé, presente em toda página.

**CS-NAV-008 · Entrada por mesa (`/[slug]`)** — **sem tela intermediária**. Renderiza a página do
município já no idioma detectado. Troca emite `lang_select` com `modo: "rodape"`. O sinal de idioma
aqui é `locale_navegador`, e para o argumento de demanda internacional vale tanto quanto a escolha
explícita.

*Revisão de 13/08/2026, decidida pelo operador:* a barra fixa de pílulas no topo saiu, e a escolha
virou um `select` no rodapé. No topo, ela custava a primeira faixa de toda página para uma decisão
que a entrada já resolve sozinha (CS-NAV-007) — quem chega no idioma certo, que é a maioria, pagava
a barra em cada rolagem e nunca a usava. No rodapé, o custo fica com quem tem o problema.

**CS-NAV-009** — A escolha de idioma vai para `sessionStorage`.

**CS-NAV-010** — Num iPhone SE (375 px), a escolha de idioma é um alvo de 44 px e todas as opções
cabem sem rolagem horizontal.

*Revisão de 13/08/2026:* a exigência de alcançar a opção **sem rolar a página** caiu junto com a
barra do topo. Um `select` no rodapé exige rolar até lá, e é o preço aceito em CS-NAV-008. Sem
script, o rodapé traz os três idiomas como links.

### 5.3 Mapa de rotas do site

```
/[municipio]                   redirect curto do QR de mesa (CS-NAV-002)
/                              entrada: escolha de idioma
/[lang]                        home
/[lang]/[municipio]            página do município (com os 4 pontos inline)
/[lang]/[municipio]/[ponto]    página do ponto (link direto e compartilhamento)
/[lang]/rotas                  as quatro rotas
/[lang]/rotas/[rota]           uma rota
/[lang]/lugares                os 40 lugares, agrupados por município em ordem alfabética
/[lang]/para-quem-vende        rotas, fatos de acesso, contatos das secretarias
/[lang]/imprensa               release, 8 fotos em alta, texto de 300 palavras (fora do menu)
/painel                        painel de dados, protegido por senha, sem idioma
```

---

## 6. Telas

### 6.1 Home

**CS-NAV-011 · Navegação** — barra fixa no rodapé com quatro destinos (Cidades · Rotas ·
Lugares · Profissional), visível em toda página, alvos de 54 px. **Não existe menu hambúrguer
em lugar nenhum** — CS-HOME-001 já o proíbe na primeira dobra, e a razão vale para o site
inteiro: quem entra por QR tem cerca de 60 segundos em pé, com uma mão no telefone, e não
procura navegação escondida atrás de um ícone. O rodapé é a única faixa que o polegar alcança
sem trocar a mão de posição. No desktop a mesma lista vira uma linha no topo.
*Decidido pelo operador em 13/08/2026.*

**CS-HOME-001 · Hero** — vídeo institucional full-bleed, "Conderlagos", uma linha, botão de play (45 s)
ocupando ≥30% da largura da tela. Sem menu hambúrguer na primeira dobra, sem carrossel.

**CS-HOME-002 · Palavra da presidência** — card discreto, 20 s, na voz do presidente do
consórcio.

**CS-HOME-003 · Mapa da região**, logo abaixo do hero. Dez marcadores **idênticos** (mesmo raio,
cor, peso de rótulo), nenhum destaque, nenhum contador. As quatro rotas traçadas por cima, cada
uma na sua cor, ativáveis por toque. Tocar município → `/[lang]/[municipio]`; tocar rota →
`/[lang]/rotas/[rota]`. Emite `mapa_interacao` com `alvo` e `id`.

**CS-HOME-004** — Se o peso do mapa ameaçar o orçamento de 500 KB da primeira carga, cair para
SVG estilizado com a mesma geometria. Decisão do Fullstack, tomada **medindo**, com a medição
registrada em `docs/`.

**CS-HOME-005 · Três fatos** (`content/fatos.json`): número grande, uma frase, nome da fonte em
texto pequeno. **Fato, nunca adjetivo.** Proibido "paradisíaco", "deslumbrante", "imperdível".
Emite `home_fato_view`.

**CS-HOME-006 · Seção "Lugares"** — dez cards, **um ponto por município**, sempre. Qual dos
quatro pontos aparece é sorteado por sessão, com a mesma semente da ordem dos cards. Link ao
final: "Os 40 lugares do Conderlagos" → `/[lang]/lugares`.

**CS-HOME-007 · Grade dos dez municípios** — cards fotográficos verticais: foto, nome, nada
mais. Rodapé da seção, em texto pequeno: *"A ordem das cidades é sorteada a cada acesso."*

### 6.2 Sorteio

**CS-SORT-001** — A ordem dos municípios é sorteada **uma vez por sessão** e é **estável dentro
da sessão**: voltar para a home reproduz a mesma ordem.

**CS-SORT-002** — Implementação: semente gerada na primeira visita e guardada em `sessionStorage`
(`crypto.randomUUID()`), embaralhamento determinístico Fisher–Yates com PRNG semeado.
**`Math.random()` direto é proibido** — a ordem tem de ser reproduzível dentro da sessão.

**CS-SORT-003** — A mesma semente rege a grade da home, o módulo das outras cidades e o ponto
sorteado da seção "Lugares".

**CS-SORT-004** — Duas sessões distintas produzem ordens diferentes; recarregar dentro da mesma
sessão mantém a ordem.

**CS-SORT-005** — Cada card emite `municipio_open` com `posicao_no_sorteio` (1..9). O campo existe
para **verificar depois** se o sorteio de fato eliminou o viés de posição.

### 6.3 Página do município — a porta de entrada principal

**CS-MUN-001** — Esta página é a porta de entrada principal do projeto, não um segundo nível: a
maior parte das sessões começa aqui, vinda do QR de uma mesa. Ela se identifica sozinha e
funciona sem ninguém para explicar, porque metade das mesas estará vazia em algum momento.

**CS-MUN-002** — Os quatro pontos ficam **abertos na própria página**. Três níveis de navegação
são demais para quem tem 60 segundos no balcão.

```
barra de idioma fixa no topo (8 opções, não bloqueia)
hero fotográfico + nome do município + UMA linha
► ouvir a cidade (45 s)
4 pontos: foto 4:5 · nome · teaser ≤180 car. · ► ouvir · "ler mais" (expande o texto)
CTA: "Receber o material de [cidade]"
selo + link da secretaria de turismo
★ as outras cidades
compartilhar
```

**CS-MUN-003** — `og:image` própria por município, com o nome do município renderizado. É o que o
gabinete municipal vai postar.

**CS-MUN-004** — Do scan ao primeiro áudio de um ponto: no máximo **2 toques** e **menos de 5 s**
quando a entrada for por mesa.

**CS-MUN-005 · Canais de rede social do município.** *Pedido do operador em 14/08/2026, para
divulgação.* Cada município publica seus canais oficiais **dentro do mesmo bloco** do link da
secretaria, no nível **terciário** de CS-DESIGN-005. Não é seção própria: uma quarta seção aqui
disputaria com a conversão que CS-OITO-004 protege.

- **Link, nunca embed.** Widget de feed carrega script e cookie de terceiro e derruba
  CS-OURO-010 e o critério A-17 — o mesmo motivo pelo qual o vídeo da capa não é embed.
- **Conta da Secretaria de Turismo quando existe; da prefeitura quando não existe.** Oito das
  dez têm conta própria de turismo. Casimiro de Abreu e Rio das Ostras não têm, e nas duas foi
  o próprio site oficial do município que apontou a conta da prefeitura.
- **Mesma quantidade de canais em todos os dez** — validado no build. Três cidades com duas
  redes e sete com uma faz as três parecerem mais ativas, e paridade entre municípios
  (CS-OURO-004) vale para esta faixa da tela como vale para os pontos. Rede nova entra nas dez
  ou não entra. Hoje: Instagram, nos dez.
- **Todo perfil carrega `fonte` e `consultado_em`**, como qualquer afirmação (CS-OURO-006).
  Link para conta abandonada ou para fã page em página de ente público é o risco real aqui, e
  **os dez perfis ainda esperam confirmação das secretarias** — ver [P-30](01-pendencias.md).

### 6.4 Módulo "as outras cidades"

É o mecanismo que transforma dez mesas separadas em uma região. Sem ele, o estande é uma feira
de dez municípios dividindo aluguel. Recebe o mesmo cuidado de implementação que o hero.

**CS-OITO-001** — Grade fotográfica das **outras cidades**, nunca do município atual, em nenhuma das
dez páginas.

**CS-OITO-002** — Ordem sorteada com a mesma semente de sessão (CS-SORT-003).

**CS-OITO-003** — Chamada neutra: *"O Conderlagos tem mais nove cidades."* O numeral sai de `MUNICIPIOS` e é conferido por teste (CS-OURO-003). Proibido "veja
também", "você pode gostar", "relacionados".

**CS-OITO-004** — Posicionado **depois** do CTA, para não competir com a conversão do município
de entrada.

**CS-OITO-005** — Sem contador, sem badge, sem destaque de nenhum município.

**CS-OITO-006** — Cada abertura daqui emite `municipio_open` com `origem: "outras_cidades"` e
`cruzamento: true`. **É aqui que a métrica mais valiosa do projeto é gerada.**

### 6.5 Página da rota

**CS-ROTA-001** — Uma rota, três formas de consumo na mesma página:

```
mapa da rota (traçado destacado, demais rotas apagadas)
nome da rota + eixo + municípios que atravessa, na ordem do caminho
► OUVIR A ROTA
os pontos ao longo do caminho, em sequência, cada um com ► ouvir
↓ LEVAR (PDF de uma página)
os municípios desta rota → links para as páginas de município
```

**CS-ROTA-002 · Ouvir a rota** — 80 a 100 segundos. Um marcador percorre o traçado; ao cruzar
cada ponto, um card sobe e o áudio começa sozinho. Barra de progresso no topo, botão "pular"
sempre visível.

**CS-ROTA-003** — Navegador móvel bloqueia áudio sem gesto do usuário. O botão "ouvir a rota" é o
gesto; depois dele o encadeamento é livre. **Validar em Safari iOS físico**, o mais restritivo —
não em emulador.

**CS-ROTA-004** — Emite `rota_open`, `rota_ouvir_start`, `rota_ouvir_complete`.

**CS-ROTA-005** — O texto de encerramento cita a contagem real de pontos daquela rota; não é
constante. Ver [P-13](01-pendencias.md).

### 6.6 Para quem vende

**CS-VENDE-001** — As quatro rotas, cada uma com PDF de uma página; os três fatos de acesso e
calendário, com fonte; tabela com o contato das dez secretarias em ordem alfabética; botão para
o formulário.

---

## 7. Contratos de conteúdo

Os arquivos vivem em `content/`, são emitidos por `scripts/export-content.ts` e validados por
`scripts/validate-content.ts` no `prebuild`. O schema completo de cada arquivo está no briefing
§6 e é reproduzido em `docs/03-modelo-de-dados.md` pelo DBA.

**CS-CONT-001** — `municipios.json`: `slug` (kebab-case, sem acento, **imutável**), `nome`
oficial, `linha` (uma linha de posicionamento por idioma, não parágrafo), `hero` (`src` sem
extensão — o build gera `.avif` e `.webp` —, `alt`, `credito`), `audio` de 45 s por idioma,
`secretaria` (`nome`, `url`, `selo`), `pontos` (**exatamente 4**).

**CS-CONT-002** — `pontos.json`: `id`, `municipio`, `tipo` (`essencial | complementar |
inesperado`), `nome`, `categoria` (`natureza | historia | cultura | gastronomia | esporte`),
`coords [lat, lon]`, `teaser` (**máximo 180 caracteres**), `texto`, `audio`, `foto` (`v` 4:5 para
uso principal, `h` 16:9 para `og:image`, `alt`, `credito`), `fonte_verificacao[]`
(`afirmacao`, `url`, `consultado_em`, `revisor`), `ordem` 1..4 dentro do município.

**CS-CONT-003** — `rotas.json`: quatro rotas, com `id`, `nome`, `eixo`, `cor` do traçado,
`municipios`, `pontos` em sequência, `geometria` (GeoJSON LineString ou path SVG),
`duracao_sugerida`, `distancia_km` e `tempo_estimado` (**`null` até serem apurados em fonte de
roteirização — nunca estimados**), `pdf`.

**CS-CONT-004 · Cobertura das rotas** — cada município aparece em **exatamente 2** rotas:

| Rota | Municípios |
| :-- | :-- |
| `rota-da-lagoa` | Saquarema · Araruama · Iguaba Grande · São Pedro da Aldeia |
| `rota-do-mar` | Cabo Frio · Arraial do Cabo |
| `rota-da-mata` | Silva Jardim · Casimiro de Abreu · Rio das Ostras |
| `conderlagos-inteiro` | as dez |

Rota cria hierarquia entre municípios por construção; a cobertura plana é o que impede isso de
virar problema político. Por isso é teste, não disciplina.

**CS-CONT-005** — Nome de rota **nunca** começa com nome de município. "A rota da lagoa", não
"De Cabo Frio a Saquarema".

**CS-CONT-006** — `fatos.json`: os três fatos da home, cada um com `id` (`aereo | wsl |
natureza`), `titulo`, `numero`, `texto`, `fonte_url`, `fonte_nome`, `confianca`. Todo fato
exibido carrega fonte.

**CS-CONT-007 · Cobertura de idioma** — decisão do operador em 12/08/2026, revista em 13/08/2026,
com o custo de produção como motivo.

| Camada | Idiomas obrigatórios | Comportamento nos demais |
| :-- | :-- | :-- |
| Interface — rótulo, botão, navegação, formulário, mensagem de erro | **`pt`, `en`, `es`** | idioma fora do trio não existe |
| Conteúdo — `linha`, `teaser`, `texto`, `nome` de ponto e de rota, `alt`, `eixo`, `duracao_sugerida` | **`pt`, `en`, `es`** | fallback para `en` |
| Áudio — 10 municípios + 40 pontos | **`pt`, `en`, `es`** (150 arquivos) | toca a faixa `en` |

Interface e conteúdo passaram a ter a **mesma** lista em 13/08/2026 (ver CS-NAV-006): era a
diferença entre as duas linhas que produzia a tela mentirosa. O fallback continua sendo `en`,
nunca `pt`, e agora só alcança conteúdo que o validador já exigiu — é rede, não caminho.

**CS-CONT-008** — O fallback é **silencioso**. Nenhuma tela avisa que aquele idioma não tem
conteúdo próprio — seria explicar a mecânica (CS-OURO-001) e transformar uma limitação em
mensagem. `og:locale` e o atributo `lang` do HTML declaram o idioma **realmente servido** naquele
bloco, para leitor de tela e para indexação.

**CS-CONT-009** — **Meio idioma é pior que nenhum**, e desde 13/08/2026 essa é a razão de o site
ter três e não oito: o comprador coreano via a interface em coreano e ouvia o áudio em inglês, e
nada na tela dizia isso. Se aparecer verba ou tempo antes de 19/09, a ordem de expansão é
`de` → `fr` → `it` → `zh` → `ko`, e um idioma novo só entra com **interface, conteúdo e áudio**
juntos. O validador recusa qualquer idioma fora do trio até que isso aconteça.

### 7.1 Validação de build — falha, não avisa

**CS-VAL-001** — O build **falha** se qualquer uma destas condições ocorrer:

1. algum município com ≠ 4 pontos;
2. algum `teaser` com mais de 180 caracteres;
3. algum ponto sem ao menos um item em `fonte_verificacao`;
4. a string `Búzios`, `Buzios`, `Região dos Lagos` ou `os 10 munic` em qualquer arquivo de
   conteúdo;
5. `credito` ausente em qualquer foto;
6. algum município em ≠ 2 rotas;
7. `distancia_km` ou `tempo_estimado` preenchido sem `fonte` correspondente;
8. `nome` de rota começando com nome de município;
9. as strings `viagem`, `modo viagem` ou `roteiro` em nome de rota, componente, arquivo, evento
   ou copy (CS-NOME-001);
10. `pt`, `en` ou `es` ausente em qualquer campo de conteúdo ou faixa de áudio (CS-CONT-007);
11. qualquer idioma fora de `pt`, `en`, `es` em campo multilíngue — desde 13/08/2026 o trio é a
    lista inteira, e o idioma desconhecido é recusado antes de chegar a meio idioma (CS-CONT-009).

**CS-VAL-002** — `scripts/export-content.ts` valida o schema **antes** de escrever e falha
ruidosamente se um campo obrigatório estiver vazio.

---

## 8. Formulário e leads

**CS-LEAD-001** — Um único formulário, aberto em modal a partir de qualquer CTA de município. O
município de origem do clique já vem **marcado**; os outros oito aparecem como checkbox, em
ordem alfabética.

**CS-LEAD-002** — Campos: `nome` · `email` · `empresa` · `pais` (select) · `tipo_negocio`
(agência | operadora | receptivo | imprensa | órgão público | outro) · `cidades[]` ·
`consentimento` (checkbox **não** pré-marcado).

**CS-LEAD-003 · Texto de consentimento** — literal, não parafrasear:

> Autorizo o Conderlagos e a Tuggi a me enviarem o material das cidades selecionadas e
> informações sobre o Conderlagos. Posso pedir a exclusão dos meus dados a qualquer momento.

**CS-LEAD-004** — Uma submissão gera **N registros** de `interesse_declarado`, um por município
marcado.

**CS-LEAD-005 · Persistência** — o DBA cria a tabela `leads_abav_2026` em schema isolado, sem
relação com as tabelas de produto. Campos: os do formulário + `created_at`, `qr_id`, `lang`,
`session_id`. **Nenhum lead em planilha de terceiro.**

**CS-LEAD-006 · Endpoint** — rota serverless mínima (Cloudflare Function) com rate limit e
validação de schema. A chave de escrita fica só no ambiente do endpoint, **nunca no cliente**.

**CS-LEAD-007** — Taxa de conclusão medida em teste com 5 pessoas reais. Abaixo de 60%, o UX/UI
reduz campos antes de seguir.

---

## 9. Instrumentação

**CS-EVT-001** — Existe **um único helper** e nenhum componente chama o analytics diretamente:

```ts
track(evento: EventName, props?: Record<string, string | number>): void
```

**CS-EVT-002** — Todo evento recebe automaticamente `session_id` (UUID em `sessionStorage`,
expira ao fechar a aba), `ts` (ISO) e `lang`.

**CS-EVT-003 · Taxonomia:**

| Evento | Propriedades |
| :-- | :-- |
| `session_start` | `qr_id`, `entry_municipio` (slug ou `null`), `device`, `locale_navegador`, `referrer` |
| `lang_select` | `lang`, `modo` (`barra`) — só troca deliberada; a entrada não emite (CS-NAV-007) |
| `home_fato_view` | `fato_id` |
| `municipio_open` | `municipio`, `entry_municipio`, `cruzamento` (bool), `origem` (`home` \| `outras_cidades` \| `menu`), `posicao_no_sorteio` |
| `poi_open` | `poi_id`, `municipio` |
| `audio_play` | `poi_id`, `municipio`, `origem` (`home` \| `cidade` \| `ponto` \| `rota`) |
| `audio_progress` | `poi_id`, `pct` (25 \| 50 \| 75 \| 100) |
| `rota_open` | `rota_id`, `origem` (`mapa` \| `cards` \| `cidade`) |
| `rota_ouvir_start` / `rota_ouvir_complete` | `rota_id`, `pct_percorrido` |
| `mapa_interacao` | `alvo` (`cidade` \| `rota`), `id` |
| `cta_click` | `municipio` |
| `form_open` / `form_submit` | `origem_municipio` |
| `interesse_declarado` | `municipio` — um evento por município marcado |
| `rota_download` | `rota_id` |
| `share_click` | `tipo`, `municipio` \| `poi_id` |

**CS-EVT-004** — Todo `municipio_open` carrega `entry_municipio` e o booleano `cruzamento`
(`municipio !== entry_municipio`). Sem exceção, em qualquer origem.

**CS-EVT-005** — A instrumentação entra na semana 3, junto com a navegação. Deixá-la para o final
faz o painel nascer vazio, e isso é irrecuperável depois da feira.

---

## 10. Análise — a regra que impede a conclusão errada

**CS-DADO-001** — Com entrada por mesa, a contagem de aberturas de um município **deixa de medir
interesse** e passa a medir fluxo de pedestre na mesa, que é função da posição no estande e de
quem está atendendo. Apresentar abertura bruta como "interesse" entrega conclusão errada para
dez prefeitos ao mesmo tempo.

**CS-DADO-002** — Cinco sinais distintos. **Nunca somados, nunca combinados num índice**, no
código ou na tela:

| Sinal | Evento | O que mede |
| :-- | :-- | :-- |
| Entrada | `session_start` + `entry_municipio` | fluxo de pedestre na mesa — posição no estande e atendimento. **Não é interesse pelo destino** |
| Abertura | `municipio_open` | curiosidade — inflada para o município de entrada |
| **Cruzamento** | `municipio_open` com `cruzamento: true` | **interesse genuíno, não induzido pela presença física — o número de destaque** |
| Atenção | `audio_play` + `audio_progress` | segundos efetivamente ouvidos |
| Interesse declarado | `interesse_declarado` | intenção — a pessoa pediu material |

**CS-DADO-003** — O cruzamento é a métrica de destaque: é o único número que prova, com dado, que
o consórcio gera valor que a soma das partes não gera.

**CS-DADO-004** — Todo bloco do painel que exibe um número por município traz, impressa ao lado,
esta nota:

> A contagem de aberturas de um município inclui quem entrou pela mesa dele e é, por construção,
> maior. A comparação justa entre municípios se faz por cruzamento e por atenção, nunca por
> abertura bruta.

### 10.1 Painel

**CS-PAINEL-001** — Rota `/painel`, protegida por senha (basic auth no Cloudflare), sem idioma.

**CS-PAINEL-002** — Blocos, nesta ordem:

1. **Cruzamento** — no topo: quantos profissionais entraram por um município e abriram outro, em
   valor absoluto e em % das sessões que entraram por mesa
2. Alcance — sessões únicas, por dia e total
3. Idioma — a medida direta do alcance internacional
4. **Desempenho por mesa** — sessões iniciadas em cada mesa, rotulado como dado de fluxo físico,
   não de interesse
5. **Os cinco sinais por município**, lado a lado e nomeados: entrada · abertura · cruzamento ·
   atenção · interesse declarado
6. **Matriz de cruzamento 10×10** — entrou por X, abriu Y. Revela quais pares de municípios
   interessam ao mesmo comprador; é o insumo direto de rota regional integrada e o argumento
   factual a favor do consórcio
7. Movimento por hora, por dia de feira
8. Funil: `session_start` → `lang_select` → `audio_play` → 2º `audio_play` → `rota_ouvir_complete`
   → `form_submit`
9. Pontos mais ouvidos, ordenados por **tempo total de escuta**, não por clique
10. **Recorte individual por município** — dez blocos, ordem alfabética, exportáveis em PDF
    separado
11. Qual peça física converteu (`qr_id`)

**CS-PAINEL-003** — Existe protótipo de referência (`painel-conderlagos-amostra.html`, com números
simulados). Reproduzir a estrutura e os cortes; **não reaproveitar os números**.

**CS-PAINEL-004** — O painel não pode carregar credencial de leitura do analytics no cliente
(CS-OURO-009). A leitura passa por Cloudflare Function atrás do basic auth. Ver
[P-15](01-pendencias.md).

---

## 11. Design e performance

**CS-DESIGN-001** — Mobile-first, testado primeiro em **375 px**. Desktop é adaptação, não o
inverso.

**CS-DESIGN-002** — Áudio é o produto; foto é a isca; texto é a acessibilidade. **Se em qualquer
tela o texto ocupar mais espaço que o botão de play, a tela está errada.**

**CS-DESIGN-003** — Paleta e tipografia saem do manual de marca do Conderlagos
([P-01](01-pendencias.md)). Até chegar: tokens neutros, e **nenhuma cor codificada direto em
componente** — tudo por custom properties num único arquivo de tema.

**CS-DESIGN-004** — Alvos de toque ≥ 44×44 px. Contraste mínimo 4,5:1 para texto.

**CS-DESIGN-005 · Três níveis de ação, e um dono só.** *Decidido pelo operador em 14/08/2026,
depois de o site chegar a quatro tratamentos de botão escritos à mão, em quatro arquivos, sem
nome nenhum.* Toda ação clicável vestida de botão sai de `classesDeAcao()`, em
[`componentes/acao.ts`](../componentes/acao.ts). Escrever a aparência de um botão em qualquer
outro arquivo é defeito, e um teste confere.

| Nível | O que é | Onde está hoje |
| :-- | :-- | :-- |
| **primária** | a ação principal da dobra, **uma só** | o play (CS-DESIGN-002) |
| **secundária** | o caminho oficial que a página oferece depois da principal | secretaria do município, lista dos 40 lugares |
| **terciária** | existe, não disputa | compartilhar, canais de rede social |

**Nível é peso; largura é espaço; as duas são independentes.** Era exatamente aí que os dois
tratamentos do meio divergiam antes desta regra: um era largo por estar sozinho no bloco, o
outro estreito por estar numa linha, e a diferença de padding virou uma diferença de
hierarquia que ninguém decidiu.

**Link de texto não é ação e não passa por aqui** — voltar de nível, ou o link da secretaria
dentro de uma linha da tabela de contatos, são links em fluxo de leitura. Vestir de pílula
cada linha de uma tabela de dez transforma a tabela em dez chamadas.

**Esta regra não decide cor.** Os níveis citam token de `app/tema.css`, e CS-DESIGN-003 continua
sendo quem manda em paleta. Quando o manual de marca (P-01) chegar, muda-se o tema e nenhum
nível muda.

**CS-PERF-001 · Orçamento não negociável:**

| Métrica | Teto |
| :-- | :-- |
| Carga até a primeira tela interativa | **< 500 KB** |
| HTML + CSS + JS inicial | **< 180 KB** comprimido |
| LCP em 4G throttled (Moto G Power / iPhone SE) | **< 2,0 s** |
| Do scan ao primeiro áudio tocável | **< 5 s** |
| Lighthouse mobile — performance | **≥ 90** |
| Lighthouse mobile — acessibilidade | **≥ 95** |

**CS-PERF-002** — `scripts/perf-check.ts` com Lighthouse CI em rede throttled roda **em cada PR,
desde a primeira semana**. PR que estoura o orçamento não entra.

> **Divergência aberta, apurada em 14/08/2026: `scripts/perf-check.ts` nunca existiu.** A meta
> de performance ≥ 90 e a de acessibilidade ≥ 95 desta seção foram, até esta data, intenção e
> não garantia. Lighthouse precisa de Chrome e de um servidor de pé, o que é decisão de
> infraestrutura de CI e não cabe a um commit de conteúdo. **O que passou a existir** é
> `scripts/a11y-check.ts`, que roda no `postbuild`, varre as 176 páginas geradas e derruba o
> build — sem navegador, sem rede. Ele cobre marcação (CS-DESIGN-006 abaixo); **não** cobre
> performance, ordem de foco nem leitura real por leitor de tela, que continuam esperando o
> Lighthouse e o critério A-22.

**CS-DESIGN-006 · Acessibilidade: régua no build, e dois controles na tela.** *Decidido pelo
operador em 14/08/2026.* Duas coisas diferentes, e a primeira é a que sustenta a segunda.

**A régua** — `scripts/a11y-check.ts` roda no `postbuild` e derruba o build quando qualquer
página gerada tem imagem sem `alt`, controle sem nome acessível, `<html>` sem `lang`, `id`
repetido, página sem `<h1>` ou com dois, ou `target="_blank"` sem `rel="noopener"`. O
verificador é provado por testes que lhe dão marcação defeituosa de propósito: verificador que
nunca acusou nada é indistinguível de verificador quebrado. O contraste dos tokens é
**calculado** a partir do OKLCH de `app/tema.css`, par a par, contra os 4,5:1 de CS-DESIGN-004
— ninguém estima contraste de OKLCH de cabeça, e foi essa conta que achou o turquesa a 3,35:1
em quatro telas. Exclusão da varredura carrega o motivo escrito e aparece na saída toda vez.

**Os controles** — no rodapé, ao lado da escolha de idioma, nunca na primeira dobra
(CS-HOME-001). São dois:

| Controle | Estados | O que faz |
| :-- | :-- | :-- |
| Tamanho do texto | `padrao`, `grande`, `maior` | `font-size` da raiz; todo o resto é `rem` e acompanha |
| Movimento | `sistema`, `reduzido` | para o vídeo da capa e as transições |

- **O padrão de movimento é `sistema`, não "completo".** Quem já pediu `prefers-reduced-motion`
  no aparelho não pede de novo aqui; o controle existe para quem não sabe que essa chave existe.
- **A escolha vale para a sessão**, em `sessionStorage`, como o resto do estado do site. Não é
  cookie e não identifica ninguém: CS-OURO-010 fica inteiro.
- **Não existe "alto contraste"**, e a ausência é decisão: a paleta publicada mede de 6,0:1 a
  18,4:1, e uma segunda paleta seria um segundo lugar com cor, que é o que CS-DESIGN-003 proíbe
  enquanto o manual de marca (P-01) não chega.
- **O alvo de toque não encolhe com o texto:** os 44 px de CS-DESIGN-004 são px de propósito,
  porque são piso e não altura.

**CS-PERF-003** — Imagens: AVIF com fallback WebP, `srcset` responsivo, `loading="lazy"` fora da
primeira dobra, dimensões declaradas para não causar layout shift.

**CS-PERF-004** — Áudio: MP3 mono 48–64 kbps, carregado sob demanda, **um por vez**. Nunca
pré-carregar os 40.

**CS-PERF-005** — Service worker cacheia o shell da aplicação e os áudios **já ouvidos**. **Não**
pré-cacheia tudo na entrada: isso quebraria o orçamento de 500 KB, que é o número que decide se o
QR funciona no pavilhão lotado.

---

## 12. Aceite — o que o QA valida em dispositivo físico

Emulador não vale para nenhum destes itens.

| # | Verificação | Regras provadas |
| :-- | :-- | :-- |
| A-01 | iPhone (Safari iOS) e Android (Chrome), em 375 px e 414 px | CS-DESIGN-001 |
| A-02 | Rede throttled a 3G lento **e** modo avião após a primeira carga | CS-PERF-001, CS-PERF-005 |
| A-03 | Encadeamento de áudio da rota em Safari iOS físico, após o gesto inicial | CS-ROTA-003 |
| A-04 | Duas sessões anônimas → ordens diferentes; recarga na mesma sessão → ordem igual | CS-SORT-001, CS-SORT-004 |
| A-05 | Os dez redirects de mesa, um a um: município correto, idioma do aparelho, `entry_municipio` correto, botão voltar não retorna ao redirect | CS-NAV-002, CS-NAV-003, CS-NAV-005 |
| A-06 | Entrar por `/saquarema` e abrir Arraial pelo módulo das outras cidades → `cruzamento: true`, `origem: "outras_cidades"`; abrir a própria Saquarema → `cruzamento: false` | CS-EVT-004, CS-OITO-006 |
| A-07 | O módulo das outras cidades nunca mostra o município atual, em nenhuma das dez páginas | CS-OITO-001 |
| A-08 | Cobertura das rotas verificada por script: cada município em exatamente 2 | CS-CONT-004 |
| A-09 | Seção "Lugares": em 20 sessões, nenhum município com zero ou dois cards; o ponto sorteado varia entre sessões | CS-HOME-006 |
| A-10 | Nenhum `distancia_km` ou `tempo_estimado` publicado sem `fonte` | CS-CONT-003 |
| A-11 | `viagem`, `modo viagem`, `roteiro`: zero ocorrências no código e no HTML gerado | CS-NOME-001 |
| A-12 | Uma submissão com 3 municípios marcados → 3 eventos `interesse_declarado` | CS-LEAD-004 |
| A-13 | Todos os eventos de CS-EVT-003 disparando, verificados no painel de analytics | CS-EVT-003 |
| A-14 | `grep` no `out/`: nenhuma ocorrência de "Búzios", "Região dos Lagos", "os 10 municípios" — **inclusive em rótulo de mapa** | CS-OURO-003 |
| A-15 | Todo `teaser` ≤ 180 caracteres no HTML gerado | CS-CONT-002 |
| A-16 | Nenhuma foto sem crédito visível | CS-OURO-006 |
| A-17 | Nenhuma requisição a domínio de terceiro além do CDN próprio e do analytics auto-hospedado | CS-OURO-010, CS-ARQ-004 |
| A-18 | Do scan ao primeiro áudio de ponto: ≤ 2 toques, < 5 s | CS-MUN-004 |
| A-19 | Taxa de conclusão do formulário ≥ 60% com 5 pessoas reais | CS-LEAD-007 |
| A-20 | O seletor do rodapé oferece `pt`, `en` e `es`, e cada um serve interface **e** conteúdo no próprio idioma | CS-CONT-007, CS-NAV-006 |
| A-21 | O atributo `lang` do HTML e `og:locale` declaram o idioma realmente servido no bloco, não o escolhido | CS-CONT-008 |
| A-22 | **Com teclado e com leitor de tela, num aparelho de verdade:** percorrer a home e uma página de município só com Tab, sem cair em armadilha de foco nem em controle sem nome; ouvir a página de município inteira no VoiceOver do iOS e no TalkBack do Android. É o que a régua do build **não** alcança, e não tem substituto automático | CS-DESIGN-004, CS-DESIGN-006 |
| A-23 | Escolher "A++" e recarregar: o texto já nasce grande, **sem salto de layout**. Escolher "Movimento reduzido" com a home aberta: o vídeo da capa para na hora, sem recarregar | CS-DESIGN-006 |

---

## 13. O que não fazer

- Não conectar o site ao Supabase em tempo de execução.
- Não usar Google Maps, Google Analytics, Meta Pixel ou qualquer script de terceiro com cookie.
- Não criar ranking, contador público, badge de "mais visitado" ou qualquer elemento que compare
  municípios em tela pública.
- Não adicionar animação decorativa que custe orçamento de performance.
- Não escrever adjetivo de folheto. Se a frase funcionaria para qualquer praia do Brasil, ela não
  vai ao ar.
- Não inventar dado, número, data ou fato histórico. Sem fonte, sem frase.
- Não deixar a instrumentação para o final.
- Não bloquear o deploy esperando o domínio do consórcio.

---

## 14. Divisão de trabalho

| Papel | Escopo |
| :-- | :-- |
| **Product Owner** | este documento e `01-pendencias.md`; guarda das regras de ouro; aprova qualquer desvio |
| **DBA Sr** | único a tocar o Supabase: `scripts/export-content.ts`, migration de `leads_abav_2026`, dump versionado |
| **Fullstack Sr** | Next.js, rotas, componentes, endpoint de leads, painel, build e deploy |
| **UX/UI + CRO Sr** | design system, telas, hierarquia visual, CTA, formulário, taxa de conclusão |
| **QA Sr** | critérios de aceite do §12, dispositivo real, rede limitada, matriz de navegadores |
| **Mobile Sr** | consultoria em comportamento de áudio, Safari iOS e gestos — não há app nativo aqui |

Cada etapa concluída gera um documento em `docs/` descrevendo o que foi feito e por quê.

**Ordem da primeira entrega, antes de qualquer código:** este documento → `01-pendencias.md` →
`02-arquitetura.md` (Fullstack) → `03-modelo-de-dados.md` (DBA) → `scripts/validate-content.ts`
funcionando com dados de exemplo.
