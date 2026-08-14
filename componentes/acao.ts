/**
 * CS-DESIGN-005 — o peso de uma ação na tela sai daqui, e de nenhum outro lugar.
 *
 * **O defeito que isto fecha.** Em 14/08/2026 o site tinha quatro tratamentos de botão
 * escritos à mão, em quatro arquivos, sem nome nenhum: o play (`bg-oceano`), o link da
 * secretaria (contorno oceano, `px-6 py-4`), o link dos lugares (contorno oceano, `px-5
 * py-3`) e o compartilhar (contorno cinza). Os dois do meio eram a **mesma** intenção com
 * padding diferente, que é a segunda implementação da mesma decisão. Nada impedia o quinto.
 *
 * **Nível é peso, largura é espaço, e as duas coisas são independentes.** Era aí que os dois
 * tratamentos do meio divergiam: um era largo porque estava sozinho no bloco, o outro era
 * estreito porque estava numa linha, e a diferença de padding virou, sem querer, uma
 * diferença de hierarquia que ninguém decidiu.
 *
 * **O que NÃO se decide aqui: cor.** As classes abaixo só citam token de `app/tema.css`, que
 * CS-DESIGN-003 aponta como único lugar com cor. O manual de marca do Conderlagos é P-01 e
 * não chegou; quando chegar, troca-se o bloco `@theme` e este arquivo não muda.
 *
 * **Uma primária por dobra.** CS-DESIGN-002 diz que áudio é o produto: se numa mesma dobra
 * duas coisas gritam igual, nenhuma é a principal. O que compete com o play não é primária,
 * por mais importante que pareça no briefing.
 *
 * **Link de texto não é ação e não vem daqui.** Voltar para a cidade, ou o link da secretaria
 * dentro de uma linha da tabela de contatos, são links dentro de fluxo de leitura. Vestir
 * qualquer um deles de pílula transforma uma tabela de dez linhas em dez chamadas.
 */

/** O peso da ação. Só existem três, e acrescentar um quarto é decisão de design. */
export type NivelDeAcao =
  /** A ação principal da dobra. Uma só. Hoje é sempre o play (CS-DESIGN-002). */
  | 'primaria'
  /** O caminho oficial que a página oferece depois da principal: secretaria, lista completa. */
  | 'secundaria'
  /** Existe, não disputa: compartilhar, canal de rede social, voltar de nível. */
  | 'terciaria'

/** Quanto espaço a ação ocupa. Não tem relação com o peso dela. */
export type LarguraDeAcao =
  /** Sozinha no bloco, largura inteira. */
  | 'cheia'
  /** Numa linha, ao lado de outra coisa, ou dentro de um card. */
  | 'natural'

/**
 * `min-h-[44px]` vive aqui, e não na regra `a[data-alvo='toque']` de `app/tema.css`: aquela
 * regra continua valendo para alvo de toque que NÃO é ação (card da grade, item da lista),
 * e esta garante o mesmo para quem passa por este módulo, sem depender de alguém lembrar de
 * pôr um atributo. CS-DESIGN-004, os dois casos, cada um com um dono.
 */
const BASE = 'items-center rounded-pilula font-medium transition-colors min-h-[44px] no-underline'

/**
 * O `display` sai daqui, e não de `BASE`: com `inline-flex` na base e `flex` na largura
 * cheia, as duas classes iam juntas no elemento e quem decidia era a ordem em que o
 * Tailwind emitiu as regras no CSS, não a ordem em que estão escritas no atributo. Uma
 * propriedade, um lugar.
 */
const LARGURA: Record<LarguraDeAcao, string> = {
  cheia: 'flex w-full justify-center gap-3 px-6 py-4 text-lg',
  natural: 'inline-flex gap-2 px-5 py-3 text-sm',
}

const NIVEL: Record<NivelDeAcao, string> = {
  primaria: 'bg-oceano text-white hover:bg-oceano-fundo',
  secundaria: 'border border-oceano text-oceano hover:bg-oceano hover:text-white',
  terciaria: 'border border-borda text-tinta-suave hover:border-oceano hover:text-oceano',
}

/** Ação que existe mas não responde. Some o peso, mantém o espaço: a tela não salta. */
const DESABILITADA = 'cursor-not-allowed border border-transparent bg-sal text-tinta-suave'

export function classesDeAcao(
  nivel: NivelDeAcao,
  largura: LarguraDeAcao = 'natural',
  { desabilitada = false }: { desabilitada?: boolean } = {},
): string {
  return [BASE, LARGURA[largura], desabilitada ? DESABILITADA : NIVEL[nivel]].join(' ')
}
