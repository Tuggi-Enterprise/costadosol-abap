'use client'

/**
 * A escolha de idioma, no rodapé — decisão do operador em 13/08/2026, que revoga a barra
 * fixa de oito pílulas no topo.
 *
 * O que muda em relação à barra: no topo, as oito opções custavam a primeira faixa de toda
 * página para uma decisão que a entrada já resolve sozinha (CS-NAV-007 — o idioma vem de
 * `navigator.language`). Quem chega no idioma certo — a maioria — pagava a barra em cada
 * rolagem e nunca a usava; quem chega no errado percebe na primeira linha de texto e vai
 * procurar. No rodapé, o custo fica com quem tem o problema.
 *
 * **O que isto contraria, e é preciso estar escrito.** CS-NAV-008 pede a barra fixa no
 * topo e CS-NAV-010 pede qualquer opção alcançável de dedo sem rolar; um `select` no pé da
 * página exige rolar até lá. CS-NAV-006 (as oito, sempre) continua valendo — elas estão
 * todas aqui, e nenhuma ficou atrás de um esmaecido como ficava na linha rolável.
 *
 * Nome no próprio idioma, não bandeira (P-19), e cada `<option>` declara o seu `lang`: sem
 * isso o leitor de tela lê "中文" e "한국어" com a voz da página, que é o defeito que a
 * barra antiga tinha.
 *
 * **Navega ao escolher, sem botão de confirmar.** É um toque em vez de dois, e o preço é
 * conhecido: no teclado, a seta num `select` fechado dispara `change` a cada opção e leva
 * a pessoa para o idioma errado antes de ela chegar no seu (WCAG 3.2.2). Aqui isso é
 * recuperável — as oito páginas são a mesma página, e o seletor está no mesmo lugar na de
 * destino, já com o valor novo.
 */
import { useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { IDIOMAS_INTERFACE, NOME_DO_IDIOMA, type IdiomaInterface } from '../lib/idioma.ts'
import { rotulos } from '../lib/interface.ts'
import { guardarIdioma } from '../lib/sessao.ts'
import { track } from '../lib/track.ts'

export function SeletorDeIdioma({ atual }: { atual: IdiomaInterface }) {
  const caminho = usePathname()
  const router = useRouter()
  const id = useId()
  const r = rotulos(atual)

  function destino(idioma: string): string {
    const partes = caminho.split('/').filter(Boolean)
    partes[0] = idioma
    return `/${partes.join('/')}/`
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <label htmlFor={id} className="text-xs text-tinta-suave">
        {r.idioma}
      </label>
      <select
        id={id}
        value={atual}
        onChange={(evento) => {
          const idioma = evento.target.value
          guardarIdioma(idioma)
          track('lang_select', { lang: idioma, modo: 'rodape' })
          router.push(destino(idioma))
        }}
        // A altura de 44 px vem de app/tema.css, que passou a cobrir `select`: repetir o
        // número aqui seria a mesma régua de CS-DESIGN-004 escrita em dois lugares.
        className="rounded-pilula border border-borda bg-papel px-3 text-sm text-tinta"
      >
        {IDIOMAS_INTERFACE.map((idioma) => (
          <option key={idioma} value={idioma} lang={idioma}>
            {NOME_DO_IDIOMA[idioma]}
          </option>
        ))}
      </select>

      {/*
        Sem script o `select` não leva a lugar nenhum, e as oito pílulas de antes levavam:
        eram links. Aqui os links continuam existindo no HTML, escondidos de quem tem
        script — e é também o que preserva o `hreflang` de cada idioma para o indexador,
        que a barra publicava e um `<option>` não publica.
      */}
      <noscript>
        <ul className="flex flex-wrap gap-2">
          {IDIOMAS_INTERFACE.map((idioma) => (
            <li key={idioma}>
              <Link
                href={destino(idioma)}
                hrefLang={idioma}
                lang={idioma}
                data-alvo="toque"
                aria-current={idioma === atual ? 'page' : undefined}
                className="flex items-center rounded-pilula bg-sal px-3 text-[0.75rem] text-tinta-suave"
              >
                {NOME_DO_IDIOMA[idioma]}
              </Link>
            </li>
          ))}
        </ul>
      </noscript>
    </div>
  )
}
