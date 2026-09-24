import type { ReactNode } from 'react'
import { metadataDoSite } from '../lib/site.ts'
import { GA_ARRANQUE, GA_ID } from '../lib/ga.ts'
import { Rastreamento } from '../componentes/Rastreamento.tsx'
import './tema.css'

// A descrição contava municípios ("os nove municípios do Conderlagos") — a expressão que
// a apuração de 12/08/2026 mostrou ser falsa (P-29), e que ia no preview de todo link
// compartilhado. O que se publica ali está em lib/site.ts, onde o teste alcança.
export const metadata = metadataDoSite

/**
 * CS-DESIGN-006 — o arranque das preferências de leitura, antes da primeira pintura.
 *
 * Precisa ser script embutido e síncrono: se o tamanho do texto fosse aplicado só depois da
 * hidratação, quem escolheu "A++" veria a página inteira montar pequena e dar um salto. Um
 * salto de layout é pior para quem precisa de texto grande do que para qualquer outra pessoa.
 *
 * Cabe na CSP porque `script-src` já traz `'unsafe-inline'` (ver next.config.ts) — nenhuma
 * permissão nova, nenhum arquivo a mais na rede. A chave e os valores são os de
 * `lib/preferencias.ts`; é a única duplicação do projeto que não dá para eliminar, porque
 * este trecho roda antes de qualquer módulo carregar, e por isso ela está escrita aqui em
 * cima e coberta por teste.
 */
const ARRANQUE_DE_PREFERENCIAS = `try{var p=JSON.parse(sessionStorage.getItem('prefs_leitura')||'null')||{};var e=document.documentElement;e.dataset.texto=['padrao','grande','maior'].indexOf(p.texto)>-1?p.texto:'padrao';e.dataset.movimento=p.movimento==='reduzido'?'reduzido':'sistema'}catch(_){}`

export default function RaizLayout({ children }: { children: ReactNode }) {
  // O `lang` real de cada pagina e declarado por `<DeclararIdioma>` no layout de idioma:
  // aqui ainda nao se sabe qual e, e mentir quebra leitor de tela (CS-CONT-008).
  return (
    <html lang="pt" data-texto="padrao" data-movimento="sistema">
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARRANQUE_DE_PREFERENCIAS }} />
        {/* GA só no build de produção: `next dev` não suja o relatório da feira. */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: GA_ARRANQUE }} />
          </>
        )}
      </head>
      <body>
        {children}
        <Rastreamento />
      </body>
    </html>
  )
}
