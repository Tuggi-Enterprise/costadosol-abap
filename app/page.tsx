'use client'

/**
 * Entrada pela home: o idioma é RESOLVIDO, não perguntado.
 *
 * Decisão do operador em 13/08/2026, que revoga a tela cheia de oito opções do §7.1 do
 * briefing (CS-NAV-007). O motivo é o mesmo que já valia para a entrada por mesa
 * (CS-NAV-008): o aparelho já diz o idioma em `navigator.language`, e uma tela a mais
 * entre o QR e o conteúdo perde gente em pé, num corredor de feira.
 *
 * O que se perde: a tela onde as oito opções apareciam juntas. O argumento de alcance
 * internacional (CS-NAV-006) não depende dela — a barra fixa do topo mostra as oito em
 * toda página, e o dado de idioma continua vindo de `locale_navegador` em `session_start`.
 *
 * O que NÃO se emite aqui: `lang_select`. Ninguém selecionou nada. O evento passa a
 * significar apenas troca deliberada de idioma, que é o que ele deveria medir.
 */
import { useEffect } from 'react'
import { Marca } from '../componentes/Marca.tsx'
import { resolverDoNavegador } from '../lib/idioma.ts'
import { absorverParametroDeEntrada, guardarIdioma, idiomaGuardado } from '../lib/sessao.ts'
import { trackSessionStart } from '../lib/track.ts'

export default function Entrada() {
  useEffect(() => {
    absorverParametroDeEntrada()
    trackSessionStart()

    const idioma = idiomaGuardado() ?? resolverDoNavegador(navigator.language)
    guardarIdioma(idioma)
    // `replace`, não `push`: o botão voltar não pode devolver a pessoa para uma tela que
    // só redireciona (mesma razão de CS-NAV-003).
    window.location.replace(`/${idioma}/`)
  }, [])

  // Fundo claro, não o azul de antes: o logotipo tem fundo branco chapado (ver
  // componentes/Marca.tsx), e sobre o azul ele viraria um retângulo branco. O `h1` continua
  // existindo para leitor de tela e para o caso de a imagem não carregar.
  return (
    <main className="grid min-h-dvh place-items-center bg-papel p-6">
      <h1 className="sr-only">Conderlagos</h1>
      <Marca tamanho="entrada" />
    </main>
  )
}
