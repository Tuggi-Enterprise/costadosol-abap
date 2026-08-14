/**
 * CS-MUN-005 — os canais de rede social da cidade, para divulgação.
 *
 * **Terciária, e o motivo é a ordem da página.** A dobra já tem o play (primária) e o canal
 * oficial da secretaria (secundária). Rede social é um quarto destino num lugar onde
 * CS-OITO-004 já cuida para nada competir com a conversão do município; se ela chegar
 * pesando igual, tira gente do CTA que a prefeitura pediu. Por isso vem **dentro** do mesmo
 * bloco do canal oficial, logo abaixo dele, no nível terciário de CS-DESIGN-005.
 *
 * **Link, nunca embed.** Widget de feed do Instagram carrega script e cookie de terceiro, o
 * que derruba CS-OURO-010 e o critério de aceite A-17 — a mesma razão pela qual o vídeo da
 * capa não é embed do YouTube. Aqui sai um `<a>` e mais nada.
 *
 * O que vai à tela é o próprio `@`, não a palavra "Instagram": o arroba já diz de quem é a
 * conta, e é o que distingue a conta da secretaria da conta da prefeitura sem precisar de
 * legenda explicando a diferença (CS-OURO-001).
 */
import { classesDeAcao } from './acao.ts'

export type RedeSocial = { rede: 'instagram' | 'facebook' | 'youtube'; perfil: string; url: string }

/** Marcas de terceiro desenhadas por nós: nenhum arquivo de ícone vem de fora (A-17). */
function Icone({ rede }: { rede: RedeSocial['rede'] }) {
  const comum = {
    'aria-hidden': true,
    viewBox: '0 0 24 24',
    className: 'h-4 w-4 shrink-0',
  } as const

  if (rede === 'facebook') {
    return (
      <svg {...comum} fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.5-1.5H16.7V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H7.6v3h2.7v8h3.2Z" />
      </svg>
    )
  }
  if (rede === 'youtube') {
    return (
      <svg {...comum} fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.4a2.5 2.5 0 0 0-1.7 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.7 1.8c1.6.4 7.9.4 7.9.4s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2Z" />
      </svg>
    )
  }
  return (
    <svg {...comum} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RedesDoMunicipio({
  redes,
  rotulo,
  cidade,
}: {
  redes: RedeSocial[]
  /** Leva `{cidade}`: em inglês o nome vem antes, como em `secretariaDaCidade`. */
  rotulo: string
  cidade: string
}) {
  if (redes.length === 0) return null

  return (
    <nav aria-label={rotulo.replace('{cidade}', cidade)} className="mt-3 flex flex-wrap gap-2">
      {redes.map((rede) => (
        <a
          key={rede.url}
          href={rede.url}
          target="_blank"
          rel="noopener noreferrer"
          className={classesDeAcao('terciaria')}
        >
          <Icone rede={rede.rede} />
          {rede.perfil}
        </a>
      ))}
    </nav>
  )
}
