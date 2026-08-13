import { LinkDeRota } from '../../../componentes/LinkDeRota.tsx'
import { conteudo, municipios, rotas } from '../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, texto } from '../../../lib/idioma.ts'
import { rotulos } from '../../../lib/interface.ts'

/**
 * CS-VENDE-001 — as quatro rotas, os fatos com fonte, e o contato das nove secretarias.
 *
 * CS-OURO-005: a tabela de secretarias é listagem **não clicável de navegação** e vai em
 * ordem alfabética. Aqui ninguém está escolhendo um destino; está procurando um telefone.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export default async function ParaQuemVende({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const r = rotulos(lang)
  const alfabetica = [...municipios()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

  return (
    <main>
      <header className="px-4 pt-7">
        <h1 className="text-secao font-semibold">{r.profissionalTitulo}</h1>
      </header>

      <section className="px-4 pt-6">
        <h2 className="text-[0.7rem] tracking-widest text-tinta-suave uppercase">{r.rotasTitulo}</h2>
        <ul className="mt-3 grid gap-2">
          {rotas().map((rota) => (
            <li key={rota.id}>
              <LinkDeRota
                href={`/${lang}/rotas/${rota.id}/`}
                rotaId={rota.id}
                origem="cards"
                className="flex items-center gap-3 rounded-peca border border-borda/70 px-4 py-3"
              >
                <span aria-hidden className="h-6 w-1 rounded-pilula" style={{ background: rota.cor }} />
                <span>
                  <span className="block font-medium">{texto(rota.nome, lang)}</span>
                  <span className="block text-[0.85rem] text-tinta-suave">{texto(rota.eixo, lang)}</span>
                </span>
              </LinkDeRota>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pt-8">
        <ul className="grid gap-5">
          {conteudo().fatos.map((fato) => (
            <li key={fato.id} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3">
              <p className="font-semibold tabular-nums text-oceano">{fato.numero}</p>
              <div>
                <p className="text-[0.95rem] leading-snug">{texto(fato.texto, lang)}</p>
                <p className="mt-1 text-[0.7rem] tracking-wide text-tinta-suave uppercase">
                  <a
                    href={fato.fonte_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {fato.fonte_nome}
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 py-8">
        <h2 className="text-[0.7rem] tracking-widest text-tinta-suave uppercase">{r.contatos}</h2>
        <ul className="mt-3 divide-y divide-borda/60">
          {alfabetica.map((m) => (
            <li key={m.slug} className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium">{m.nome}</span>
              <a
                href={m.secretaria.url}
                target="_blank"
                rel="noopener noreferrer"
                data-alvo="toque"
                className="flex shrink-0 items-center text-[0.85rem] text-oceano underline underline-offset-4"
              >
                {r.secretaria}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
