'use client'

/**
 * Estado de sessao: semente do sorteio, origem da entrada e identificador da sessao.
 * Tudo em `sessionStorage` — expira ao fechar a aba, e nao existe cookie nenhum
 * (CS-OURO-010).
 *
 * `entry_municipio` e `qr_id` sao gravados pela pagina de mesa (CS-NAV-002) ANTES de o
 * app carregar; aqui so se le. `entry_municipio` e imutavel dentro da sessao
 * (CS-NAV-005): nao muda quando a pessoa navega para outro municipio.
 */

const CHAVES = {
  semente: 'semente',
  sessao: 'session_id',
  entrada: 'entry_municipio',
  qr: 'qr_id',
  idioma: 'lang',
} as const

function ler(chave: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave: string, valor: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(chave, valor)
  } catch {
    /* navegacao privada com storage bloqueado: a sessao segue sem memoria */
  }
}

function criarOuLer(chave: string, criar: () => string): string {
  const existente = ler(chave)
  if (existente) return existente
  const novo = criar()
  gravar(chave, novo)
  return novo
}

export function sessionId(): string {
  return criarOuLer(CHAVES.sessao, () => crypto.randomUUID())
}

/** CS-SORT-001/002: uma semente por sessao, estavel enquanto a aba viver. */
export function semente(): string {
  return criarOuLer(CHAVES.semente, () => crypto.randomUUID())
}

export function entryMunicipio(): string | null {
  return ler(CHAVES.entrada)
}

export function qrId(): string | null {
  return ler(CHAVES.qr)
}

export function guardarIdioma(idioma: string): void {
  gravar(CHAVES.idioma, idioma)
}

export function idiomaGuardado(): string | null {
  return ler(CHAVES.idioma)
}

/**
 * CS-NAV-005: le `?p=` uma vez, guarda e LIMPA a URL. Sem isso, o `qr_id` viaja em todo
 * link compartilhado e a peca fisica que converteu vira ruido.
 */
export function absorverParametroDeEntrada(): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const peca = url.searchParams.get('p')
  if (!peca) return
  if (!ler(CHAVES.qr)) gravar(CHAVES.qr, peca)
  url.searchParams.delete('p')
  window.history.replaceState(null, '', url.toString())
}

/** PRNG semeado: `Math.random()` nao serve, a ordem tem de ser reproduzivel na sessao. */
function prng(semente: string): () => number {
  let h = 2166136261
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

/**
 * CS-HOME-006/CS-SORT-003: qual dos quatro pontos de um municipio aparece na home e
 * sorteado por sessao, com a MESMA semente da ordem dos cards. A chave entra no PRNG
 * junto da semente: sem ela, os nove municipios sorteariam o mesmo indice, e a home
 * mostraria sempre o ponto 1 de todos ou sempre o ponto 3 de todos.
 */
export function sortearIndice(sementeDaSessao: string, chave: string, tamanho: number): number {
  if (tamanho <= 0) return 0
  return Math.floor(prng(`${sementeDaSessao}:${chave}`)() * tamanho) % tamanho
}

/** CS-SORT-002: Fisher-Yates com PRNG semeado. Mesma semente, mesma ordem. */
export function embaralhar<T>(lista: readonly T[], sementeDaSessao: string): T[] {
  const sorteio = prng(sementeDaSessao)
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1))
    const a = copia[i] as T
    const b = copia[j] as T
    copia[i] = b
    copia[j] = a
  }
  return copia
}
