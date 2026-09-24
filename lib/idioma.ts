/**
 * CS-CONT-007 inteiro mora aqui, e em nenhum outro lugar.
 *
 * A interface existe nos oito idiomas; conteudo existe em tres. Todo componente
 * que mostra conteudo passa por `servir()`. Segunda implementacao disto e defeito: e a
 * decisao "qual idioma estou servindo" duplicada, e e assim que um bloco fica em ingles
 * e o irmao ao lado em portugues.
 */
import { FALLBACK_CONTEUDO, IDIOMAS_CONTEUDO, IDIOMAS_INTERFACE } from '../scripts/content-schema.ts'

export { FALLBACK_CONTEUDO, IDIOMAS_CONTEUDO, IDIOMAS_INTERFACE }

export type IdiomaInterface = (typeof IDIOMAS_INTERFACE)[number]

/**
 * P-19: bandeira representa pais, nao idioma — `es` tem mais de vinte paises e `zh`
 * esbarra em escolha politicamente carregada. O nome no proprio idioma resolve, e cabe
 * melhor em 375 px.
 */
export const NOME_DO_IDIOMA: Record<IdiomaInterface, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

export function ehIdiomaDeInterface(valor: string): valor is IdiomaInterface {
  return (IDIOMAS_INTERFACE as readonly string[]).includes(valor)
}

export function temConteudoProprio(idioma: string): boolean {
  return (IDIOMAS_CONTEUDO as readonly string[]).includes(idioma)
}

export type Servido<T> = { valor: T; idiomaServido: string }

/**
 * Devolve o valor no idioma pedido, ou o do fallback, junto com QUAL idioma saiu.
 * O fallback e silencioso na tela (CS-CONT-008) — mas quem renderiza precisa saber,
 * porque `<html lang>` e `og:locale` declaram o idioma servido, nao o escolhido.
 */
export function servir<T>(bloco: Record<string, T>, idioma: string): Servido<T> {
  const proprio = bloco[idioma]
  if (proprio !== undefined) return { valor: proprio, idiomaServido: idioma }

  const reserva = bloco[FALLBACK_CONTEUDO]
  if (reserva !== undefined) return { valor: reserva, idiomaServido: FALLBACK_CONTEUDO }

  // Chegar aqui significa conteudo sem `en`, que o validador do build ja teria barrado.
  throw new Error(`CS-CONT-007: bloco sem "${idioma}" e sem "${FALLBACK_CONTEUDO}"`)
}

/** Atalho para o caso comum: so o texto. */
export function texto(bloco: Record<string, string>, idioma: string): string {
  return servir(bloco, idioma).valor
}

/** Resolve o que o navegador pediu contra os oito. `pt-BR` casa com `pt`. */
export function resolverDoNavegador(preferido: string | undefined): IdiomaInterface {
  const pedido = (preferido ?? 'pt').toLowerCase()
  for (const idioma of IDIOMAS_INTERFACE) {
    if (pedido === idioma || pedido.startsWith(`${idioma}-`)) return idioma
  }
  return 'pt'
}
