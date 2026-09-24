'use client'

/**
 * O que a taxonomia de CS-EVT-003 não cobre, medido uma vez para o site inteiro:
 *
 * - `scroll_depth` — quanto da página a pessoa viu, em 25/50/75/100%, uma vez por marco
 *   em cada página. O GA4 sozinho só mede 90%.
 * - `ui_click` — todo toque em link ou botão, com o texto e o destino. Os eventos de
 *   negócio (`audio_play`, `poi_open`…) continuam saindo de onde saem; este é a rede que
 *   pega o resto, para nenhum clique ficar sem registro.
 *
 * Página vista, tempo de engajamento e origem do tráfego o GA4 coleta sozinho, inclusive
 * na navegação do App Router (medição avançada, "mudanças de página pelo histórico").
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { profundidade, track } from '../lib/track.ts'

const MARCOS = [25, 50, 75, 100] as const

export function Rastreamento() {
  const caminho = usePathname()

  useEffect(() => {
    const vistos = new Set<number>()
    const medir = () => {
      const e = document.documentElement
      const pct = profundidade(window.scrollY, window.innerHeight, e.scrollHeight)
      for (const marco of MARCOS) {
        if (pct >= marco && !vistos.has(marco)) {
          vistos.add(marco)
          track('scroll_depth', { pct: marco, pagina: caminho })
        }
      }
    }
    medir()
    window.addEventListener('scroll', medir, { passive: true })
    return () => window.removeEventListener('scroll', medir)
  }, [caminho])

  useEffect(() => {
    const clicar = (ev: MouseEvent) => {
      const alvo = (ev.target as Element | null)?.closest('a, button, [role="button"], summary')
      if (!alvo) return
      const href = alvo.getAttribute('href')
      track('ui_click', {
        elemento: alvo.tagName.toLowerCase(),
        texto: (alvo.getAttribute('aria-label') ?? alvo.textContent ?? '').trim().slice(0, 100),
        destino: href ? href.slice(0, 100) : null,
        pagina: window.location.pathname,
      })
    }
    // Captura: o clique é registrado antes de um link trocar de página.
    document.addEventListener('click', clicar, { capture: true })
    return () => document.removeEventListener('click', clicar, { capture: true })
  }, [])

  return null
}
