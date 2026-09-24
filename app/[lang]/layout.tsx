import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { DeclararIdioma } from '../../componentes/DeclararIdioma.tsx'
import { Marca } from '../../componentes/Marca.tsx'
import { PreferenciasDeLeitura } from '../../componentes/PreferenciasDeLeitura.tsx'
import { SeletorDeIdioma } from '../../componentes/SeletorDeIdioma.tsx'
import { Navegacao } from '../../componentes/Navegacao.tsx'
import { IDIOMAS_INTERFACE, ehIdiomaDeInterface } from '../../lib/idioma.ts'
import { rotulos } from '../../lib/interface.ts'

export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export default async function LayoutDeIdioma({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!ehIdiomaDeInterface(lang)) notFound()

  return (
    <>
      {/* A ordem sorteada só existe com script (CS-SORT-002 lê a semente do
          sessionStorage). O que fica invisível esperando o sorteio precisa reaparecer
          quando o sorteio nunca vai acontecer. */}
      <noscript>
        <style>{`[data-sorteio='pendente']{opacity:1}`}</style>
      </noscript>
      <DeclararIdioma idioma={lang} />
      <Navegacao lang={lang} />
      {/* O espaço no pé é a altura da barra de navegação: sem ele, o último bloco de toda
          página fica atrás dela e ninguém alcança o link final. */}
      <div className="pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      {/* CS-OURO-002 fala da assinatura da Tuggi, e ela continua aparecendo aqui, nesta
          forma, e em nenhum outro lugar. O logotipo acima dela é do cliente, não nosso, e
          fecha a página com quem assina o conteúdo (a outra aparição dele é a tela de
          entrada). A escolha de idioma passou a morar aqui: ver componentes/SeletorDeIdioma
          para o que isso contraria em CS-NAV-008 e CS-NAV-010. */}
      <footer className="border-t border-borda px-4 py-6 pb-[calc(1.5rem+56px+env(safe-area-inset-bottom))] text-xs text-tinta-suave md:pb-6">
        <SeletorDeIdioma atual={lang} />
        {/* CS-DESIGN-006: ao lado do idioma, pela mesma razão que levou o idioma para cá —
            é ajuste, e ajuste mora onde a pessoa procura ajuste, não na primeira dobra. */}
        <PreferenciasDeLeitura
          rotulos={{
            tamanhoDoTexto: rotulos(lang).leituraTamanho,
            movimento: rotulos(lang).leituraMovimento,
            movimentoPorNivel: {
              sistema: rotulos(lang).leituraMovimentoSistema,
              reduzido: rotulos(lang).leituraMovimentoReduzido,
            },
          }}
        />
        <div className="mt-6">
          <Marca />
        </div>
        <p className="mt-4">{rotulos(lang).assinatura}</p>
        <p className="mt-2">{rotulos(lang).avisoDeMedicao}</p>
      </footer>
    </>
  )
}
