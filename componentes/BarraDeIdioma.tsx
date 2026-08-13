'use client'

/**
 * Barra fina de propósito: desde que a entrada resolve o idioma sozinha (CS-NAV-007), esta
 * barra deixou de ser o caminho principal e virou o caminho da exceção — quem quer trocar.
 * Ela continua mostrando as oito, que é o argumento de alcance internacional, mas não pode
 * mais custar um terço da primeira dobra num telefone.
 *
 * CS-NAV-008 — na entrada por mesa não existe tela intermediária: a barra fica fixa no
 * topo, visível e não bloqueante. O atendente acabou de dizer "escaneia aqui", e uma tela
 * a mais perde gente.
 *
 * Oito opções, sempre (CS-NAV-006). Nome no próprio idioma, não bandeira (P-19).
 *
 * **Por que grade de 4×2 e não uma linha rolável.** Medido: as oito pílulas somam cerca de
 * 590 px, e a tela de referência tem 375 px (CS-DESIGN-001). Na linha rolável as duas
 * últimas — 中文 e 한국어 — ficavam fora da tela, atrás de um esmaecido, e CS-NAV-010 exige
 * que qualquer opção seja alcançável de dedo sem rolar. Era o comprador asiático que P-14b
 * teme quem não encontrava o próprio idioma. Em duas linhas as oito cabem, cada alvo tem
 * 44 px (CS-DESIGN-004) e a barra continua não bloqueando nada.
 */
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IDIOMAS_INTERFACE, NOME_DO_IDIOMA, type IdiomaInterface } from '../lib/idioma.ts'
import { guardarIdioma } from '../lib/sessao.ts'
import { track } from '../lib/track.ts'

export function BarraDeIdioma({ atual }: { atual: IdiomaInterface }) {
  const caminho = usePathname()

  function destino(idioma: string): string {
    const partes = caminho.split('/').filter(Boolean)
    partes[0] = idioma
    return `/${partes.join('/')}/`
  }

  return (
    <nav
      aria-label="Idioma"
      className="sticky top-0 z-20 grid grid-cols-4 gap-1 border-b border-borda/70 bg-papel/90 px-3 py-1.5 backdrop-blur-sm min-[560px]:flex min-[560px]:gap-1.5"
    >
      {IDIOMAS_INTERFACE.map((idioma) => (
        <Link
          key={idioma}
          href={destino(idioma)}
          hrefLang={idioma}
          data-alvo="toque"
          aria-current={idioma === atual ? 'true' : undefined}
          onClick={() => {
            guardarIdioma(idioma)
            track('lang_select', { lang: idioma, modo: 'barra' })
          }}
          className={
            'flex min-h-11 shrink-0 items-center justify-center rounded-pilula px-2 text-center text-[0.75rem] whitespace-nowrap transition-colors ' +
            (idioma === atual
              ? 'bg-oceano font-medium text-white'
              : 'bg-sal text-tinta-suave hover:text-tinta')
          }
        >
          {NOME_DO_IDIOMA[idioma]}
        </Link>
      ))}
    </nav>
  )
}
