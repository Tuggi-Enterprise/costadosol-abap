/**
 * O logotipo do Conderlagos.
 *
 * **A origem do arquivo é provisória e está registrada de propósito.** O que está em
 * `public/img/marca/` foi baixado do Wikimedia Commons (`File:Conderlagos.jpg`, CC BY-SA
 * 4.0), tem 800 px de largura e fundo branco chapado. É o que existia em 14/08/2026, não é
 * o ativo oficial: o manual de marca é P-01, e o arquivo vetorial vem com ele. Quando
 * chegar, troca-se o conteúdo de `public/img/marca/` e nenhum componente muda.
 *
 * Consequência do fundo branco: a marca só vai sobre superfície clara. Sobre o azul da capa
 * ela apareceria como um retângulo branco, e é por isso que ela não está lá.
 *
 * Sem crédito visível: é a marca do próprio cliente, na página do próprio cliente. O que a
 * licença do arquivo baixado exige está anotado acima e em docs/dev/.
 */
export function Marca({ tamanho = 'pe' }: { tamanho?: 'pe' | 'entrada' }) {
  return (
    <img
      src="/img/marca/conderlagos.webp"
      srcSet="/img/marca/conderlagos-400.webp 436w, /img/marca/conderlagos.webp 872w"
      sizes={tamanho === 'entrada' ? '(min-width: 46rem) 22rem, 70vw' : '11rem'}
      alt="Conderlagos"
      width={872}
      height={424}
      // `eager` na entrada porque ali ela é a única coisa na tela, e a tela dura o tempo de
      // um redirecionamento: carregar depois é não carregar.
      loading={tamanho === 'entrada' ? 'eager' : 'lazy'}
      decoding={tamanho === 'entrada' ? 'sync' : 'async'}
      className={tamanho === 'entrada' ? 'w-[70vw] max-w-[22rem]' : 'w-44'}
    />
  )
}
