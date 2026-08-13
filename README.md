# costadosol-abav

Site da **Costa do Sol** — os nove municípios do Conderlagos — para o estande da ABAV Expo 2026.
Feira: 30/09 a 02/10/2026. **Congelamento de conteúdo: 19/09/2026.**

Repositório novo e isolado. Nada aqui é importado de, nem escrito em, `tuggi-cms`,
`tuggi-drive-v2` ou `tuggi-enterprise`.

## Leia antes de escrever código

| Documento | O que responde |
| :-- | :-- |
| [docs/00-regras-de-negocio.md](docs/00-regras-de-negocio.md) | as regras `CS-*`. É a fonte de verdade; produto vence processo |
| [docs/01-pendencias.md](docs/01-pendencias.md) | o que está travado, com quem, e o que não bloqueia |
| [docs/02-arquitetura.md](docs/02-arquitetura.md) | stack, estrutura de pastas, onde mora cada segredo |
| [docs/03-modelo-de-dados.md](docs/03-modelo-de-dados.md) | contrato de conteúdo, schema proposto, tabela de leads |

Regra que economiza retrabalho: **teste que prova uma regra cita o ID dela na descrição.** É assim
que se descobre qual promessa ainda não está provada.

## Comandos

```bash
npm install
npm run dev                           # http://localhost:3000 — roda com fixtures/validos
npm run build && npm start            # build de produção (Vercel)

npm run seed:exemplo                  # gera fixtures/validos (dados de marcador, nunca vão ao ar)
npm run validate fixtures/validos     # valida um diretório de conteúdo
npm run validate                      # valida content/ — o que o prebuild roda
npm run gen:redirects                 # gera as 9 entradas de mesa em public/<slug>/index.html
npm test                              # prova as regras, as entradas de mesa e o banco
npm run typecheck

# Banco local (PGlite — Postgres 18 em processo, sem Docker; ver P-27)
npm run db:local                      # aplica as migrations pendentes
npm run db:seed                       # carrega fixtures/validos e marca o banco como exemplo
npm run export -- content-dev         # banco -> JSON, para desenvolvimento
npm run export                        # banco -> content/ — recusa se o banco for de exemplo
```

## Estado em 13/08/2026

Hospedagem: **Vercel**. O site já roda: entrada de idioma, home com a grade sorteada, e a página
de município com os quatro pontos e o módulo das outras oito. O build emite 159 páginas estáticas:
3 idiomas × (home, 9 municípios, 36 pontos, 4 rotas e as fixas).

Pronto também: as regras consolidadas, o validador de conteúdo, as nove entradas de mesa, o banco
local com as duas migrations aplicadas e o caminho banco → JSON fechado. **70 provas**, cada uma
citando o ID da regra.

Onde ver o quê, rodando `npm run dev`:

| URL | O que é |
| :-- | :-- |
| `/` | resolve o idioma por `navigator.language` e redireciona (CS-NAV-007) |
| `/pt/` | home — grade dos nove, ordem sorteada por sessão |
| `/pt/saquarema/` | página de município: 4 pontos, CTA, as outras oito |
| `/saquarema/` | a entrada de mesa: grava a origem e sai em `location.replace` |
| `/es/silva-jardim/` | interface, conteúdo e áudio em espanhol — CS-CONT-007 na prática |
| `/pt/rotas/` e `/pt/rotas/rota-da-lagoa/` | as quatro rotas e uma delas |
| `/pt/lugares/` | os 36 lugares por município, em ordem alfabética |
| `/pt/para-quem-vende/` | rotas, fatos com fonte e contato das nove secretarias |

**`content/` tem conteúdo real**, apurado em fonte oficial (Setur-RJ, prefeituras, decreto
estadual) e composto por `npm run conteudo`. Cada um dos 36 pontos cita a URL de onde o fato saiu.
As fotos vêm do Wikimedia Commons com licença livre e autor identificado (`npm run fotos`);
24 dos 36 pontos têm foto, e os 12 restantes mostram o espaço vazio até P-05 fechar.

**Leia P-29 antes de escrever qualquer copy institucional.** A apuração mostrou que as duas
expressões autorizadas pela regra CS-OURO-003 são factualmente falsas.

Falta, na ordem de `docs/02-arquitetura.md` §11: mapa da região, página de rota, lugares,
para-quem-vende, imprensa, formulário e painel. O áudio depende de P-06.
