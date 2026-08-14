/**
 * As preferências de leitura do visitante — CS-DESIGN-006.
 *
 * **O que elas são e o que não são.** São duas: tamanho do texto e movimento. Não há "modo
 * de alto contraste", e a ausência é decisão: a paleta publicada mede de 6,0:1 a 18,4:1
 * (conferido em testes/acessibilidade), acima dos 4,5:1 de CS-DESIGN-004, e uma segunda
 * paleta seria um segundo lugar com cor — exatamente o que CS-DESIGN-003 proíbe enquanto o
 * manual de marca (P-01) não chega.
 *
 * **O padrão de movimento vem do sistema, não de nós.** Quem já pediu `prefers-reduced-motion`
 * no aparelho não precisa pedir de novo aqui; o controle existe para quem não sabe que essa
 * chave existe, ou para quem quer parar o vídeo só nesta visita. Por isso `movimento` tem
 * três estados e não dois: `sistema` é o padrão, e é diferente de "o visitante escolheu
 * completo".
 *
 * **Onde isto mora no DOM:** dois atributos em `<html>`, aplicados por
 * `aplicarNoDocumento()`. Quem reage a eles é o CSS (app/tema.css) e o vídeo da capa. Um
 * atributo, um dono — nenhum componente lê `localStorage` por conta própria.
 *
 * **Sessão, não visitante.** Fica em `sessionStorage`, como o resto do estado do site: a
 * escolha vale para a visita que está acontecendo no telefone de quem está no estande, e o
 * próximo visitante daquela mesa começa limpo. CS-OURO-010 continua inteiro — nada disto é
 * cookie, nada disto identifica ninguém.
 */
export const TAMANHOS = ['padrao', 'grande', 'maior'] as const
export const MOVIMENTOS = ['sistema', 'reduzido'] as const

export type Tamanho = (typeof TAMANHOS)[number]
export type Movimento = (typeof MOVIMENTOS)[number]
export type Preferencias = { texto: Tamanho; movimento: Movimento }

export const PADRAO: Preferencias = { texto: 'padrao', movimento: 'sistema' }

export const CHAVE = 'prefs_leitura'

/** Avisa a página inteira que a preferência mudou, sem prop atravessando cinco componentes. */
export const EVENTO_MUDOU = 'preferencias:mudou'

const ehTamanho = (valor: unknown): valor is Tamanho => TAMANHOS.includes(valor as Tamanho)
const ehMovimento = (valor: unknown): valor is Movimento => MOVIMENTOS.includes(valor as Movimento)

/** Função pura, para o teste alcançar sem navegador. Valor estranho vira o padrão. */
export function normalizar(bruto: unknown): Preferencias {
  if (!bruto || typeof bruto !== 'object') return PADRAO
  const { texto, movimento } = bruto as Record<string, unknown>
  return {
    texto: ehTamanho(texto) ? texto : PADRAO.texto,
    movimento: ehMovimento(movimento) ? movimento : PADRAO.movimento,
  }
}

export function ler(): Preferencias {
  try {
    return normalizar(JSON.parse(sessionStorage.getItem(CHAVE) ?? 'null'))
  } catch {
    // Navegação privada em alguns navegadores lança ao ler. Preferência é conforto, não
    // conteúdo: cair no padrão é a resposta certa, e nunca a tela em branco.
    return PADRAO
  }
}

export function gravar(preferencias: Preferencias): void {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(preferencias))
  } catch {
    /* sem armazenamento, a escolha vale para esta página e não persiste */
  }
  aplicarNoDocumento(preferencias)
  window.dispatchEvent(new CustomEvent(EVENTO_MUDOU, { detail: preferencias }))
}

export function aplicarNoDocumento(preferencias: Preferencias): void {
  const raiz = document.documentElement
  raiz.dataset['texto'] = preferencias.texto
  raiz.dataset['movimento'] = preferencias.movimento
}

/**
 * `true` quando o movimento deve parar — pela escolha do visitante OU pelo sistema.
 * Está aqui, e não dentro do vídeo, porque a próxima peça animada vai precisar da mesma
 * resposta, e duas leituras da mesma decisão é como as duas se separam.
 */
export function movimentoReduzido(): boolean {
  if (ler().movimento === 'reduzido') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
