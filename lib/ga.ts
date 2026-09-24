/**
 * Google Analytics 4 — o destino de `track()` (P-10, decisão do operador em 24/09/2026,
 * que revisou CS-OURO-010). Um lugar só para o ID e para os hosts: `next.config.ts` lê
 * daqui para a CSP, e o layout raiz para o carregador.
 *
 * O ID de medição é público por natureza — vai no HTML de toda página —, então não é
 * segredo e CS-OURO-009 não se aplica.
 */
export const GA_ID = 'G-P091G7P4JL'

/** Hosts da CSP, conferidos em developers.google.com/tag-platform/security/guides/csp. */
export const GA_HOSTS = {
  script: ['https://www.googletagmanager.com'],
  img: ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
  connect: ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
} as const

/**
 * Nomes que o GA4 coleta sozinho e reserva. Enviar um evento com esse nome se mistura ao
 * automático (ou é descartado): `session_start` nosso carrega `qr_id` e `entry_municipio`,
 * que o do GA não tem.
 */
export const NOME_NO_GA: Partial<Record<string, string>> = {
  session_start: 'site_session_start',
}

/**
 * Sem Google Signals e sem personalização de anúncio: o dado mede o site, não alimenta
 * publicidade — é o que o aviso do rodapé promete.
 */
export const GA_ARRANQUE = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});`
