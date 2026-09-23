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
  titulo: string
  numero: string
  texto: string
  fonte_url: string
  fonte_nome: string
}

export function Fatos({ itens, titulo }: { itens: FatoExibido[]; titulo: string }) {
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

  // Coluna do número com largura fixa no telefone: com `auto` cada linha media o próprio
  // número, e "3" e "9 790 ha" empurravam o texto para alturas diferentes. No desktop os três
  // viram colunas, número em cima.
  return (
    <section className="bg-oceano-fundo px-4 py-8 text-white">
      <h2 className="mb-5 text-[0.75rem] font-semibold tracking-widest text-white/70 uppercase">{titulo}</h2>
      <ul ref={bloco} className="grid gap-6 md:grid-cols-3 md:gap-8">
        {itens.map((fato) => (
          <li
            key={fato.id}
            data-fato={fato.id}
            className="grid grid-cols-[6.5rem_1fr] items-start gap-x-4 border-t border-white/15 pt-4 md:grid-cols-1 md:gap-y-2"
          >
            <p className="text-secao font-semibold whitespace-nowrap tabular-nums text-lagoa">{fato.numero}</p>
            <div>
              <h3 className="text-[1rem] leading-snug font-semibold">{fato.titulo}</h3>
              <p className="mt-1 max-w-[46ch] text-[0.9rem] leading-snug text-white/85">{fato.texto}</p>
              <p className="mt-2 text-[0.7rem] tracking-wide text-white/70 uppercase">
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
