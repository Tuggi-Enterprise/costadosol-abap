'use client'

/**
 * CS-DESIGN-006 — os controles de leitura, no rodapé, ao lado da escolha de idioma.
 *
 * **Por que no rodapé e não na primeira dobra.** CS-HOME-001 manda o play ser o maior
 * elemento da dobra e proíbe barra escondendo conteúdo ali; uma faixa de acessibilidade no
 * topo empurraria o produto para baixo em todas as telas para servir a poucas. O rodapé já
 * é onde mora a escolha de idioma pela mesma razão, e quem procura ajuste de leitura procura
 * onde ficam os ajustes.
 *
 * **Por que dois grupos de botões e não um menu.** Menu esconde estado: a pessoa não vê em
 * que tamanho está sem abrir. Aqui os três tamanhos aparecem juntos, com `aria-pressed`
 * dizendo qual está valendo, e o toque tem efeito imediato — sem confirmar, sem recarregar.
 *
 * **O texto dos botões cresce junto com o site**, porque é `rem` como o resto. É o único
 * lugar onde isso é a demonstração e não o efeito colateral: ao tocar em "A+", a própria
 * palavra "A+" aumenta, e a pessoa vê que funcionou sem precisar rolar até o conteúdo.
 */
import { useEffect, useState } from 'react'
import { classesDeAcao } from './acao.ts'
import {
  MOVIMENTOS,
  TAMANHOS,
  gravar,
  ler,
  type Movimento,
  type Preferencias,
  type Tamanho,
} from '../lib/preferencias.ts'

/** O rótulo de cada tamanho é o próprio tamanho. Não precisa de tradução, e não tem. */
const MARCA_DO_TAMANHO: Record<Tamanho, string> = { padrao: 'A', grande: 'A+', maior: 'A++' }

export type RotulosDePreferencia = {
  tamanhoDoTexto: string
  movimento: string
  movimentoPorNivel: Record<Movimento, string>
}

export function PreferenciasDeLeitura({ rotulos }: { rotulos: RotulosDePreferencia }) {
  // Começa no padrão e corrige depois de montar: o servidor não tem sessionStorage, e
  // renderizar aqui o que o cliente vai ler produziria um estado que o React desfaz na
  // hidratação. O atributo em `<html>` já veio certo do script de arranque no layout, então
  // a tela não pisca — o que se acerta aqui é só qual botão aparece marcado.
  const [preferencias, setPreferencias] = useState<Preferencias>({ texto: 'padrao', movimento: 'sistema' })

  useEffect(() => {
    setPreferencias(ler())
  }, [])

  function trocar(mudanca: Partial<Preferencias>) {
    const novas = { ...preferencias, ...mudanca }
    setPreferencias(novas)
    gravar(novas)
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-xs text-tinta-suave">{rotulos.tamanhoDoTexto}</legend>
        <div className="flex gap-2">
          {TAMANHOS.map((tamanho) => (
            <button
              key={tamanho}
              type="button"
              aria-pressed={preferencias.texto === tamanho}
              onClick={() => trocar({ texto: tamanho })}
              className={classesDeAcao(preferencias.texto === tamanho ? 'secundaria' : 'terciaria')}
            >
              {MARCA_DO_TAMANHO[tamanho]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-xs text-tinta-suave">{rotulos.movimento}</legend>
        <div className="flex gap-2">
          {MOVIMENTOS.map((movimento) => (
            <button
              key={movimento}
              type="button"
              aria-pressed={preferencias.movimento === movimento}
              onClick={() => trocar({ movimento })}
              className={classesDeAcao(preferencias.movimento === movimento ? 'secundaria' : 'terciaria')}
            >
              {rotulos.movimentoPorNivel[movimento]}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
