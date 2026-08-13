import type { NextConfig } from 'next'
import { MUNICIPIOS } from './scripts/content-schema.ts'

/**
 * Hospedagem: Vercel (decisao do operador em 12/08/2026, ver docs/02-arquitetura.md §1).
 *
 * Sem `output: 'export'`: na Vercel, `redirects`, `headers`, middleware e Route Handler
 * existem, e sao exatamente o que o painel, o endpoint de leads e a CSP precisam. O que
 * NAO muda e CS-ARQ-001 — toda pagina de conteudo continua pre-renderizada no build, e o
 * site nao consulta banco em tempo de execucao.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // As nove entradas de mesa sao HTML de 757 bytes em public/<slug>/index.html
  // (CS-NAV-002), e o router do Next nao as acha sozinho: sem este rewrite, /saquarema/
  // devolve 404 — verificado removendo o rewrite e rebuildando, nao por leitura.
  //
  // O QR impresso deve trazer a barra final (costadosol.tuggi.app/saquarema/): sem ela o
  // servidor responde 308 antes de chegar aqui, e um salto a mais no pavilhao lotado e
  // exatamente o que CS-MUN-004 esta contando.
  async rewrites() {
    return MUNICIPIOS.map(({ slug }) => ({
      source: `/${slug}`,
      destination: `/${slug}/index.html`,
    }))
  },

  // CS-OURO-010 vira bloqueio, nao intencao: o navegador recusa script de terceiro.
  // `connect-src` ganha o host do analytics quando P-10 fechar.
  //
  // `unsafe-eval` SO em desenvolvimento: o React em modo de desenvolvimento usa `eval()`
  // para reconstruir pilha de chamada, e sem a permissao o `npm run dev` enche o console
  // de erro de CSP. Em producao o React nunca chama `eval`, e a permissao nao pode ir ao
  // ar — e ela que o criterio A-17 confere. `NODE_ENV` e definido pelo proprio Next: e
  // `development` no `next dev` e `production` no `next build`.
  async headers() {
    const script =
      process.env.NODE_ENV === 'production'
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

    return [
      {
        source: '/:caminho*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              script,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "media-src 'self'",
              "connect-src 'self'",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
