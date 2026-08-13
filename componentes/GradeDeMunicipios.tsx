'use client'

/**
 * A grade da home (CS-HOME-007) e o módulo das outras oito (CS-OITO-001) são a mesma peça
 * com duas origens. Separar em dois componentes seria a mesma decisão — "em que ordem os
 * municípios aparecem" — implementada duas vezes.
 *
 * CS-SORT-001/003: ordem sorteada uma vez por sessão, com a MESMA semente nos dois usos.
 * Foto, nome, e nada mais: sem contador, sem selo, sem destaque (CS-OURO-004). O nome vai
 * SOBRE a foto porque o card inteiro é o alvo de toque, e legenda embaixo dobrava a altura
 * sem dobrar a informação.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Foto } from './Foto.tsx'
import { embaralhar, semente } from '../lib/sessao.ts'
import { marcarOrigemDeAbertura } from '../lib/track.ts'
import { texto } from '../lib/idioma.ts'
import type { Municipio } from '../lib/conteudo.ts'

export function GradeDeMunicipios({
  itens,
  lang,
  origem,
}: {
  itens: Municipio[]
  lang: string
  origem: 'home' | 'outras_oito'
}) {
  // A ordem do servidor é a do arquivo; o sorteio acontece na montagem, quando a semente
  // da sessão existe. sessionStorage não existe no servidor — não há como sortear antes.
  //
  // Por isso a grade nasce invisível e aparece já sorteada (regra em app/tema.css): antes
  // disso o visitante via uma ordem e, com as fotos já na tela, um salto para outra. Sem
  // script, o `<noscript>` do layout de idioma devolve a grade à ordem do arquivo.
  const [ordenados, setOrdenados] = useState(itens)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    setOrdenados(embaralhar(itens, semente()))
    setPronto(true)
  }, [itens])

  return (
    <ul
      data-sorteio={pronto ? 'pronto' : 'pendente'}
      className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3"
    >
      {ordenados.map((m, indice) => (
        <li key={m.slug}>
          <Link
            href={`/${lang}/${m.slug}/`}
            data-alvo="toque"
            // O evento sai na página de destino, não aqui: assim a abertura vinda da mesa
            // — que nunca passa por um clique — também é contada (CS-DADO-002).
            onClick={() => marcarOrigemDeAbertura(m.slug, origem, indice + 1)}
            className="group relative block overflow-hidden rounded-peca"
          >
            <Foto
              src={m.hero.src}
              alt={texto(m.hero.alt, lang)}
              credito={m.hero.credito}
              proporcao="v"
              arredondada={false}
              // No card, o crédito vai para o alto: embaixo ele colidia com o nome da
              // cidade, e os dois ficavam ilegíveis.
              credito_em="sobre"
              pendente_em="proporcao"
            />
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pt-12 pb-2.5"
              style={{
                background:
                  'linear-gradient(to top, var(--color-oceano-fundo) 0%, color-mix(in oklab, var(--color-oceano-fundo) 70%, transparent) 45%, transparent 100%)',
              }}
            >
              <span className="block text-[0.95rem] leading-tight font-semibold text-white">{m.nome}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
