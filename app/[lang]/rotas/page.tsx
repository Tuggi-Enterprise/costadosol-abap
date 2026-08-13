import { LinkDeRota } from '../../../componentes/LinkDeRota.tsx'
import { municipios, rotas } from '../../../lib/conteudo.ts'
import { IDIOMAS_INTERFACE, texto } from '../../../lib/idioma.ts'
import { rotulos } from '../../../lib/interface.ts'

/**
 * As quatro rotas (CS-ROTA-001, CS-CONT-004).
 *
 * Cada município aparece em exatamente duas rotas, e a cobertura plana é o que impede a
 * rota de virar hierarquia entre cidades. Por isso as quatro têm o mesmo peso visual:
 * mesma altura de card, mesma tipografia, e a cor é identificação de traçado no mapa —
 * não destaque.
 */
export function generateStaticParams() {
  return IDIOMAS_INTERFACE.map((lang) => ({ lang }))
}

export default async function Rotas({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const r = rotulos(lang)
  const nomeDoMunicipio = new Map(municipios().map((m) => [m.slug, m.nome]))

  return (
    <main>
      <header className="px-4 pt-7">
        <h1 className="text-secao font-semibold">{r.rotasTitulo}</h1>
        <p className="mt-1 text-[0.9rem] text-tinta-suave">{r.rotasChamada}</p>
      </header>

      <ul className="grid gap-3 p-4">
        {rotas().map((rota) => (
          <li key={rota.id}>
            <LinkDeRota
              href={`/${lang}/rotas/${rota.id}/`}
              rotaId={rota.id}
              origem="cards"
              className="block rounded-peca border border-borda/70 p-4"
            >
              <span className="block h-1 w-12 rounded-pilula" style={{ background: rota.cor }} />
              <h2 className="mt-3 text-[1.15rem] leading-tight font-semibold">{texto(rota.nome, lang)}</h2>
              <p className="mt-1 text-[0.9rem] text-tinta-suave">{texto(rota.eixo, lang)}</p>
              <p className="mt-3 text-[0.8rem] text-tinta-suave">
                {rota.municipios.map((slug) => nomeDoMunicipio.get(slug)).join(' · ')}
              </p>
            </LinkDeRota>
          </li>
        ))}
      </ul>
    </main>
  )
}
