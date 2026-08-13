'use client'

/**
 * CS-MUN-002 fecha a página do município em "compartilhar", e CS-EVT-003 tem
 * `share_click` na taxonomia — nenhum dos dois existia. Num estande, compartilhar é o
 * único jeito de o conteúdo sair do pavilhão: quem está com o telefone na mão manda a
 * cidade para quem decide a compra.
 *
 * Dois caminhos, porque `navigator.share` não existe em todo navegador de mesa e exige
 * contexto seguro. Onde existe, é a folha nativa; onde não, copia o endereço e diz que
 * copiou — sem a confirmação, o toque não parece ter feito nada.
 */
import { useState } from 'react'
import { track, type Props } from '../lib/track.ts'

export function Compartilhar({
  titulo,
  rotulo,
  rotuloCopiado,
  municipio,
  poiId,
}: {
  titulo: string
  rotulo: string
  rotuloCopiado: string
  municipio?: string
  poiId?: string
}) {
  const [copiado, setCopiado] = useState(false)

  async function aoCompartilhar() {
    const url = window.location.href
    // CS-EVT-003: `share_click` leva `municipio` OU `poi_id`, conforme o que se compartilha.
    const alvo: Props = poiId ? { poi_id: poiId } : municipio ? { municipio } : {}

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: titulo, url })
        track('share_click', { tipo: 'nativo', ...alvo })
      } catch {
        /* cancelar a folha nativa não é um compartilhamento, e não vira evento */
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2500)
      track('share_click', { tipo: 'copia', ...alvo })
    } catch {
      /* sem permissão de área de transferência não há o que fazer sem mentir na tela */
    }
  }

  return (
    <button
      type="button"
      onClick={aoCompartilhar}
      className="inline-flex items-center gap-2 rounded-pilula border border-borda px-5 py-3 text-sm text-tinta-suave"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M12 16V4" />
        <path d="M8 8l4-4 4 4" />
        <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
      </svg>
      {copiado ? rotuloCopiado : rotulo}
    </button>
  )
}
