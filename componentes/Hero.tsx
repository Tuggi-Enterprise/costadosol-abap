/**
 * A capa de largura inteira da home e da página de município.
 *
 * Existia duas vezes, com dois gradientes ligeiramente diferentes — e um deles desenhava
 * uma tarja preta sob o título, que na captura de tela parecia letterbox de vídeo. Uma
 * peça só, com um gradiente de três paradas: a foto escurece devagar e o título fica
 * legível sem que apareça uma faixa.
 *
 * CS-DESIGN-002 — se o texto ocupar mais espaço que o play, a tela está errada. Por isso
 * a capa aceita o botão como filho e o coloca logo abaixo da linha.
 *
 * **Duas mídias, um componente.** Passando `video`, a capa mostra o filme institucional
 * em vez da foto. O que muda com ele não é só a mídia:
 *
 *   - A foto é recortada em 5/6 no telefone porque foto aguenta recorte. O vídeo é 16/9 e
 *     tem a marca no primeiro quadro; em 5/6 sobrariam 47% da largura, cortando o logotipo
 *     ao meio. Então o vídeo mantém 16/9 em toda tela, e nada é cortado.
 *   - Em 16/9 num telefone a capa tem cerca de 210 px de altura, e título, linha e botão de
 *     play não cabem por cima sem espremer os três. Abaixo de 46rem o bloco de texto desce
 *     para fora do vídeo, sobre o azul; do desktop para cima ele volta a ser sobreposição,
 *     onde os 414 px de altura sobram. É o mesmo bloco em dois lugares, não dois blocos.
 */
import type { ReactNode } from 'react'
import { Foto, FOTO_PENDENTE } from './Foto.tsx'
import { VideoDeCapa } from './VideoDeCapa.tsx'

export function Hero({
  src,
  alt,
  credito,
  titulo,
  linha,
  idiomaDaLinha,
  video,
  children,
}: {
  /** Obrigatório sem `video`. Ausente, a capa cai no marcador de foto pendente (P-05). */
  src?: string
  /** Descreve a mídia que está na capa, seja ela a foto ou o filme. */
  alt: string
  credito: string
  titulo: string
  linha?: string
  idiomaDaLinha?: string
  /** Quando existe, a capa é o filme e `src` deixa de ser lido. */
  video?: { src: string; poster: string; rotulos: { ativarSom: string; desativarSom: string } }
  children?: ReactNode
}) {
  const texto = (
    <div
      className={
        video
          ? 'relative bg-oceano-fundo px-4 pt-4 pb-6 md:absolute md:inset-x-0 md:bottom-0 md:max-w-lg md:bg-transparent md:pt-0 md:pb-5'
          : 'absolute inset-x-0 bottom-0 px-4 pb-5 md:max-w-lg'
      }
    >
      <h1 className="text-titulo font-semibold text-white drop-shadow-sm">{titulo}</h1>
      {linha && (
        <p lang={idiomaDaLinha} className="mt-2 max-w-[34ch] text-[1.05rem] leading-snug text-white/85">
          {linha}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )

  return (
    <header>
      <div className="relative">
        {video ? (
          <div className="aspect-video w-full overflow-hidden bg-oceano-fundo">
            <VideoDeCapa src={video.src} poster={video.poster} alt={alt} rotulos={video.rotulos} />
          </div>
        ) : (
          <Foto
            src={src ?? FOTO_PENDENTE}
            alt={alt}
            credito={credito}
            proporcao="hero"
            prioridade
            arredondada={false}
            credito_em="fora"
            pendente_em="proporcao"
            sizes="(min-width: 46rem) 46rem, 100vw"
          />
        )}
        <div
          // Sobre o vídeo o gradiente só existe onde o texto está por cima. No telefone o
          // texto desceu, e um gradiente ali só escureceria o fim do filme sem motivo.
          className={`pointer-events-none absolute inset-0 ${video ? 'hidden md:block' : ''}`}
          style={{
            background:
              'linear-gradient(to top, var(--color-oceano-fundo) 0%, color-mix(in oklab, var(--color-oceano-fundo) 88%, transparent) 32%, color-mix(in oklab, var(--color-oceano-fundo) 45%, transparent) 55%, transparent 78%)',
          }}
        />
        {/* No desktop o bloco para de esticar: título de 46rem de largura e botão de
            largura inteira ficavam soltos no meio da foto.

            O bloco fica DENTRO desta caixa nos dois casos: `md:absolute` precisa de um
            ancestral posicionado, e fora daqui o mais próximo seria o `<body>`. Com
            `relative` no telefone ele apenas segue o fluxo, logo abaixo do vídeo. */}
        {texto}
      </div>
      {/* Fora da foto: sobre ela, o crédito ficava atrás do gradiente e do botão — ou
          seja, deixava de ser visível, que é exatamente o que A-16 confere.

          Foto que não existe não tem autor a creditar, e a linha ia à tela mesmo assim:
          três municípios publicavam o marcador interno de P-05, com o número do card,
          embaixo de um retângulo azul. Crédito só onde existe foto. */}
      {(video || src !== FOTO_PENDENTE) && (
        <p title={credito} className="truncate px-4 pt-1.5 text-[0.7rem] text-tinta-suave">
          {credito}
        </p>
      )}
    </header>
  )
}
