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
 */
import type { ReactNode } from 'react'
import { Foto, FOTO_PENDENTE } from './Foto.tsx'

export function Hero({
  src,
  alt,
  credito,
  titulo,
  linha,
  idiomaDaLinha,
  children,
}: {
  src: string
  alt: string
  credito: string
  titulo: string
  linha?: string
  idiomaDaLinha?: string
  children?: ReactNode
}) {
  return (
    <header>
      <div className="relative">
      <Foto
        src={src}
        alt={alt}
        credito={credito}
        proporcao="hero"
        prioridade
        arredondada={false}
        credito_em="fora"
        pendente_em="proporcao"
        sizes="(min-width: 46rem) 46rem, 100vw"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, var(--color-oceano-fundo) 0%, color-mix(in oklab, var(--color-oceano-fundo) 88%, transparent) 32%, color-mix(in oklab, var(--color-oceano-fundo) 45%, transparent) 55%, transparent 78%)',
        }}
      />
      {/* No desktop o bloco para de esticar: título de 46rem de largura e botão de
          largura inteira ficavam soltos no meio da foto. */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-5 md:max-w-lg">
        <h1 className="text-titulo font-semibold text-white drop-shadow-sm">{titulo}</h1>
        {linha && (
          <p lang={idiomaDaLinha} className="mt-2 max-w-[34ch] text-[1.05rem] leading-snug text-white/85">
            {linha}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
      </div>
      {/* Fora da foto: sobre ela, o crédito ficava atrás do gradiente e do botão — ou
          seja, deixava de ser visível, que é exatamente o que A-16 confere.

          Foto que não existe não tem autor a creditar, e a linha ia à tela mesmo assim:
          três municípios publicavam o marcador interno de P-05, com o número do card,
          embaixo de um retângulo azul. Crédito só onde existe foto. */}
      {src !== FOTO_PENDENTE && (
        <p title={credito} className="truncate px-4 pt-1.5 text-[0.7rem] text-tinta-suave">
          {credito}
        </p>
      )}
    </header>
  )
}
