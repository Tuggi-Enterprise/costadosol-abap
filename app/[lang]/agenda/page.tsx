import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CartaoDeEvento, formatar, paraExibir, type EventoExibido } from '../../../componentes/Agenda.tsx'
import { Calendario } from '../../../componentes/Calendario.tsx'
import { eventosFuturos } from '../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, ehIdiomaDeInterface } from '../../../lib/idioma.ts'
import { rotulos } from '../../../lib/interface.ts'

/**
 * Calendário de eventos — a agenda inteira, mês a mês, pedida pelo operador em 23/09/2026.
 * A home mostra só os destaques e aponta para cá.
 *
 * Evento sem data confirmada abre a página, sob "Em breve": não tem mês onde morar.
 * Evento que atravessa meses aparece no mês em que começa.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const r = rotulos(lang)
  return { title: `${r.agendaTitulo}, Conderlagos`, description: r.agendaPaginaChamada }
}

export default async function PaginaDaAgenda({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!ehIdiomaDeInterface(lang)) notFound()
  const r = rotulos(lang)

  const eventos = eventosFuturos()
  const emBreve = eventos.filter((e) => !e.data_confirmada).map((e) => paraExibir(e, lang))
  const porMes = new Map<string, EventoExibido[]>()
  for (const e of eventos.filter((x) => x.data_confirmada)) {
    const mes = e.inicio.slice(0, 7)
    porMes.set(mes, [...(porMes.get(mes) ?? []), paraExibir(e, lang)])
  }

  return (
    <main className="px-4">
      <header className="pt-7 pb-2">
        <h1 className="text-secao font-semibold">{r.agendaTitulo}</h1>
        <p className="mt-1 text-[0.9rem] text-tinta-suave">{r.agendaPaginaChamada}</p>
      </header>

      {emBreve.length > 0 && (
        <section className="py-5">
          <h2 className="mb-3 text-[1.1rem] font-semibold">{r.emBreve}</h2>
          <ol className="grid gap-3 md:grid-cols-2">
            {emBreve.map((evento) => (
              <CartaoDeEvento key={evento.id} evento={evento} lang={lang} rotuloFonte={r.fonte} />
            ))}
          </ol>
        </section>
      )}

      {[...porMes.entries()].map(([mes, doMes]) => (
        <section key={mes} className="border-t border-borda/50 py-5">
          <h2 className="mb-3 text-[1.1rem] font-semibold first-letter:uppercase">
            {formatar(`${mes}-01`, lang, { month: 'long', year: 'numeric' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-[16rem_1fr] md:items-start">
            <Calendario mes={mes} eventos={doMes} lang={lang} />
            <ol className="grid gap-3">
              {doMes.map((evento) => (
                <CartaoDeEvento key={evento.id} evento={evento} lang={lang} rotuloFonte={r.fonte} />
              ))}
            </ol>
          </div>
        </section>
      ))}
    </main>
  )
}
