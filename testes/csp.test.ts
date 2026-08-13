/**
 * A CSP publicada — CS-OURO-010 e o criterio A-17.
 *
 * O React em modo de desenvolvimento chama `eval()` para remontar pilha de chamada, e sem
 * `unsafe-eval` o `npm run dev` enche o console de erro de CSP. A permissao existe so no
 * desenvolvimento, e este teste e o que impede a correcao mais obvia — soltar `unsafe-eval`
 * para todo mundo — de ir ao ar sem ninguem perceber. Em producao o React nunca chama
 * `eval`, entao nada se perde.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import config from '../next.config.ts'

async function csp(ambiente: string): Promise<string> {
  const anterior = process.env.NODE_ENV
  // @ts-expect-error NODE_ENV e somente leitura no tipo, e o teste precisa dos dois valores
  process.env.NODE_ENV = ambiente
  try {
    const grupos = (await config.headers?.()) ?? []
    const cabecalho = grupos[0]?.headers.find((h) => h.key === 'Content-Security-Policy')
    return cabecalho?.value ?? ''
  } finally {
    // @ts-expect-error mesma razao
    process.env.NODE_ENV = anterior
  }
}

test('A-17/CS-OURO-010: a CSP de producao nao permite eval', async () => {
  const valor = await csp('production')
  assert.ok(valor.length > 0, 'sem CSP, CS-OURO-010 vira intencao outra vez')
  assert.doesNotMatch(valor, /unsafe-eval/)
  assert.match(valor, /script-src 'self' 'unsafe-inline'/)
})

test('A-17: a CSP de producao mantem o site preso ao proprio dominio', async () => {
  const valor = await csp('production')
  for (const diretiva of [
    "default-src 'self'",
    "connect-src 'self'",
    "img-src 'self' data:",
    "frame-ancestors 'none'",
  ]) {
    assert.ok(valor.includes(diretiva), `falta ${diretiva}`)
  }
})

test('CS-ARQ-004: em desenvolvimento a CSP libera eval, senao o React nao roda', async () => {
  assert.match(await csp('development'), /unsafe-eval/)
})
