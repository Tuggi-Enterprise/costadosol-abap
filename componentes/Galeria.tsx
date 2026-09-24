/**
 * Galeria da página do município (content/apresentacao.json). Mesma quantidade de fotos
 * nas dez cidades — o validador recusa diferente (CS-OURO-004).
 *
 * Faixa horizontal com rolagem no telefone, grade no desktop: no telefone a galeria não
 * pode empurrar os quatro pontos para longe do play.
 */
import { Foto } from './Foto.tsx'

export type FotoDaGaleria = { src: string; alt: string; credito: string }

export function Galeria({ titulo, fotos }: { titulo: string; fotos: FotoDaGaleria[] }) {
  if (fotos.length === 0) return null
  return (
    <section className="pt-7">
      <h2 className="mb-3 px-4 text-secao font-semibold">{titulo}</h2>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {fotos.map((foto) => (
          <li key={foto.src} className="w-[80%] shrink-0 snap-start md:w-auto">
            <Foto src={foto.src} alt={foto.alt} credito={foto.credito} credito_em="sobre" proporcao="h" sizes="(min-width: 46rem) 20rem, 80vw" />
          </li>
        ))}
      </ul>
    </section>
  )
}
