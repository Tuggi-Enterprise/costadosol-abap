'use client'

/**
 * CS-ROTA-004 pede `rota_open`, e a lista de rotas não emitia nada — o funil do painel
 * (CS-PAINEL-002, bloco 8) nasceria com um degrau vazio no meio.
 *
 * É só o link, com o evento: a aparência de cada lista fica em quem chama, porque a
 * página de rotas e a "para quem vende" mostram a mesma rota em dois contextos.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { track } from '../lib/track.ts'

export function LinkDeRota({
  href,
  rotaId,
  origem,
  className,
  children,
}: {
  href: string
  rotaId: string
  origem: 'mapa' | 'cards' | 'cidade'
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      data-alvo="toque"
      onClick={() => track('rota_open', { rota_id: rotaId, origem })}
      className={className}
    >
      {children}
    </Link>
  )
}
