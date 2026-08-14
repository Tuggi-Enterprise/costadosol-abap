/**
 * Prova das entradas de mesa — criterio de aceite A-05.
 *
 * O teste roda sobre o HTML gerado, nao sobre a intencao: e o mesmo texto que vai para
 * public/<slug>/index.html.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IDIOMAS_INTERFACE, MUNICIPIOS } from '../scripts/content-schema.ts'
import {
  SEGMENTOS_RESERVADOS,
  TETO_BYTES,
  paginaDeRedirecionamento,
  verificarColisao,
} from '../scripts/gen-redirects.ts'

const paginas = MUNICIPIOS.map((m) => ({ ...m, html: paginaDeRedirecionamento(m.slug, m.nome) }))

test('CS-NAV-002: existe uma entrada de mesa para cada municipio do consorcio', () => {
  // Contado a partir de MUNICIPIOS, nunca escrito a mao: quando Armacao dos Buzios entrou,
  // a decima mesa tinha que aparecer sozinha, e um "9" cravado aqui teria escondido isso.
  assert.equal(paginas.length, MUNICIPIOS.length)
  for (const { slug, html } of paginas) {
    assert.ok(html.includes(`"${slug}"`), `${slug} nao aparece na propria pagina`)
  }
})

test('CS-NAV-003: usa location.replace, nunca location.href', () => {
  for (const { slug, html } of paginas) {
    assert.match(html, /location\.replace\(/, `${slug} nao usa replace`)
    assert.doesNotMatch(html, /location\.href\s*=/, `${slug} usa href — o botao voltar volta ao redirect`)
  }
})

test('CS-NAV-005: grava entry_municipio e qr_id antes de sair da pagina', () => {
  for (const { slug, html } of paginas) {
    assert.ok(html.includes(`sessionStorage.setItem("entry_municipio",S)`), slug)
    assert.ok(html.includes(`sessionStorage.setItem("qr_id","mesa-"+S)`), slug)
    const posGravacao = html.indexOf('qr_id')
    const posSaida = html.indexOf('location.replace')
    assert.ok(posGravacao < posSaida, `${slug}: sai da pagina antes de gravar a origem`)
  }
})

test('CS-MUN-004: cada entrada cabe no teto de bytes e nao pede recurso externo', () => {
  for (const { slug, html } of paginas) {
    const bytes = Buffer.byteLength(html, 'utf8')
    assert.ok(bytes <= TETO_BYTES, `${slug} tem ${bytes} bytes`)
    assert.doesNotMatch(html, /<link|src=|@import|https?:\/\//, `${slug} carrega recurso externo`)
  }
})

test('CS-NAV-002: resolve os tres idiomas da interface, com fallback pt', () => {
  const html = paginas[0]!.html
  for (const idioma of IDIOMAS_INTERFACE) {
    assert.ok(html.includes(`"${idioma}"`), `falta ${idioma}`)
  }
  assert.match(html, /l="pt"/)
  // pt-BR, en-US e es-AR precisam casar pelo prefixo, senao todo aparelho cai em pt.
  assert.match(html, /n\.indexOf\(I\[i\]\+"-"\)===0/)
})

test('CS-NAV-002: slug que colide com segmento reservado da raiz falha na geracao', () => {
  for (const { slug } of MUNICIPIOS) {
    assert.doesNotThrow(() => verificarColisao(slug), slug)
  }
  for (const reservado of SEGMENTOS_RESERVADOS) {
    assert.throws(() => verificarColisao(reservado), /colide/)
  }
})

test('CS-NAV-002: sem JavaScript a pessoa ainda chega ao municipio', () => {
  for (const { slug, html } of paginas) {
    assert.ok(html.includes(`<noscript><meta http-equiv="refresh" content="0;url=/pt/${slug}/">`), slug)
  }
})
