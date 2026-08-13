'use client'

/**
 * CS-HOME-006 — nove cards, **um ponto por município, sempre**. Qual dos quatro aparece é
 * sorteado por sessão, com a mesma semente da ordem dos cards (CS-SORT-003).
 *
 * A paridade aqui é a razão de a seção existir: nove cards, um por cidade, nenhuma cidade
 * com dois e nenhuma sem (CS-OURO-004). O critério A-09 confere isso em 20 sessões.
 *
 * **Por que faixa rolável e não grade.** A grade dos nove (CS-HOME-007) vem logo abaixo,
 * também com foto. Duas grades de foto seguidas viram a mesma seção repetida aos olhos de
 * quem rola em pé; a faixa se distingue de relance, e o card seguinte aparecendo pela
 * borda diz que há mais sem precisar de legenda. Não é carrossel: não anda sozinho, não
 * tem seta e não fica na primeira dobra (CS-HOME-001).
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Foto } from './Foto.tsx'
import { embaralhar, semente, sortearIndice } from '../lib/sessao.ts'
import type { Ponto } from '../lib/conteudo.ts'

/**
 * O recorte é montado no servidor e chega pronto: o cliente só sorteia. Mandar os 36
 * pontos inteiros para o navegador custaria banda que CS-PERF-001 conta.
 */
export type LugarDeCidade = {
  slug: string
  nome: string
  opcoes: { id: string; nome: string; foto: Ponto['foto']; alt: string }[]
}

export function LugaresDaHome({ grupos, lang }: { grupos: LugarDeCidade[]; lang: string }) {
  // Antes do sorteio, o primeiro ponto de cada cidade na ordem do arquivo. Depois dele, o
  // sorteado — e a faixa só aparece quando já está sorteada, para ninguém ver a troca.
  const [escolha, setEscolha] = useState(() => grupos.map((g) => ({ grupo: g, indice: 0 })))
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    const s = semente()
    setEscolha(
      embaralhar(grupos, s).map((grupo) => ({
        grupo,
        indice: sortearIndice(s, grupo.slug, grupo.opcoes.length),
      })),
    )
    setPronto(true)
  }, [grupos])

  return (
    <ul
      data-sorteio={pronto ? 'pronto' : 'pendente'}
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
    >
      {escolha.map(({ grupo, indice }) => {
        const ponto = grupo.opcoes[indice] ?? grupo.opcoes[0]
        if (!ponto) return null
        return (
          <li key={grupo.slug} className="w-[62%] shrink-0 snap-start sm:w-[38%]">
            <Link
              href={`/${lang}/${grupo.slug}/${ponto.id}/`}
              data-alvo="toque"
              className="block"
            >
              <Foto
                src={ponto.foto.v}
                alt={ponto.alt}
                credito={ponto.foto.credito}
                proporcao="v"
                credito_em="sobre"
                pendente_em="proporcao"
                sizes="(min-width: 46rem) 17rem, 62vw"
              />
              <p className="mt-2 text-[0.7rem] tracking-wide text-lagoa uppercase">{grupo.nome}</p>
              <h3 className="text-[1rem] leading-tight font-medium">{ponto.nome}</h3>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
