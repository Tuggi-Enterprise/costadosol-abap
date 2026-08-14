# 14/08/2026 — troca de marca, vídeo de capa e domínio

O que sobra da mudança de 14/08/2026 depois que o card fecha: a ação que o humano precisa
executar, a alternativa descartada por motivo não óbvio, e a procedência de dois arquivos que
não vieram do cliente. O que é só histórico está em `docs/00-regras-de-negocio.md` (CS-OURO-003,
CS-ARQ-005) e em `docs/01-pendencias.md` (P-29 fechada).

## 1. Ação pendente do operador humano — QR impresso

**O domínio vai dentro do QR.** `CS-ARQ-005` passou de `costadosol.tuggi.app` para
`revista.conderlagos.com.br`, e todo QR gerado antes disso aponta para o host antigo.

Antes de mandar imprimir qualquer mesa:

1. Confirmar que `revista.conderlagos.com.br` já responde, com certificado válido.
2. Gerar os QR a partir de `https://revista.conderlagos.com.br/<slug>/`, **com a barra final**
   (sem ela o servidor responde 308 antes do rewrite, e é um salto a mais no pavilhão).
3. São **dez** mesas, não nove: `armacao-dos-buzios` entrou (P-29, opção 2). A décima mesa e
   quem a opera são P-09.

Se o domínio novo não ficar de pé a tempo, a saída é apontar o antigo para o novo por
redirecionamento e imprimir com o novo assim mesmo — nunca imprimir com o antigo, porque papel
não se atualiza com deploy.

## 2. Alternativa descartada — o vídeo como embed do YouTube

O pedido original era embutir `https://youtu.be/igT7enCbPdA`. Não foi por aí, e o motivo não é
óbvio pelo código:

- **CSP.** O site publica `default-src 'self'` sem `frame-src` (`next.config.ts`), e um embed do
  YouTube exige abrir `frame-src` para `youtube-nocookie.com`. Isso revoga na prática CS-OURO-010
  e o critério de aceite A-17, que existem para que nenhum terceiro receba requisição do visitante.
- **Peso.** O player do YouTube carrega da ordem de meio megabyte de script antes do primeiro
  fato da home, num pavilhão com wifi disputado.

O que está no ar é o arquivo que o operador forneceu em bucket público do Supabase, recomprimido
e servido de `/public`, o que cabe em `media-src 'self'` sem tocar na CSP.

**Compressão aplicada** (o original tem 10,9 MB, que não se serve como capa):

```
ffmpeg -i <original>.mp4 -an -c:v libx264 -profile:v main -pix_fmt yuv420p \
  -vf scale=854:480 -crf 33 -preset slow -g 48 -movflags +faststart \
  public/video/conderlagos.mp4
```

Resultado: 2,96 MB, 1 min 33 s, sem trilha de áudio. `-an` não é economia à toa: o vídeo toca
mudo por exigência da política de reprodução automática dos navegadores, então a trilha seria
peso que ninguém ouve. O poster é um quadro do próprio vídeo, extraído em `-ss 16`.

**O que o cliente ainda pode querer decidir:** o filme tem trecho institucional no meio (reunião
de gabinete, obra) que não é imagem de destino turístico. Como capa em loop, um corte só com as
tomadas aéreas funcionaria melhor. Não foi feito porque cortar o material do cliente é decisão
dele, não nossa.

## 3. Procedência do logotipo — arquivo provisório, licença anotada

`public/img/marca/conderlagos.webp` **não** é o ativo oficial. Ele foi recortado de
`File:Conderlagos.jpg` do Wikimedia Commons, 800×450, CC BY-SA 4.0, autoria de
`Leandropixelsilva` (https://commons.wikimedia.org/wiki/File:Conderlagos.jpg). Fundo branco
chapado, sem versão vetorial e sem versão para fundo escuro — por isso a marca só aparece sobre
superfície clara (rodapé e tela de entrada), e não sobre o vídeo da capa.

O ativo oficial é **P-01**. Quando chegar, troca-se o conteúdo de `public/img/marca/` e
`componentes/Marca.tsx` não muda.

## 4. Fotos de Armação dos Búzios — uma tem defeito visível

As cinco fotos de Búzios vieram do Commons com licença aceita, como as demais (P-05 continua
aberta para todos os municípios). Uma delas merece registro:

- `img/poi/buzios-orla-bardot` traz **data gravada pela câmera no canto inferior** (`2013/07/26`).
  O assunto está certo (a estátua de Brigitte Bardot na orla), mas a marca d'água de data numa
  página de ente público é o tipo de coisa que se nota. Substituir assim que P-05 fechar.
