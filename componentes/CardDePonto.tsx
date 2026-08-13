'use client'

/**
 * CS-MUN-002 — os quatro pontos ficam abertos na própria página do município. Três níveis
 * de navegação são demais para quem tem 60 segundos no balcão.
 *
 * Ordem dos elementos, na ordem do briefing: FOTO, nome, chamada, ► ouvir, "ler mais".
 * A foto vem primeiro porque é a isca; com o texto antes, o olho lia dois parágrafos para
 * só então descobrir o que estava vendo. O texto completo começa fechado porque em nenhuma
 * tela ele pode ocupar mais espaço que o play (CS-DESIGN-002).
 */
import { useState } from 'react'
import Link from 'next/link'
import { Foto } from './Foto.tsx'
import { Audio } from './Audio.tsx'
import { servir, texto } from '../lib/idioma.ts'
import { track } from '../lib/track.ts'
import type { Ponto } from '../lib/conteudo.ts'

export function CardDePonto({
  ponto,
  lang,
  numero,
  rotulos,
}: {
  ponto: Ponto
  lang: string
  numero: number
  rotulos: { ouvir: string; lerMais: string; lerMenos: string }
}) {
  const [aberto, setAberto] = useState(false)
  const faixa = servir(ponto.audio, lang)

  return (
    <article className="px-4 py-7 [&+&]:border-t [&+&]:border-borda/50">
      <Foto
        src={ponto.foto.v}
        alt={texto(ponto.foto.alt, lang)}
        credito={ponto.foto.credito}
        proporcao="h"
        // A ausência de foto é desenhada do mesmo jeito nas quatro telas que a mostram
        // (P-05). Aqui ela sumia e nas listas virava bloco: na mesma sessão, a mesma falta
        // aparecia de duas formas, e a segunda parecia defeito da primeira.
        pendente_em="proporcao"
        sizes="(min-width: 46rem) 44rem, 100vw"
      />

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-sm tabular-nums text-lagoa">{String(numero).padStart(2, '0')}</span>
        {/* O nome leva à página do ponto, que é o endereço que se compartilha. O texto
            continua abrindo aqui mesmo (CS-MUN-002): quem tem 60 segundos no balcão não
            deve precisar de outra página para ler. */}
        <h3 className="text-secao font-semibold">
          <Link href={`/${lang}/${ponto.municipio}/${ponto.id}/`} className="underline-offset-4 hover:underline">
            {texto(ponto.nome, lang)}
          </Link>
        </h3>
      </div>

      <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-snug text-tinta-suave">
        {texto(ponto.teaser, lang)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Audio
          url={faixa.valor.url}
          duracao={faixa.valor.dur}
          rotulo={rotulos.ouvir}
          poiId={ponto.id}
          municipio={ponto.municipio}
          origem="cidade"
        />
        <button
          type="button"
          onClick={() => {
            const proximo = !aberto
            setAberto(proximo)
            if (proximo) track('poi_open', { poi_id: ponto.id, municipio: ponto.municipio })
          }}
          aria-expanded={aberto}
          className="text-sm text-tinta-suave underline underline-offset-4"
        >
          {aberto ? rotulos.lerMenos : rotulos.lerMais}
        </button>
      </div>

      {aberto && (
        // O `lang` declara o idioma REALMENTE servido, não o escolhido (CS-CONT-008):
        // leitor de tela pronuncia errado se mentirmos.
        <p
          lang={servir(ponto.texto, lang).idiomaServido}
          className="mt-3 max-w-[62ch] text-[0.95rem] leading-relaxed"
        >
          {texto(ponto.texto, lang)}
        </p>
      )}
    </article>
  )
}
