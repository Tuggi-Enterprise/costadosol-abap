import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Audio } from '../../../componentes/Audio.tsx'
import { CardDePonto } from '../../../componentes/CardDePonto.tsx'
import { Compartilhar } from '../../../componentes/Compartilhar.tsx'
import { Galeria } from '../../../componentes/Galeria.tsx'
import { Hero } from '../../../componentes/Hero.tsx'
import { GradeDeMunicipios } from '../../../componentes/GradeDeMunicipios.tsx'
import { RegistrarAberturaDeMunicipio } from '../../../componentes/RegistrarAbertura.tsx'
import { FOTO_PENDENTE } from '../../../componentes/Foto.tsx'
import { classesDeAcao } from '../../../componentes/acao.ts'
import { RedesDoMunicipio } from '../../../componentes/RedesDoMunicipio.tsx'
import { apresentacaoDo, municipios, outrasCidades, pontosDo } from '../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, ehIdiomaDeInterface, servir, texto } from '../../../lib/idioma.ts'
import { rotulos } from '../../../lib/interface.ts'

/**
 * CS-MUN-001 — a porta de entrada principal do projeto, não um segundo nível: a maior
 * parte das sessões começa aqui, vinda do QR de uma mesa. A página se identifica sozinha
 * e funciona sem ninguém para explicar, porque metade das mesas estará vazia em algum
 * momento.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.flatMap((lang) => municipios().map((m) => ({ lang, municipio: m.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; municipio: string }>
}): Promise<Metadata> {
  const { lang, municipio: slug } = await params
  const m = municipios().find((x) => x.slug === slug)
  if (!m) return {}
  const linha = servir(m.linha, lang)
  // Município sem foto no catálogo (content/fotos.json), e apontar a og:image para o marcador de
  // ausência publica um cartão com imagem quebrada. Sem foto, sem imagem — o cartão cai
  // para título e descrição, que existem.
  const temFoto = m.hero.src !== FOTO_PENDENTE
  return {
    title: `${m.nome}, Conderlagos`,
    description: linha.valor,
    openGraph: {
      title: `${m.nome}, Conderlagos`,
      description: linha.valor,
      // CS-CONT-008: declara o idioma servido, não o escolhido.
      locale: linha.idiomaServido,
      // CS-MUN-003: og:image própria por município, com o nome renderizado (P-17).
      ...(temFoto ? { images: [{ url: `${m.hero.src}-800.webp` }] } : {}),
    },
  }
}

export default async function PaginaDoMunicipio({
  params,
}: {
  params: Promise<{ lang: string; municipio: string }>
}) {
  const { lang, municipio: slug } = await params
  if (!ehIdiomaDeInterface(lang)) notFound()

  const m = municipios().find((x) => x.slug === slug)
  if (!m) notFound()

  const r = rotulos(lang)
  const pontos = pontosDo(slug)
  const faixa = servir(m.audio, lang)
  const apresentacao = apresentacaoDo(slug)

  return (
    <main>
      {/* CS-DADO-002: a abertura é contada aqui, não no clique — senão a entrada por
          mesa, que não passa por clique nenhum, nunca conta. */}
      <RegistrarAberturaDeMunicipio municipio={m.slug} />

      <Hero
        src={m.hero.src}
        alt={texto(m.hero.alt, lang)}
        credito={m.hero.credito}
        titulo={m.nome}
        linha={texto(m.linha, lang)}
        idiomaDaLinha={servir(m.linha, lang).idiomaServido}
      >
        {/* CS-DESIGN-002: o play é o maior elemento da dobra, e na porta de entrada do
            projeto ele precisa estar visível sem rolar. */}
        <Audio
          url={faixa.valor.url}
          duracao={faixa.valor.dur}
          rotulo={r.ouvirCidade}
          poiId={`mun-${m.slug}`}
          municipio={m.slug}
          origem="cidade"
          largo
        />
      </Hero>

      {apresentacao && (
        <p
          lang={servir(apresentacao.descricao, lang).idiomaServido}
          className="max-w-[62ch] px-4 pt-6 text-[1rem] leading-relaxed"
        >
          {texto(apresentacao.descricao, lang)}
        </p>
      )}

      <section>
        {pontos.map((ponto, indice) => {
          // O recorte é montado aqui: o card é componente de cliente, e o `Ponto` inteiro
          // levava `fonte_verificacao` — afirmação apurada, data e revisor — ao navegador.
          const faixaDoPonto = servir(ponto.audio, lang)
          return (
            <CardDePonto
              key={ponto.id}
              ponto={{
                id: ponto.id,
                municipio: ponto.municipio,
                nome: texto(ponto.nome, lang),
                teaser: texto(ponto.teaser, lang),
                texto: texto(ponto.texto, lang),
                idiomaDoTexto: servir(ponto.texto, lang).idiomaServido,
                foto: {
                  src: ponto.foto.v,
                  alt: texto(ponto.foto.alt, lang),
                  credito: ponto.foto.credito,
                },
                audio: { url: faixaDoPonto.valor.url, dur: faixaDoPonto.valor.dur },
              }}
              lang={lang}
              numero={indice + 1}
              rotulos={{ ouvir: r.ouvir, lerMais: r.lerMais, lerMenos: r.lerMenos }}
            />
          )
        })}
      </section>

      {apresentacao && (
        <Galeria
          titulo={r.fotosDaCidade.replace('{cidade}', m.nome)}
          fotos={apresentacao.galeria.map((f) => ({ src: f.src, alt: texto(f.alt, lang), credito: f.credito }))}
        />
      )}

      {/*
        O CTA "Receber o material de [cidade]" (CS-LEAD-001) SAIU da tela até o formulário
        existir. Ele era um `<button>` sem ação: o maior elemento da página de entrada
        principal não respondia ao toque, e no balcão isso se lê como site quebrado — pior
        que a ausência do botão, porque a pessoa já gastou o toque.

        Volta com P-20 (quem é controlador, prazo de retenção, canal de exclusão) e P-27
        (banco alcançável para gravar o lead ao vivo na feira). Enquanto isso, o que a
        página tem para oferecer é o canal oficial da cidade, que existe e funciona.
      */}
      <div className="border-t border-borda/60 px-4 py-7">
        {/* CS-DESIGN-005: secundária. É o caminho oficial que a página oferece depois do
            play, e é largura cheia porque está sozinha no bloco — largura é espaço, não
            peso. */}
        <a
          href={m.secretaria.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classesDeAcao('secundaria', 'cheia')} text-center`}
        >
          {r.secretariaDaCidade.replace('{cidade}', m.nome)}
        </a>
        {/* CS-MUN-005: dentro do mesmo bloco do canal oficial, e não como seção própria.
            Uma quarta seção aqui competiria com a conversão que CS-OITO-004 protege. */}
        <RedesDoMunicipio redes={m.redes} rotulo={r.redesDaCidade} cidade={m.nome} />
      </div>

      {/* CS-OITO-004: depois do CTA, para não competir com a conversão da cidade de
          entrada. CS-OITO-006: é daqui que sai a métrica mais valiosa do projeto. */}
      <section className="bg-sal py-7">
        <h2 className="mb-3 px-4 text-secao font-semibold">{r.outrasCidades}</h2>
        <GradeDeMunicipios
          itens={outrasCidades(slug).map((outra) => ({
            slug: outra.slug,
            nome: outra.nome,
            foto: {
              src: outra.hero.src,
              alt: texto(outra.hero.alt, lang),
              credito: outra.hero.credito,
            },
          }))}
          lang={lang}
          origem="outras_cidades"
        />
      </section>

      {/* CS-MUN-002 fecha a página aqui. É o vetor de saída do conteúdo do pavilhão: quem
          está com o telefone na mão manda a cidade para quem decide a compra. */}
      <div className="px-4 py-7">
        <Compartilhar
          titulo={`${m.nome}, Conderlagos`}
          rotulo={r.compartilhar}
          rotuloCopiado={r.linkCopiado}
          municipio={m.slug}
        />
      </div>
    </main>
  )
}
