import Link from 'next/link'
import { Foto } from '../../../componentes/Foto.tsx'
import { LinkDeMunicipio } from '../../../componentes/LinkDeMunicipio.tsx'
import { municipios, pontosDo } from '../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, texto } from '../../../lib/idioma.ts'
import { rotulos } from '../../../lib/interface.ts'

/**
 * Os 36 lugares, agrupados por município (§7 do briefing).
 *
 * CS-OURO-005 — esta é uma listagem de leitura, não a grade de navegação da home: aqui a
 * ordem é **alfabética**, e é sempre a mesma. Sorteio existe para não criar hierarquia
 * entre municípios onde a ordem é disputada; num índice, ordem estável é o que faz alguém
 * achar o que procura.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export default async function Lugares({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const r = rotulos(lang)
  const lista = [...municipios()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

  return (
    <main>
      <header className="px-4 pt-7 pb-2">
        <h1 className="text-secao font-semibold">{r.lugaresTitulo}</h1>
      </header>

      {lista.map((m) => (
        <section key={m.slug} className="px-4 py-5 [&+&]:border-t [&+&]:border-borda/50">
          <LinkDeMunicipio
            href={`/${lang}/${m.slug}/`}
            municipio={m.slug}
            className="inline-flex items-center text-[0.7rem] tracking-widest text-lagoa-tinta uppercase"
          >
            {m.nome}
          </LinkDeMunicipio>
          <ul className="mt-2 grid gap-3">
            {pontosDo(m.slug).map((ponto) => (
              <li key={ponto.id} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
                <Foto
                  src={ponto.foto.v}
                  alt={texto(ponto.foto.alt, lang)}
                  credito={ponto.foto.credito}
                  proporcao="v"
                  // Numa lista densa o crédito de cada miniatura viraria ruído; ele está
                  // na página do município, onde a mesma foto aparece grande.
                  credito_em="fora"
                  pendente_em="proporcao"
                  sizes="5.5rem"
                />
                <div>
                  <h2 className="text-[1rem] leading-tight font-medium">
                    <Link
                      href={`/${lang}/${m.slug}/${ponto.id}/`}
                      className="underline-offset-4 hover:underline"
                    >
                      {texto(ponto.nome, lang)}
                    </Link>
                  </h2>
                  <p className="mt-1 text-[0.85rem] leading-snug text-tinta-suave">
                    {texto(ponto.teaser, lang)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
