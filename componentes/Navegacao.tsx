'use client'

/**
 * Navegação fixa no rodapé, quatro destinos, sempre visível.
 *
 * **Por que não é menu hambúrguer.** CS-HOME-001 já proíbe hambúrguer na primeira dobra, e
 * a razão vale para o site inteiro: quem entra por QR tem cerca de 60 segundos em pé,
 * segurando o telefone com uma mão. Navegação escondida atrás de um ícone é navegação que
 * não existe para essa pessoa — ela não vai procurar. Quatro destinos cabem no rodapé, e o
 * rodapé é a única faixa da tela que o polegar alcança sem trocar a mão de posição.
 *
 * No desktop (≥46rem) ela para de flutuar e vira uma linha logo abaixo da barra de idioma:
 * barra presa ao pé de um monitor é padrão de aplicativo, não de site.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { rotulos } from '../lib/interface.ts'

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {children}
    </svg>
  )
}

export function Navegacao({ lang }: { lang: string }) {
  const caminho = usePathname()
  const r = rotulos(lang)

  const destinos = [
    {
      href: `/${lang}/`,
      titulo: r.navCidades,
      ativo: (c: string) => c === `/${lang}` || c === `/${lang}/`,
      icone: (
        <Icone>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </Icone>
      ),
    },
    {
      href: `/${lang}/rotas/`,
      titulo: r.navRotas,
      ativo: (c: string) => c.startsWith(`/${lang}/rotas`),
      icone: (
        <Icone>
          <path d="M4 18c4 0 3-9 8-9s5 5 8 5" />
          <circle cx="4" cy="18" r="2" />
          <circle cx="20" cy="14" r="2" />
        </Icone>
      ),
    },
    {
      href: `/${lang}/lugares/`,
      titulo: r.navLugares,
      ativo: (c: string) => c.startsWith(`/${lang}/lugares`),
      icone: (
        <Icone>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </Icone>
      ),
    },
    {
      href: `/${lang}/para-quem-vende/`,
      titulo: r.navProfissional,
      ativo: (c: string) => c.startsWith(`/${lang}/para-quem-vende`),
      icone: (
        <Icone>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
        </Icone>
      ),
    },
  ]

  return (
    <nav
      // O landmark inteiro chamava "Cidades", que é o nome de UM dos quatro destinos: em
      // leitor de tela a lista de marcos anunciava dois navs e nenhum dizia o que era.
      aria-label={r.navPrincipal}
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[46rem] border-t border-borda/70 bg-papel/95 backdrop-blur-sm md:static md:border-t-0 md:border-b"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4">
        {destinos.map((destino) => {
          const ativo = destino.ativo(caminho)
          return (
            <li key={destino.href}>
              <Link
                href={destino.href}
                aria-current={ativo ? 'page' : undefined}
                className={
                  'flex min-h-[54px] flex-col items-center justify-center gap-1 py-2 text-[0.68rem] leading-none md:flex-row md:gap-2 md:text-[0.85rem] ' +
                  (ativo ? 'text-oceano' : 'text-tinta-suave')
                }
              >
                {destino.icone}
                <span className={ativo ? 'font-semibold' : ''}>{destino.titulo}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
