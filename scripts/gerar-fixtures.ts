/**
 * Gera `fixtures/validos/` — o conjunto de dados de exemplo do §16.5 do briefing.
 *
 * Estes arquivos NAO vao ao ar e nao sao conteudo: todo texto e marcador, toda fonte
 * aponta para example.org. Servem para provar que o validador funciona e para rodar o
 * site em desenvolvimento enquanto P-03 e P-05 nao fecham (CONTENT_DIR=fixtures/validos).
 *
 * Gerado, nunca editado a mao: a lista dos nove e a cobertura das rotas tem um dono so,
 * que e scripts/content-schema.ts.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { COBERTURA_ROTAS, IDIOMAS_CONTEUDO, MUNICIPIOS, PONTOS_POR_MUNICIPIO } from './content-schema.ts'

const idiomas = <T,>(fabrica: (idioma: string) => T): Record<string, T> =>
  Object.fromEntries(IDIOMAS_CONTEUDO.map((idioma) => [idioma, fabrica(idioma)]))

const audio = (arquivo: string, dur: number) =>
  idiomas((idioma) => ({ url: `/audio/${idioma}/${arquivo}.mp3`, dur }))

const municipios = MUNICIPIOS.map((m) => ({
  slug: m.slug,
  nome: m.nome,
  linha: idiomas((idioma) => `[${idioma}] Marcador de posicionamento de ${m.nome}.`),
  hero: {
    src: `/img/mun/${m.slug}`,
    alt: idiomas((idioma) => `[${idioma}] Marcador de descricao da foto de ${m.nome}.`),
    credito: 'EXEMPLO — credito pendente (P-05)',
  },
  audio: audio(`mun-${m.slug}`, 45),
  secretaria: {
    nome: 'Secretaria Municipal de Turismo',
    url: 'https://example.org/secretaria',
    selo: `/img/selo/${m.slug}.svg`,
  },
  pontos: Array.from({ length: PONTOS_POR_MUNICIPIO }, (_, i) => `${m.slug}-${i + 1}`),
}))

const tipos = ['essencial', 'essencial', 'complementar', 'inesperado'] as const
const categorias = ['natureza', 'historia', 'cultura', 'gastronomia'] as const

const pontos = MUNICIPIOS.flatMap((m, indiceMunicipio) =>
  Array.from({ length: PONTOS_POR_MUNICIPIO }, (_, i) => ({
    id: `${m.slug}-${i + 1}`,
    municipio: m.slug,
    tipo: tipos[i],
    nome: idiomas((idioma) => `[${idioma}] Lugar ${i + 1} de ${m.nome}`),
    categoria: categorias[i],
    coords: [-22.5 - indiceMunicipio * 0.1, -42.0 - i * 0.05],
    teaser: idiomas((idioma) => `[${idioma}] Marcador de chamada do lugar ${i + 1} de ${m.nome}, dentro do limite de 180 caracteres.`),
    texto: idiomas((idioma) => `[${idioma}] Marcador de texto completo do lugar ${i + 1} de ${m.nome}.`),
    audio: audio(`${m.slug}-${i + 1}`, 50),
    foto: {
      v: `/img/poi/${m.slug}-${i + 1}-v`,
      h: `/img/poi/${m.slug}-${i + 1}-h`,
      alt: idiomas((idioma) => `[${idioma}] Marcador de descricao da foto do lugar ${i + 1}.`),
      credito: 'EXEMPLO — credito pendente (P-05)',
    },
    fonte_verificacao: [
      {
        afirmacao: 'EXEMPLO — afirmacao pendente de apuracao (P-03)',
        url: 'https://example.org/fonte',
        consultado_em: '2026-08-12',
        revisor: 'pendente (P-23)',
      },
    ],
    ordem: i + 1,
  })),
)

const nomesDeRota: Record<string, Record<string, string>> = {
  'rota-da-lagoa': { pt: 'A rota da lagoa', en: 'The lagoon route', es: 'La ruta de la laguna' },
  'rota-do-mar': { pt: 'A rota do mar', en: 'The sea route', es: 'La ruta del mar' },
  'rota-da-mata': { pt: 'A rota da mata', en: 'The forest route', es: 'La ruta del bosque' },
  'costa-do-sol-inteira': { pt: 'A Costa do Sol inteira', en: 'The whole Costa do Sol', es: 'Toda la Costa do Sol' },
}

const cores: Record<string, string> = {
  'rota-da-lagoa': '#2f6f9f',
  'rota-do-mar': '#1c8a8a',
  'rota-da-mata': '#3f7a3f',
  'costa-do-sol-inteira': '#b06a2c',
}

const rotas = Object.entries(COBERTURA_ROTAS).map(([id, slugs]) => ({
  id,
  nome: nomesDeRota[id],
  eixo: idiomas((idioma) => `[${idioma}] Marcador de eixo geografico.`),
  cor: cores[id],
  municipios: [...slugs],
  // Um ponto por municipio da rota, na ordem do caminho.
  pontos: slugs.map((slug) => `${slug}-1`),
  geometria: { type: 'LineString', coordinates: slugs.map((_, i) => [-42.0 - i * 0.1, -22.5 - i * 0.1]) },
  duracao_sugerida: idiomas((idioma) => `[${idioma}] 2 dias`),
  // Nulos de proposito: numero so entra com fonte apurada (CS-CONT-003, P-04).
  distancia_km: null,
  tempo_estimado: null,
  fonte: null,
  pdf: Object.fromEntries(IDIOMAS_CONTEUDO.map((idioma) => [idioma, `/pdf/${id}-${idioma}.pdf`])),
}))

const fatos = (['aereo', 'wsl', 'natureza'] as const).map((id) => ({
  id,
  titulo: idiomas((idioma) => `[${idioma}] Marcador de titulo do fato ${id}`),
  numero: '000',
  texto: idiomas((idioma) => `[${idioma}] Marcador de frase do fato ${id}. Numero e fonte pendentes (P-22).`),
  fonte_url: 'https://example.org/fonte',
  fonte_nome: 'EXEMPLO — fonte pendente (P-22)',
  confianca: 'baixa' as const,
}))

const destino = resolve('fixtures/validos')
await mkdir(destino, { recursive: true })

for (const [arquivo, dados] of [
  ['municipios.json', municipios],
  ['pontos.json', pontos],
  ['rotas.json', rotas],
  ['fatos.json', fatos],
] as const) {
  await writeFile(resolve(destino, arquivo), JSON.stringify(dados, null, 2) + '\n', 'utf8')
}

console.log(`fixtures/validos: ${municipios.length} municipios, ${pontos.length} pontos, ${rotas.length} rotas, ${fatos.length} fatos.`)
