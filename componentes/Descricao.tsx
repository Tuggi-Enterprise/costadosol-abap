'use client'

/**
 * Descrição da cidade, abaixo da capa. Os cinco parágrafos ocupavam quase duas telas de
 * celular antes do primeiro ponto; abre com o primeiro e o resto fica a um toque.
 */
import { useState } from 'react'

export function Descricao({
  paragrafos,
  lang,
  rotulos,
}: {
  paragrafos: string[]
  /** CS-CONT-008: o idioma realmente servido. */
  lang: string
  rotulos: { lerMais: string; lerMenos: string }
}) {
  const [aberta, setAberta] = useState(false)
  const visiveis = aberta ? paragrafos : paragrafos.slice(0, 1)

  return (
    <div className="px-4 pt-6">
      <div lang={lang} className="space-y-4 text-[1rem] leading-relaxed md:columns-2 md:gap-8 md:space-y-0 md:[&>p+p]:mt-4">
        {visiveis.map((p) => (
          <p key={p} className="break-inside-avoid">{p}</p>
        ))}
      </div>
      {paragrafos.length > 1 && (
        <button
          type="button"
          onClick={() => setAberta(!aberta)}
          aria-expanded={aberta}
          className="mt-3 text-sm text-tinta-suave underline underline-offset-4"
        >
          {aberta ? rotulos.lerMenos : rotulos.lerMais}
        </button>
      )}
    </div>
  )
}
