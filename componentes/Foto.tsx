/**
 * CS-PERF-003 e CS-OURO-006 — a foto é a isca, e crédito não é opcional.
 *
 * `credito` é prop obrigatória: foto sem crédito não compila, e o critério A-16 deixa de
 * depender de alguém olhar a tela.
 *
 * Onde o crédito fica é decisão de leitura, não de gosto: SOBRE a imagem ele virava uma
 * tarja escura que brigava com o nome da cidade no card e cortava o nome do autor no meio.
 * Embaixo, em cinza pequeno e alinhado à direita, ele é lido quando se procura e ignorado
 * quando não. Sobre a foto só nos casos de largura inteira, onde não existe "embaixo".
 *
 * Quando a foto ainda não existe (P-05), desenha um espaço curto e discreto. Espaço vazio
 * honesto é melhor que foto de outro lugar — mas não precisa ter a altura de uma foto.
 */
export type Proporcao = 'v' | 'h' | 'hero'
export type LugarDoCredito = 'abaixo' | 'sobre' | 'fora'

const PROPORCAO: Record<Proporcao, string> = {
  v: '4 / 5',
  h: '3 / 2',
  hero: '5 / 6',
}

/**
 * A capa é retrato no telefone e paisagem no desktop. Com uma proporção só, 5/6 tomava a
 * tela inteira de um monitor e o visitante rolava uma tela cheia de foto antes de ler o
 * primeiro fato. Proporção fixa não sobrevive a duas telas tão diferentes.
 */
const CLASSE_DE_PROPORCAO: Partial<Record<Proporcao, string>> = {
  hero: 'aspect-[5/6] md:aspect-[16/9]',
}

export const FOTO_PENDENTE = '/img/pendente'

/** As larguras que scripts/variantes-de-foto.ts gera. Mudou lá, muda aqui — e vice-versa. */
const conjunto = (src: string, formato: 'avif' | 'webp') =>
  [`${src}-400.${formato} 400w`, `${src}-800.${formato} 800w`, `${src}.${formato} 1600w`].join(', ')

export function Foto({
  src,
  alt,
  credito,
  proporcao = 'v',
  prioridade = false,
  arredondada = true,
  credito_em = 'abaixo',
  pendente_em = 'nada',
  sizes = '(min-width: 46rem) 23rem, 50vw',
}: {
  src: string
  alt: string
  credito: string
  proporcao?: Proporcao
  prioridade?: boolean
  arredondada?: boolean
  /**
   * `fora` deixa o crédito para quem chama — usado só onde a foto sangra até a borda e
   * quem desenha o crédito precisa de outro contexto. Nunca significa "sem crédito":
   * CS-OURO-006 vale igual, e o critério A-16 confere na tela.
   */
  credito_em?: LugarDoCredito
  /**
   * Como desenhar a ausência de foto. `nada` não desenha coisa alguma — foto que não
   * existe não precisa de moldura, e caixa vazia com legenda parece defeito de carregamento.
   * `proporcao` mantém a altura da foto que virá, e serve onde o espaço faz parte de uma
   * grade: ali um card mais baixo que os vizinhos é que pareceria defeito.
   */
  pendente_em?: 'nada' | 'proporcao'
  /** Largura que a foto ocupa na tela. O padrão é o card da grade, de duas colunas. */
  sizes?: string
}) {
  const pendente = src === FOTO_PENDENTE

  if (pendente) {
    if (pendente_em === 'nada') return null
    // Sem texto: "foto pendente (P-05)" é conversa interna do time e não vai para a tela.
    return (
      <div
        aria-hidden
        className={`w-full bg-[linear-gradient(160deg,var(--color-oceano),var(--color-oceano-fundo))] ${arredondada ? 'rounded-peca' : ''} ${CLASSE_DE_PROPORCAO[proporcao] ?? ''}`}
        style={CLASSE_DE_PROPORCAO[proporcao] ? undefined : { aspectRatio: PROPORCAO[proporcao] }}
      />
    )
  }

  return (
    <figure className="m-0">
      <div
        className={`relative w-full overflow-hidden bg-areia ${arredondada ? 'rounded-peca' : ''} ${CLASSE_DE_PROPORCAO[proporcao] ?? ''}`}
        style={CLASSE_DE_PROPORCAO[proporcao] ? undefined : { aspectRatio: PROPORCAO[proporcao] }}
      >
        {/* CS-PERF-001: o card mede ~180 px e não pode baixar o arquivo de 1600. O
            `sizes` é o que faz o navegador escolher — sem ele, srcset não economiza. */}
        <picture>
          <source srcSet={conjunto(src, 'avif')} sizes={sizes} type="image/avif" />
          <source srcSet={conjunto(src, 'webp')} sizes={sizes} type="image/webp" />
          <img
            src={`${src}-800.webp`}
            alt={alt}
            loading={prioridade ? 'eager' : 'lazy'}
            decoding={prioridade ? 'sync' : 'async'}
            className="h-full w-full object-cover"
          />
        </picture>
        {credito_em === 'sobre' && (
          // Canto inferior, sem cápsula: no alto ele era a primeira coisa que o olho
          // encontrava numa foto de largura inteira.
          <figcaption
            title={credito}
            // Branco cheio, não esmaecido: A-16 confere se o crédito está VISÍVEL, e a
            // sombra é o que garante os 4,5:1 de CS-DESIGN-004 sobre foto clara.
            className="absolute right-2 bottom-1.5 max-w-[60%] truncate text-[0.65rem] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]"
          >
            {credito}
          </figcaption>
        )}
      </div>
      {credito_em === 'abaixo' && (
        // CS-DESIGN-004: a 70% de opacidade este crédito media 2,7:1 contra o papel —
        // abaixo dos 4,5:1. Cor cheia, e o tamanho pequeno o mantém discreto sem apagá-lo.
        <figcaption title={credito} className="mt-1 truncate text-[0.7rem] text-tinta-suave">
          {credito}
        </figcaption>
      )}
    </figure>
  )
}
