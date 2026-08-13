import Link from 'next/link'
import { Fatos } from '../../componentes/Fatos.tsx'
import { GradeDeMunicipios } from '../../componentes/GradeDeMunicipios.tsx'
import { Hero } from '../../componentes/Hero.tsx'
import { Audio } from '../../componentes/Audio.tsx'
import { LugaresDaHome, type LugarDeCidade } from '../../componentes/LugaresDaHome.tsx'
import { conteudo, municipios, pontosDo } from '../../lib/conteudo.ts'
import { rotulos } from '../../lib/interface.ts'
import { IDIOMAS_INTERFACE, servir, texto } from '../../lib/idioma.ts'

export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const r = rotulos(lang)
  const lista = municipios()
  const fatos = conteudo().fatos
  // A capa é a foto de um município, e ela muda quando o banco das secretarias chegar
  // (P-05). Não é destaque de cidade: é a única foto de largura inteira do site.
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
        src={capa.hero.src}
        alt={texto(capa.hero.alt, lang)}
        credito={capa.hero.credito}
        titulo="Costa do Sol"
        linha={r.chamadaDaCapa}
      >
        {/* CS-HOME-001: o play da capa é o maior elemento da primeira dobra. */}
        <Audio
          url={faixa.valor.url}
          duracao={faixa.valor.dur}
          rotulo={r.ouvirRegiao}
          poiId="regiao"
          municipio="costa-do-sol"
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
        {/* Sem contagem de municípios enquanto P-29 não fechar: dizer "nove cidades" num
            site chamado Costa do Sol afirma um número que a fonte oficial contradiz. */}
        <h2 className="px-4 text-secao font-semibold">{r.cidades}</h2>
        <p className="mt-1 mb-4 px-4 text-[0.8rem] text-tinta-suave">{r.ordemSorteada}</p>
        <GradeDeMunicipios itens={lista} lang={lang} origem="home" />
      </section>

      <section className="px-4 py-9">
        <Link
          href={`/${lang}/lugares/`}
          data-alvo="toque"
          className="inline-flex items-center gap-2 rounded-pilula border border-oceano px-5 py-3 text-oceano"
        >
          {r.osLugares} →
        </Link>
      </section>
    </main>
  )
}
