'use client'

/**
 * CS-EVT-001: uma funcao, e nenhum componente fala com o analytics direto.
 *
 * A ferramenta ainda nao foi escolhida (P-10) e CS-EVT-005 diz que a instrumentacao nao
 * espera. As duas coisas convivem por adaptador: hoje `console` e `buffer`; quando P-10
 * fechar, entra a terceira implementacao e nenhum componente muda.
 */
import { entryMunicipio, qrId, sessionId } from './sessao.ts'
import { NOME_NO_GA } from './ga.ts'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export type Evento =
  | 'session_start'
  | 'lang_select'
  | 'home_fato_view'
  | 'municipio_open'
  | 'poi_open'
  | 'audio_play'
  | 'audio_progress'
  | 'rota_open'
  | 'rota_ouvir_start'
  | 'rota_ouvir_complete'
  | 'mapa_interacao'
  | 'cta_click'
  | 'form_open'
  | 'form_submit'
  | 'interesse_declarado'
  | 'rota_download'
  | 'share_click'
  | 'scroll_depth'
  | 'ui_click'

export type Props = Record<string, string | number | boolean | null>
export type Registro = { evento: Evento; props: Props }

const buffer: Registro[] = []

/** O que os testes leem para provar A-13, e o que o painel de desenvolvimento mostra. */
export function eventosRegistrados(): readonly Registro[] {
  return buffer
}

function idiomaDaUrl(): string {
  if (typeof window === 'undefined') return 'pt'
  return window.location.pathname.split('/').filter(Boolean)[0] ?? 'pt'
}

/** Percentual da página já visto, contando a janela: página que cabe na tela é 100. */
export function profundidade(rolado: number, janela: number, total: number): number {
  if (total <= janela) return 100
  return Math.min(100, Math.round(((rolado + janela) / total) * 100))
}

export function track(evento: Evento, props: Props = {}): void {
  if (typeof window === 'undefined') return

  // CS-EVT-002: session_id, ts e lang entram sozinhos, em todo evento.
  const completo: Registro = {
    evento,
    props: {
      session_id: sessionId(),
      ts: new Date().toISOString(),
      lang: idiomaDaUrl(),
      ...props,
    },
  }
  buffer.push(completo)
  // O carregador só existe no build de produção (app/layout.tsx); fora dele `gtag` não
  // está definido e o evento fica no buffer e no console.
  window.gtag?.('event', NOME_NO_GA[evento] ?? evento, completo.props)

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[evento]', completo.evento, completo.props)
  }
}

/**
 * CS-EVT-003 lista tres origens; a entrada por mesa nao tinha nenhuma, e por isso a
 * abertura do municipio de ENTRADA nunca era contada — justo a linha que CS-DADO-002
 * descreve como "inflada para o municipio de entrada". Duas origens novas fecham o
 * buraco, e a extensao da taxonomia precisa do aval do produto:
 *
 *   `mesa`    — chegou direto na pagina do municipio da propria mesa (CS-NAV-002)
 *   `interno` — outro link do site (lista de lugares, cidades de uma rota)
 */
export type OrigemDeAbertura = 'home' | 'outras_cidades' | 'menu' | 'mesa' | 'interno'

/**
 * O clique acontece numa pagina e a abertura e contada na seguinte. Sem este bilhete, ou
 * o evento sai duas vezes (no clique e na montagem) ou sai sem saber de onde veio.
 */
type Bilhete = { municipio: string; origem: OrigemDeAbertura; posicao: number | null }
let bilhete: Bilhete | null = null

export function marcarOrigemDeAbertura(
  municipio: string,
  origem: OrigemDeAbertura,
  posicaoNoSorteio?: number,
): void {
  bilhete = { municipio, origem, posicao: posicaoNoSorteio ?? null }
}

/**
 * Sem bilhete, a origem se deduz do que a sessao ja sabe: veio da mesa daquele municipio,
 * ou de um link interno que nao marcou origem. Funcao pura de proposito — e a unica
 * regra de leitura do painel que da para provar em teste.
 */
export function inferirOrigem(entrada: string | null, municipio: string): OrigemDeAbertura {
  return entrada === municipio ? 'mesa' : 'interno'
}

/**
 * CS-EVT-004: `entry_municipio` e `cruzamento` sao calculados AQUI, nunca passados pelo
 * componente. Deixar nove chamadores calcularem a metrica mais valiosa do projeto e
 * nove chances de errar — e o erro so apareceria no relatorio, depois da feira.
 *
 * Chamado uma vez por abertura, na montagem da pagina do municipio. A janela de 2 s
 * existe para o StrictMode do desenvolvimento, que monta todo efeito duas vezes: sem ela,
 * cada abertura viraria duas no `npm run dev`.
 */
let ultimaAbertura: { municipio: string; ts: number } | null = null

export function trackMunicipioOpen(municipio: string): void {
  const agora = Date.now()
  if (ultimaAbertura && ultimaAbertura.municipio === municipio && agora - ultimaAbertura.ts < 2000) {
    return
  }
  ultimaAbertura = { municipio, ts: agora }

  const entrada = entryMunicipio()
  const marcado = bilhete && bilhete.municipio === municipio ? bilhete : null
  bilhete = null

  track('municipio_open', {
    municipio,
    entry_municipio: entrada,
    cruzamento: entrada !== null && entrada !== municipio,
    origem: marcado?.origem ?? inferirOrigem(entrada, municipio),
    posicao_no_sorteio: marcado?.posicao ?? null,
  })
}

export function trackSessionStart(): void {
  track('session_start', {
    qr_id: qrId(),
    entry_municipio: entryMunicipio(),
    device: typeof navigator === 'undefined' ? 'desconhecido' : navigator.userAgent,
    locale_navegador: typeof navigator === 'undefined' ? 'desconhecido' : navigator.language,
    referrer: typeof document === 'undefined' ? '' : document.referrer,
  })
}
