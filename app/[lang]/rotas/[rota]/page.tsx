import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Foto } from '../../../../componentes/Foto.tsx'
import { LinkDeMunicipio } from '../../../../componentes/LinkDeMunicipio.tsx'
import { conteudo, municipios, rotas } from '../../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, texto } from '../../../../lib/idioma.ts'
import { rotulos } from '../../../../lib/interface.ts'

/**
 * Uma rota (CS-ROTA-001).
 *
 * O que **ainda não** está aqui, e é de propósito: o mapa com o traçado (depende de P-11,
 * o basemap que rotula um município que este projeto não tem), o "ouvir a rota" (depende
 * das faixas de áudio, P-06) e o PDF de uma página (P-21 decide se a rota das nove cabe em
 * uma). O que existe hoje — o caminho, as cidades e os lugares em sequência — já é a
 * informação que o comprador leva.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.flatMap((lang) => rotas().map((rota) => ({ lang, rota: rota.id })))
}

export default async function PaginaDaRota({
  params,
}: {
  params: Promise<{ lang: string; rota: string }>
}) {
  const { lang, rota: id } = await params
  const rota = rotas().find((x) => x.id === id)
  if (!rota) notFound()

  const r = rotulos(lang)
  const nomeDoMunicipio = new Map(municipios().map((m) => [m.slug, m.nome]))
  const pontos = rota.pontos
    .map((pontoId) => conteudo().pontos.find((p) => p.id === pontoId))
    .filter((p) => p !== undefined)

  return (
    <main>
      <header className="px-4 pt-7">
        <span className="block h-1 w-16 rounded-pilula" style={{ background: rota.cor }} />
        <h1 className="mt-3 text-titulo font-semibold">{texto(rota.nome, lang)}</h1>
        <p className="mt-2 text-[1.05rem] leading-snug text-tinta-suave">{texto(rota.eixo, lang)}</p>
      </header>

      {/* O caminho como sequência: sem mapa, a ordem das cidades é a única coisa que
          comunica que existe um percurso. Com mapa, ela continua sendo o texto alternativo. */}
      <section className="px-4 pt-6">
        <h2 className="text-[0.7rem] tracking-widest text-tinta-suave uppercase">{r.cidadesDaRota}</h2>
        <ol className="mt-3 grid gap-2">
          {rota.municipios.map((slug, indice) => (
            <li key={slug} className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-medium text-white"
                style={{ background: rota.cor }}
              >
                {indice + 1}
              </span>
              <LinkDeMunicipio
                href={`/${lang}/${slug}/`}
                municipio={slug}
                className="flex items-center text-[1.05rem] underline underline-offset-4"
              >
                {nomeDoMunicipio.get(slug)}
              </LinkDeMunicipio>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 py-8">
        <h2 className="text-[0.7rem] tracking-widest text-tinta-suave uppercase">{r.pontosDaRota}</h2>
        <ul className="mt-3 grid gap-4">
          {pontos.map((ponto) => (
            <li key={ponto.id} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
              <Foto
                src={ponto.foto.v}
                alt={texto(ponto.foto.alt, lang)}
                credito={ponto.foto.credito}
                proporcao="v"
                credito_em="fora"
                pendente_em="proporcao"
                sizes="5.5rem"
              />
              <div>
                <p className="text-[0.7rem] tracking-wide text-lagoa uppercase">
                  {nomeDoMunicipio.get(ponto.municipio)}
                </p>
                <h3 className="text-[1rem] leading-tight font-medium">
                  <Link
                    href={`/${lang}/${ponto.municipio}/${ponto.id}/`}
                    className="underline-offset-4 hover:underline"
                  >
                    {texto(ponto.nome, lang)}
                  </Link>
                </h3>
                <p className="mt-1 text-[0.85rem] leading-snug text-tinta-suave">
                  {texto(ponto.teaser, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
