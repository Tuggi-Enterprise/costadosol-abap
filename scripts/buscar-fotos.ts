/**
 * Busca fotos no Wikimedia Commons, filtra por licenca e baixa com o credito junto.
 *
 * Por que Commons e nao um banco de imagens: P-05 esta aberta e o banco de fotos das nove
 * secretarias nao chegou. Foto sem licenca clara em site com marca de ente publico e risco
 * juridico, nao economia — entao so entra o que tem licenca livre E autor identificado.
 *
 * O credito volta no proprio arquivo de saida: CS-OURO-006 exige credito em toda foto, e o
 * componente Foto recusa renderizar sem ele. Isto aqui e o que torna o credito verdadeiro.
 *
 *   npx tsx scripts/buscar-fotos.ts
 *
 * Saida: public/img/<destino>.jpg|.webp|.avif  +  content/fotos.json (autor, licenca, url)
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const API = 'https://commons.wikimedia.org/w/api.php'

/** Licencas aceitas. Qualquer coisa fora desta lista nao entra, mesmo que a foto seja boa. */
const LICENCAS_ACEITAS = [
  'cc0', 'cc-zero', 'public domain', 'pd-',
  'cc by 2.0', 'cc by 3.0', 'cc by 4.0',
  'cc by-sa 2.0', 'cc by-sa 2.5', 'cc by-sa 3.0', 'cc by-sa 4.0',
]

const LARGURA_MINIMA = 1400

export type FotoEncontrada = {
  destino: string
  titulo: string
  autor: string
  licenca: string
  paginaDaFoto: string
  urlOriginal: string
  largura: number
  altura: number
}

type Busca = {
  destino: string
  termos: string
  /**
   * Tokens que o NOME do arquivo precisa conter. A busca do Commons e fuzzy: pedir
   * "Museu da Aviacao Naval Sao Pedro da Aldeia" devolveu o museu de Pensacola, nos
   * Estados Unidos. Sem esta trava, foto errada com credito certo entra no ar.
   */
  exigir: string[]
  excluir?: string[]
}

/** Compara sem acento e sem caixa: "Itaúna" casa com "itauna". */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function limparHtml(valor: string | undefined): string {
  if (!valor) return ''
  return valor
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function licencaAceita(licenca: string): boolean {
  const l = licenca.toLowerCase()
  return LICENCAS_ACEITAS.some((aceita) => l.includes(aceita))
}

async function buscar(busca: Busca): Promise<FotoEncontrada | null> {
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${busca.termos}`,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    // Pede a miniatura de 1600 px em vez do original: arquivo de Commons passa de 20 MB
    // com frequencia, e download grande e o que estava truncando e quebrando a conversao.
    iiurlwidth: '1600',
    iiextmetadatafilter: 'LicenseShortName|Artist|Credit|ImageDescription',
  }).toString()

  const resposta = await pedirComRitmo(url)

  const dados = (await resposta.json()) as {
    query?: { pages?: Record<string, {
      title: string
      imageinfo?: [{ url: string; thumburl?: string; descriptionurl: string; width: number; height: number
        extmetadata?: Record<string, { value?: string }> }]
    }> }
  }

  const paginas = Object.values(dados.query?.pages ?? {})
  for (const pagina of paginas) {
    const info = pagina.imageinfo?.[0]
    if (!info) continue
    if (info.width < LARGURA_MINIMA) continue
    if (info.width < info.height) continue // paisagem: hero e card horizontal

    const titulo = normalizar(pagina.title)
    if (busca.excluir?.some((termo) => titulo.includes(normalizar(termo)))) continue
    if (!busca.exigir.some((termo) => titulo.includes(normalizar(termo)))) continue
    if (jaUsadas.has(pagina.title)) continue // a mesma foto em dois lugares mente sobre um deles

    const licenca = limparHtml(info.extmetadata?.['LicenseShortName']?.value)
    if (!licencaAceita(licenca)) continue

    const autor = limparHtml(info.extmetadata?.['Artist']?.value) || limparHtml(info.extmetadata?.['Credit']?.value)
    if (!autor) continue // sem autor identificado nao ha credito possivel

    return {
      destino: busca.destino,
      titulo: pagina.title,
      autor,
      licenca,
      paginaDaFoto: info.descriptionurl,
      urlOriginal: info.thumburl ?? info.url,
      largura: info.width,
      altura: info.height,
    }
  }
  return null
}

const espera = (ms: number) => new Promise((pronto) => setTimeout(pronto, ms))

/** Fotos ja escolhidas nesta execucao, para nao repetir a mesma imagem em dois destinos. */
const jaUsadas = new Set<string>()

/** A propria API de busca devolve 429 em rajada, nao so o download. */
async function pedirComRitmo(url: URL, tentativas = 4): Promise<Response> {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    const resposta = await fetch(url, {
      headers: { 'User-Agent': 'costadosol-abav/0.1 (projeto ABAV 2026; contato: suporte@tuggi.app)' },
    })
    if (resposta.ok) return resposta
    if (resposta.status !== 429 && resposta.status < 500) {
      throw new Error(`Commons respondeu ${resposta.status}`)
    }
    await espera(3000 * tentativa)
  }
  throw new Error(`Commons recusou apos ${tentativas} tentativas`)
}

/** Commons devolve 429 quando se baixa em rajada. Ritmo e recuo, nao insistencia. */
async function baixarComRitmo(url: string, tentativas = 4): Promise<Buffer> {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    const resposta = await fetch(url, {
      headers: { 'User-Agent': 'costadosol-abav/0.1 (projeto ABAV 2026; contato: suporte@tuggi.app)' },
    })
    if (resposta.ok) return Buffer.from(await resposta.arrayBuffer())
    if (resposta.status !== 429 && resposta.status < 500) {
      throw new Error(`download falhou (${resposta.status}) para ${url}`)
    }
    await espera(2000 * tentativa)
  }
  throw new Error(`download falhou apos ${tentativas} tentativas: ${url}`)
}

async function baixarEConverter(foto: FotoEncontrada): Promise<void> {
  const original = await baixarComRitmo(foto.urlOriginal)

  const caminho = resolve('public', `${foto.destino}`)
  await mkdir(dirname(caminho), { recursive: true })

  // CS-PERF-003: AVIF com fallback WebP. Largura de 1600 cobre o hero em tela retina
  // sem estourar o orcamento; o card usa a mesma imagem reduzida pelo navegador.
  const base = sharp(original).rotate().resize({ width: 1600, withoutEnlargement: true })
  await base.clone().webp({ quality: 72 }).toFile(`${caminho}.webp`)
  await base.clone().avif({ quality: 55 }).toFile(`${caminho}.avif`)
}

export async function executar(buscas: Busca[]): Promise<FotoEncontrada[]> {
  const encontradas: FotoEncontrada[] = []
  for (const busca of buscas) {
    // Uma foto que falha nao derruba as outras 44: o que falta vira marcador de foto
    // pendente no conteudo, e isso e visivel na tela.
    try {
      const foto = await buscar(busca)
      if (!foto) {
        console.warn(`  sem foto com licenca aceita: ${busca.destino} (${busca.termos})`)
        continue
      }
      await baixarEConverter(foto)
      jaUsadas.add(foto.titulo)
      encontradas.push(foto)
      console.log(`  ${busca.destino} <- ${foto.titulo} [${foto.licenca}]`)
    } catch (erro) {
      console.warn(`  falhou: ${busca.destino} — ${(erro as Error).message}`)
    }
    await espera(1200)
  }
  return encontradas
}

/** O credito e uma linha so, e e ela que aparece embaixo da foto na tela. */
export function credito(foto: FotoEncontrada): string {
  // Autor e licenca sao o que a licenca exige; "Wikimedia Commons" ocupava um terco da
  // linha em toda foto e nao acrescenta nada. A pagina de origem fica em fotos.json.
  return `${foto.autor} · ${foto.licenca}`
}

export type { Busca }
