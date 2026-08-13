'use client'

/**
 * CS-CONT-008 — o fallback e silencioso na tela, mas `<html lang>` declara o idioma
 * REALMENTE servido. Leitor de tela pronuncia errado se mentirmos, e indexador registra
 * errado.
 *
 * Tambem e onde a sessao comeca a existir do lado do app: absorve `?p=` e limpa a URL
 * (CS-NAV-005), e emite `session_start` uma vez por sessao — inclusive quando a entrada
 * foi por mesa, caso em que `qr_id` e `entry_municipio` ja estao no sessionStorage,
 * gravados pela pagina de 757 bytes (P-18).
 */
import { useEffect } from 'react'
import { absorverParametroDeEntrada } from '../lib/sessao.ts'
import { eventosRegistrados, trackSessionStart } from '../lib/track.ts'

export function DeclararIdioma({ idioma }: { idioma: string }) {
  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])

  useEffect(() => {
    absorverParametroDeEntrada()
    if (!eventosRegistrados().some((e) => e.evento === 'session_start')) {
      trackSessionStart()
    }
  }, [])

  return null
}
