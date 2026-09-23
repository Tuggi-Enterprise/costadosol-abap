/**
 * Agenda — os eventos de content/eventos.json que ainda não acabaram no dia do build.
 *
 * Duas telas usam isto: a home mostra só os marcados com `destaque` (escolha do operador,
 * 23/09/2026: "uns 3, 4 na home"), e /[lang]/agenda mostra todos, mês a mês.
 *
 * Ordem por data, não sorteada: CS-OURO-005 sorteia listagem de MUNICÍPIOS, e aqui a lista
 * é de datas. Inauguração e festival usam o mesmo cartão.
 *
 * CS-OURO-006: data que a fonte não fecha vai com o texto da fonte ("Em breve"), e todo
 * evento mostra de onde saiu.
 */
import Link from 'next/link'
import { classesDeAcao } from './acao.ts'
import { LinkDeMunicipio } from './LinkDeMunicipio.tsx'
import { municipios, type Evento } from '../lib/conteudo.ts'
import { texto } from '../lib/idioma.ts'

export type EventoExibido = {
  id: string
  municipio: { slug: string; nome: string }
  inicio: string
  fim: string
  /** Texto da fonte quando a data não é confirmada; senão, `null`. */
  dataTexto: string | null
  nome: string
  resumo: string
  fonteNome: string
  fonteUrl: string
}

/** O recorte que vai à tela: nada de `destaque` nem `tipo` no HTML. */
export function paraExibir(e: Evento, lang: string): EventoExibido {
  return {
    id: e.id,
    municipio: { slug: e.municipio, nome: municipios().find((m) => m.slug === e.municipio)!.nome },
    inicio: e.inicio,
    fim: e.fim,
    dataTexto: e.data_confirmada || !e.data_texto ? null : texto(e.data_texto, lang),
    nome: texto(e.nome, lang),
    resumo: texto(e.resumo, lang),
    fonteNome: e.fonte_nome,
    fonteUrl: e.fonte_url,
  }
}

/** As datas são dia civil, sem hora: formatar em UTC evita o evento mudar de dia no fuso. */
export function formatar(iso: string, lang: string, opcoes: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(lang, { ...opcoes, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
}

function periodo(inicio: string, fim: string, lang: string): string {
  const dia = (iso: string) => formatar(iso, lang, { day: 'numeric' })
  const mes = (iso: string) => formatar(iso, lang, { month: 'short' }).replace('.', '')
  if (inicio === fim) return `${dia(inicio)} ${mes(inicio)}`
  if (inicio.slice(0, 7) === fim.slice(0, 7)) return `${dia(inicio)}–${dia(fim)} ${mes(fim)}`
  return `${dia(inicio)} ${mes(inicio)} – ${dia(fim)} ${mes(fim)}`
}

export function CartaoDeEvento({ evento, lang, rotuloFonte }: { evento: EventoExibido; lang: string; rotuloFonte: string }) {
  return (
    <li
      id={evento.id}
      className="grid scroll-mt-20 grid-cols-[4.5rem_1fr] gap-3 rounded-peca border border-borda/70 bg-papel p-3"
    >
      <p className="self-start rounded-peca bg-sal px-1 py-2 text-center text-[0.8rem] leading-tight font-semibold text-oceano tabular-nums">
        {evento.dataTexto ?? periodo(evento.inicio, evento.fim, lang)}
      </p>
      <div className="min-w-0">
        <h3 className="text-[1rem] leading-snug font-semibold">{evento.nome}</h3>
        <p className="mt-0.5 text-[0.8rem]">
          <LinkDeMunicipio
            href={`/${lang}/${evento.municipio.slug}/`}
            municipio={evento.municipio.slug}
            className="font-medium text-lagoa-tinta underline underline-offset-2"
          >
            {evento.municipio.nome}
          </LinkDeMunicipio>
        </p>
        <p className="mt-1 text-[0.9rem] leading-snug">{evento.resumo}</p>
        <p className="mt-1 truncate text-[0.7rem] text-tinta-suave">
          {rotuloFonte}:{' '}
          {evento.fonteUrl ? (
            <a href={evento.fonteUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {evento.fonteNome}
            </a>
          ) : (
            evento.fonteNome
          )}
        </p>
      </div>
    </li>
  )
}

/** O bloco da home: os destaques e o caminho para a agenda inteira. */
export function Agenda({
  itens,
  lang,
  titulo,
  chamada,
  rotuloFonte,
  rotuloCompleta,
}: {
  itens: EventoExibido[]
  lang: string
  titulo: string
  chamada: string
  rotuloFonte: string
  rotuloCompleta: string
}) {
  if (itens.length === 0) return null

  return (
    <section className="px-4 pt-9">
      <h2 className="text-secao font-semibold">{titulo}</h2>
      <p className="mt-1 mb-4 text-[0.8rem] text-tinta-suave">{chamada}</p>
      <ol className="grid gap-3 md:grid-cols-2">
        {itens.map((evento) => (
          <CartaoDeEvento key={evento.id} evento={evento} lang={lang} rotuloFonte={rotuloFonte} />
        ))}
      </ol>
      <Link href={`/${lang}/agenda/`} className={`${classesDeAcao('secundaria')} mt-4`}>
        {rotuloCompleta} →
      </Link>
    </section>
  )
}
