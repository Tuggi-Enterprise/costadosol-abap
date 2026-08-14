import Link from 'next/link'
import { Fatos } from '../../componentes/Fatos.tsx'
import { GradeDeMunicipios } from '../../componentes/GradeDeMunicipios.tsx'
import { Hero } from '../../componentes/Hero.tsx'
import { Audio } from '../../componentes/Audio.tsx'
import { LugaresDaHome, type LugarDeCidade } from '../../componentes/LugaresDaHome.tsx'
import { classesDeAcao } from '../../componentes/acao.ts'
import { conteudo, municipios, pontosDo } from '../../lib/conteudo.ts'
import { rotulos } from '../../lib/interface.ts'
import { IDIOMAS_INTERFACE, servir, texto } from '../../lib/idioma.ts'

export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

/**
 * O filme institucional do consórcio, servido do próprio site (ver componentes/VideoDeCapa).
 * O poster é um quadro do próprio vídeo: nada de foto de outro lugar por trás do play.
 */
const VIDEO_DA_CAPA = {
  src: '/video/conderlagos.mp4',
  poster: '/video/conderlagos-poster.webp',
} as const

/** CS-OURO-006 vale para vídeo igual: material do consórcio, cedido pelo consórcio. */
const CREDITO_DA_CAPA = 'Conderlagos'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const r = rotulos(lang)
  const lista = municipios()
  const fatos = conteudo().fatos
  // A capa da home deixou de ser foto de um município: desde 14/08/2026 é o filme
  // institucional do consórcio (VIDEO_DA_CAPA). A faixa de áudio da região continua saindo
  // da mesma cidade de antes, porque é a gravação que existe (P-03); é dado de áudio, não
  // escolha de destaque, e some quando a faixa da região for gravada.
  const capa = lista.find((m) => m.slug === 'cabo-frio') ?? lista[0]!
  const faixa = servir(capa.audio, lang)

  // CS-HOME-006: o recorte vai pronto para o cliente, que só sorteia (CS-SORT-003).
  const grupos: LugarDeCidade[] = lista.map((m) => ({
    slug: m.slug,
    nome: m.nome,
    opcoes: pontosDo(m.slug).map((p) => ({
      id: p.id,
      nome: texto(p.nome, lang),
      foto: p.foto,
      alt: texto(p.foto.alt, lang),
    })),
  }))

  return (
    <main>
      <Hero
        video={VIDEO_DA_CAPA}
        alt={r.videoDaCapa}
        credito={CREDITO_DA_CAPA}
        titulo="Conderlagos"
        linha={r.chamadaDaCapa}
      >
        {/* CS-HOME-001: o play da capa é o maior elemento da primeira dobra. */}
        <Audio
          url={faixa.valor.url}
          duracao={faixa.valor.dur}
          rotulo={r.ouvirRegiao}
          poiId="regiao"
          municipio="conderlagos"
          origem="home"
          largo
        />
      </Hero>

      {/* CS-HOME-005: número grande, uma frase, e o nome da fonte. Fato, nunca adjetivo. */}
      <Fatos
        itens={fatos.map((fato) => ({
          id: fato.id,
          numero: fato.numero,
          texto: texto(fato.texto, lang),
          fonte_url: fato.fonte_url,
          fonte_nome: fato.fonte_nome,
        }))}
      />

      {/* CS-HOME-006: nove cards, um ponto por município, sempre. */}
      <section className="pt-9">
        <h2 className="mb-3 px-4 text-secao font-semibold">{r.navLugares}</h2>
        <LugaresDaHome grupos={grupos} lang={lang} />
      </section>

      <section className="pt-8">
        {/* O título da seção não conta cidades. Com o site chamado Conderlagos, o número
            que vale é o do consórcio, e ele muda quando Armação dos Búzios entrar. */}
        <h2 className="px-4 text-secao font-semibold">{r.cidades}</h2>
        <p className="mt-1 mb-4 px-4 text-[0.8rem] text-tinta-suave">{r.ordemSorteada}</p>
        <GradeDeMunicipios
          itens={lista.map((m) => ({
            slug: m.slug,
            nome: m.nome,
            foto: { src: m.hero.src, alt: texto(m.hero.alt, lang), credito: m.hero.credito },
          }))}
          lang={lang}
          origem="home"
        />
      </section>

      <section className="px-4 py-9">
        {/* CS-DESIGN-005: secundária, largura natural. Mesmo peso do link da secretaria na
            página de município, e é isso que a padronização garante: antes os dois eram
            contorno oceano com padding diferente, e a diferença virava hierarquia. */}
        <Link href={`/${lang}/lugares/`} className={classesDeAcao('secundaria')}>
          {r.osLugares} →
        </Link>
      </section>
    </main>
  )
}
