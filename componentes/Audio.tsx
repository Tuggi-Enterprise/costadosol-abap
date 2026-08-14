'use client'

/**
 * CS-DESIGN-002 — áudio é o produto. O botão de play é o maior elemento da peça, e na
 * página do município ocupa a largura inteira (CS-HOME-001 pede ≥30% da tela).
 * CS-PERF-004 — `preload="none"`, um áudio por vez no documento inteiro.
 *
 * O controle de "um por vez" é global de propósito: dois áudios tocando juntos é o defeito
 * mais provável numa página com cinco botões de play.
 *
 * **Três estados, não dois.** Com `preload="none"` e rede de pavilhão, entre o toque e o
 * som existem segundos em que o botão antigo não dizia nada — e quem não recebe resposta
 * toca de novo, o que pausava. Agora o botão mostra que está buscando, e a barra de
 * progresso mostra que está andando. Progresso não é explicação de mecânica: é o estado
 * do que a pessoa mandou acontecer, e CS-OURO-001 não o alcança.
 *
 * Enquanto as faixas não existem (P-06 destrava a produção), o arquivo responde 404 e o
 * botão se apaga em vez de fingir que tocou.
 */
import { useEffect, useRef, useState } from 'react'
import { track } from '../lib/track.ts'
import { classesDeAcao } from './acao.ts'

let tocandoAgora: HTMLAudioElement | null = null

const relogio = (segundos: number) =>
  `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, '0')}`

export function Audio({
  url,
  duracao,
  rotulo,
  poiId,
  municipio,
  origem,
  largo = false,
}: {
  url: string
  duracao: number
  rotulo: string
  poiId: string
  municipio: string
  origem: 'home' | 'cidade' | 'ponto' | 'rota'
  largo?: boolean
}) {
  const referencia = useRef<HTMLAudioElement | null>(null)
  const [tocando, setTocando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [decorrido, setDecorrido] = useState(0)
  const [indisponivel, setIndisponivel] = useState(false)
  const marcados = useRef(new Set<number>())

  useEffect(() => {
    const audio = referencia.current
    return () => {
      if (audio && tocandoAgora === audio) tocandoAgora = null
    }
  }, [])

  function aoTocar() {
    const audio = referencia.current
    if (!audio) return

    if (tocando || carregando) {
      audio.pause()
      setTocando(false)
      setCarregando(false)
      return
    }
    if (tocandoAgora && tocandoAgora !== audio) tocandoAgora.pause()
    tocandoAgora = audio

    // O clique É o gesto que o Safari iOS exige (CS-ROTA-003).
    setCarregando(true)
    void audio.play().catch(() => {
      setCarregando(false)
      setTocando(false)
      setIndisponivel(true)
    })
    track('audio_play', { poi_id: poiId, municipio, origem })
  }

  function aoProgredir() {
    const audio = referencia.current
    if (!audio) return
    setDecorrido(audio.currentTime)
    if (!audio.duration) return
    const pct = Math.floor((audio.currentTime / audio.duration) * 100)
    for (const marca of [25, 50, 75, 100]) {
      if (pct >= marca && !marcados.current.has(marca)) {
        marcados.current.add(marca)
        track('audio_progress', { poi_id: poiId, pct: marca })
      }
    }
  }

  // A duração real só existe depois de o arquivo carregar; até lá vale a do conteúdo, que
  // é o que o catálogo promete. Sem uma das duas a barra dividiria por zero.
  const total = referencia.current?.duration || duracao || 0
  const andado = total > 0 ? Math.min(100, (decorrido / total) * 100) : 0

  return (
    <div className={largo ? 'w-full' : 'inline-block'}>
      <button
        type="button"
        onClick={aoTocar}
        disabled={indisponivel}
        aria-pressed={tocando}
        aria-busy={carregando}
        // CS-DESIGN-005: primária, sempre — é o play, e ele é o produto (CS-DESIGN-002).
        // `relative overflow-hidden` é desta peça, não do nível: existe para a barra de
        // progresso lá embaixo caber dentro do botão.
        className={`relative overflow-hidden ${classesDeAcao('primaria', largo ? 'cheia' : 'natural', { desabilitada: indisponivel })}`}
      >
        <span
          aria-hidden
          className={
            'grid shrink-0 place-items-center rounded-full bg-white/15 ' +
            (largo ? 'h-8 w-8 text-sm' : 'h-6 w-6 text-[0.6rem]')
          }
        >
          {carregando ? '···' : tocando ? '❙❙' : '▶'}
        </span>
        {/* Sem legenda de estado: CS-OURO-001 proíbe explicar mecânica na tela. O botão
            apagado já diz o que precisa dizer. */}
        <span>{rotulo}</span>
        {!indisponivel && (
          <span className="text-sm opacity-70 tabular-nums">
            {tocando || decorrido > 0 ? relogio(Math.max(0, total - decorrido)) : relogio(total)}
          </span>
        )}
        {/* A barra vive dentro do botão: fora dele, ela seria mais um elemento competindo
            com o play numa tela que CS-DESIGN-002 quer com o play no topo da hierarquia. */}
        {andado > 0 && !indisponivel && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20"
          >
            <span className="block h-full bg-lagoa" style={{ width: `${andado}%` }} />
          </span>
        )}
      </button>
      <audio
        ref={referencia}
        src={url}
        preload="none"
        onPlaying={() => {
          setCarregando(false)
          setTocando(true)
        }}
        onWaiting={() => setCarregando(true)}
        onTimeUpdate={aoProgredir}
        onEnded={() => {
          setTocando(false)
          setCarregando(false)
          setDecorrido(0)
        }}
        onPause={() => {
          setTocando(false)
          setCarregando(false)
        }}
        onError={() => {
          setCarregando(false)
          setIndisponivel(true)
        }}
      />
    </div>
  )
}
