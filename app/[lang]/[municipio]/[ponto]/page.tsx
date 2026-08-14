import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Audio } from '../../../../componentes/Audio.tsx'
import { Compartilhar } from '../../../../componentes/Compartilhar.tsx'
import { Foto, FOTO_PENDENTE } from '../../../../componentes/Foto.tsx'
import { Hero } from '../../../../componentes/Hero.tsx'
import { RegistrarAberturaDePonto } from '../../../../componentes/RegistrarAbertura.tsx'
import { conteudo, municipios, pontosDo } from '../../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, ehIdiomaDeInterface, servir, texto } from '../../../../lib/idioma.ts'
import { rotulos } from '../../../../lib/interface.ts'

/**
 * A página do ponto — o endereço que se compartilha (§5.3 do 00-regras-de-negocio).
 *
 * Ela não substitui o card aberto na página do município: CS-MUN-002 mantém os quatro
 * pontos ali mesmo, porque três níveis são demais para quem tem 60 segundos no balcão.
 * O que só existe aqui é o link direto — sem ele, um ponto não tem endereço próprio, não
 * tem cartão de compartilhamento com a própria foto e `share_click` nunca sai.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.flatMap((lang) =>
    conteudo().pontos.map((p) => ({ lang, municipio: p.municipio, ponto: p.id })),
  )
}

function achar(slug: string, id: string) {
  const m = municipios().find((x) => x.slug === slug)
  const ponto = conteudo().pontos.find((p) => p.id === id && p.municipio === slug)
  return m && ponto ? { m, ponto } : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; municipio: string; ponto: string }>
}): Promise<Metadata> {
  const { lang, municipio: slug, ponto: id } = await params
  const achado = achar(slug, id)
  if (!achado) return {}
  const { m, ponto } = achado

  const nome = servir(ponto.nome, lang)
  const teaser = servir(ponto.teaser, lang)
  // `h` é o recorte 16:9 que existe para isto (CS-CONT-002).
  const temFoto = ponto.foto.h !== FOTO_PENDENTE

  return {
    title: `${nome.valor}, ${m.nome}`,
    description: teaser.valor,
    openGraph: {
      title: `${nome.valor}, ${m.nome}`,
      description: teaser.valor,
      locale: teaser.idiomaServido,
      ...(temFoto ? { images: [{ url: `${ponto.foto.h}-800.webp` }] } : {}),
    },
  }
}

export default async function PaginaDoPonto({
  params,
}: {
  params: Promise<{ lang: string; municipio: string; ponto: string }>
}) {
  const { lang, municipio: slug, ponto: id } = await params
  if (!ehIdiomaDeInterface(lang)) notFound()

  const achado = achar(slug, id)
  if (!achado) notFound()
  const { m, ponto } = achado

  const r = rotulos(lang)
  const faixa = servir(ponto.audio, lang)
  const nome = texto(ponto.nome, lang)
  const vizinhos = pontosDo(slug).filter((p) => p.id !== ponto.id)

  return (
    <main>
      <RegistrarAberturaDePonto poiId={ponto.id} municipio={slug} />

      <Hero
        src={ponto.foto.h}
        alt={texto(ponto.foto.alt, lang)}
        credito={ponto.foto.credito}
        titulo={nome}
        linha={texto(ponto.teaser, lang)}
        idiomaDaLinha={servir(ponto.teaser, lang).idiomaServido}
      >
        {/* CS-DESIGN-002: o play é o maior elemento, também aqui. */}
        <Audio
          url={faixa.valor.url}
          duracao={faixa.valor.dur}
          rotulo={r.ouvir}
          poiId={ponto.id}
          municipio={slug}
          origem="ponto"
          largo
        />
      </Hero>

      <div className="px-4 pt-4">
        <Link
          href={`/${lang}/${slug}/`}
          data-alvo="toque"
          className="inline-flex items-center text-[0.8rem] tracking-wide text-lagoa-tinta uppercase"
        >
          ← {m.nome}
        </Link>
      </div>

      <p
        // CS-CONT-008: o idioma declarado é o servido, não o escolhido.
        lang={servir(ponto.texto, lang).idiomaServido}
        className="max-w-[62ch] px-4 pt-4 text-[1rem] leading-relaxed"
      >
        {texto(ponto.texto, lang)}
      </p>

      <div className="px-4 py-7">
        <Compartilhar
          titulo={`${nome}, ${m.nome}`}
          rotulo={r.compartilhar}
          rotuloCopiado={r.linkCopiado}
          poiId={ponto.id}
        />
      </div>

      <section className="border-t border-borda/60 px-4 py-7">
        <h2 className="text-[0.7rem] tracking-widest text-tinta-suave uppercase">
          {r.maisEm} {m.nome}
        </h2>
        <ul className="mt-3 grid gap-4">
          {vizinhos.map((vizinho) => (
            <li key={vizinho.id} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
              <Foto
                src={vizinho.foto.v}
                alt={texto(vizinho.foto.alt, lang)}
                credito={vizinho.foto.credito}
                proporcao="v"
                credito_em="fora"
                pendente_em="proporcao"
                sizes="5.5rem"
              />
              <div>
                <h3 className="text-[1rem] leading-tight font-medium">
                  <Link href={`/${lang}/${slug}/${vizinho.id}/`} className="underline-offset-4 hover:underline">
                    {texto(vizinho.nome, lang)}
                  </Link>
                </h3>
                <p className="mt-1 text-[0.85rem] leading-snug text-tinta-suave">
                  {texto(vizinho.teaser, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
