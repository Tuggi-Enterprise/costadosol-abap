'use client'

/**
 * CS-HOME-005 — número grande, uma frase, o nome da fonte. Fato, nunca adjetivo.
 *
 * O evento `home_fato_view` da taxonomia (CS-EVT-003) media exatamente a coisa que um
 * clique não mede: se os três fatos foram VISTOS. Ele não existia. Sai quando o bloco
 * entra na tela, uma vez por fato e por sessão — contar de novo a cada rolagem
 * transformaria "quem viu" em "quantas vezes rolou".
 *
 * CS-OURO-006: todo fato exibido carrega fonte, e a fonte abre em outra aba — no
 * pavilhão, mandar o visitante para fora do site é perdê-lo.
 */
import { useEffect, useRef } from 'react'
import { track } from '../lib/track.ts'

export type FatoExibido = {
  id: string
  numero: string
  texto: string
  fonte_url: string
  fonte_nome: string
}

export function Fatos({ itens }: { itens: FatoExibido[] }) {
  const bloco = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const raiz = bloco.current
    if (!raiz || typeof IntersectionObserver === 'undefined') return

    const vistos = new Set<string>()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const id = (entrada.target as HTMLElement).dataset['fato']
          if (!entrada.isIntersecting || !id || vistos.has(id)) continue
          vistos.add(id)
          track('home_fato_view', { fato_id: id })
          observador.unobserve(entrada.target)
        }
      },
      { threshold: 0.6 },
    )

    for (const item of raiz.querySelectorAll('[data-fato]')) observador.observe(item)
    return () => observador.disconnect()
  }, [itens])

  return (
    <section className="bg-oceano-fundo px-4 py-7 text-white">
      <ul ref={bloco} className="grid gap-6">
        {itens.map((fato) => (
          <li
            key={fato.id}
            data-fato={fato.id}
            className="grid grid-cols-[auto_1fr] items-baseline gap-x-4"
          >
            <p className="text-secao font-semibold tabular-nums text-lagoa">{fato.numero}</p>
            <div>
              <p className="max-w-[46ch] text-[0.95rem] leading-snug text-white/90">{fato.texto}</p>
              <p className="mt-1 text-[0.7rem] tracking-wide text-white/70 uppercase">
                <a
                  href={fato.fonte_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {fato.fonte_nome}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
