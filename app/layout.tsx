import type { ReactNode } from 'react'
import { metadataDoSite } from '../lib/site.ts'
import './tema.css'

// A descrição contava municípios ("os nove municípios do Conderlagos") — a expressão que
// a apuração de 12/08/2026 mostrou ser falsa (P-29), e que ia no preview de todo link
// compartilhado. O que se publica ali está em lib/site.ts, onde o teste alcança.
export const metadata = metadataDoSite

export default function RaizLayout({ children }: { children: ReactNode }) {
  // O `lang` real de cada pagina e declarado por `<DeclararIdioma>` no layout de idioma:
  // aqui ainda nao se sabe qual e, e mentir quebra leitor de tela (CS-CONT-008).
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
