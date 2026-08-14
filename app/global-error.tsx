'use client'

/**
 * A tela de erro de último recurso — a única página do site que o Next escrevia sozinho.
 *
 * **Ela existe porque a régua de acessibilidade a encontrou.** `scripts/a11y-check.ts`
 * varreu as 177 páginas do build e acusou uma sem `lang` no `<html>`: a `_global-error`
 * padrão do framework. Sem `lang`, o leitor de tela lê a página com os fonemas do idioma do
 * sistema, e é a única página do site em que a pessoa já está perdida.
 *
 * `global-error` substitui o layout raiz inteiro quando dispara, então ela precisa desenhar
 * o próprio `<html>` e o próprio `<body>` — daí a duplicação do `lang="pt"` de
 * `app/layout.tsx`, que não é escolha e sim exigência do framework.
 *
 * **Por que `pt` e não o idioma da pessoa:** quando isto renderiza, o erro pode ter vindo de
 * antes de o idioma ser resolvido, e `<DeclararIdioma>` não rodou. Declarar o idioma errado
 * é pior que declarar o de origem (CS-CONT-008 vale aqui também).
 *
 * O texto não explica o que quebrou. CS-OURO-001: a mecânica não vai à tela, e "erro 500 no
 * componente de áudio" não ajuda ninguém em pé num corredor de feira.
 */
import { classesDeAcao } from '../componentes/acao.ts'
import './tema.css'

export default function ErroGlobal({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt">
      <body>
        <main className="grid min-h-dvh place-items-center px-6 text-center">
          <div>
            <h1 className="text-secao font-semibold">Esta página não carregou.</h1>
            <p className="mt-2 text-tinta-suave">Tente de novo, ou volte ao início.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className={classesDeAcao('primaria')}>
                Tentar de novo
              </button>
              <a href="/" className={classesDeAcao('secundaria')}>
                Início
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
