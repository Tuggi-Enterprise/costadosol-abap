'use client'

/**
 * Todo link para uma página de município deixa o bilhete de origem antes de navegar —
 * a abertura em si é contada na página de destino (ver componentes/RegistrarAbertura.tsx).
 *
 * Sem o bilhete, um clique vindo da lista de lugares seria lido como entrada por mesa
 * quando a pessoa tivesse entrado pela mesa daquela mesma cidade. É pouca gente e é um
 * rótulo errado numa tela que nove prefeituras vão ler (CS-DADO-001).
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { marcarOrigemDeAbertura, type OrigemDeAbertura } from '../lib/track.ts'

export function LinkDeMunicipio({
  href,
  municipio,
  origem = 'interno',
  className,
  children,
}: {
  href: string
  municipio: string
  origem?: OrigemDeAbertura
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      data-alvo="toque"
      onClick={() => marcarOrigemDeAbertura(municipio, origem)}
      className={className}
    >
      {children}
    </Link>
  )
}
