/**
 * Texto de INTERFACE — existe nos TRES idiomas do site (pt, en, es), a mesma lista do
 * conteudo desde 13/08/2026. Antes eram oito aqui e tres em content/, e a diferenca era o
 * defeito: quem escolhia "Deutsch" via cinco rotulos em alemao e o lugar em ingles.
 *
 * Regras que mandam na redacao daqui:
 *   CS-OURO-001 — nenhuma explicacao de mecanica. Nada de "modo", "recurso", "toque aqui
 *                 para ativar". O rotulo diz o que acontece, nao como funciona.
 *   CS-OITO-003 — a chamada das outras oito e neutra: nada de "veja tambem".
 *
 * A chamada da capa NAO conta municipios: enquanto P-29 nao fecha, dizer "nove cidades"
 * numa pagina chamada Costa do Sol afirma um numero que a fonte oficial contradiz.
 *
 * `receberMaterial` nao aparece em tela hoje: o CTA de CS-LEAD-001 saiu da pagina do
 * municipio enquanto P-20 (LGPD) e P-27 (banco) nao fecham. O rotulo fica porque a regra
 * fica; some junto com a regra, se ela cair.
 *
 * **Rotulo que junta com nome de cidade leva `{cidade}`, e nao concatenacao.** Em pt e es
 * a cidade vem depois ("Secretaria de Turismo de Cabo Frio"); em ingles vem antes ("Cabo
 * Frio Tourism Office"). Concatenar com um separador fixo produzia texto que nenhum dos
 * tres idiomas escreve.
 */
export type Rotulos = {
  ouvirCidade: string
  ouvir: string
  lerMais: string
  lerMenos: string
  outrasOito: string
  ordemSorteada: string
  receberMaterial: string
  secretaria: string
  /** Leva `{cidade}`: a ordem das palavras muda entre os tres idiomas. */
  secretariaDaCidade: string
  osLugares: string
  idioma: string
  cidades: string
  chamadaDaCapa: string
  ouvirRegiao: string
  navCidades: string
  navRotas: string
  navLugares: string
  navProfissional: string
  rotasTitulo: string
  rotasChamada: string
  lugaresTitulo: string
  profissionalTitulo: string
  contatos: string
  cidadesDaRota: string
  pontosDaRota: string
  navPrincipal: string
  compartilhar: string
  linkCopiado: string
  maisEm: string
  /** CS-OURO-002: a assinatura da marca, e a unica linha da Tuggi no site. */
  assinatura: string
}

const DICIONARIO: Record<string, Rotulos> = {
  pt: {
    ouvirCidade: 'Ouvir a cidade',
    ouvir: 'Ouvir',
    lerMais: 'Ler mais',
    lerMenos: 'Ler menos',
    outrasOito: 'A Costa do Sol tem mais oito cidades.',
    ordemSorteada: 'A ordem muda a cada visita.',
    receberMaterial: 'Receber o material de',
    secretaria: 'Secretaria de Turismo',
    secretariaDaCidade: 'Secretaria de Turismo de {cidade}',
    osLugares: 'Os 36 lugares da Costa do Sol',
    idioma: 'Idioma',
    cidades: 'Cidades',
    chamadaDaCapa: 'Entre a lagoa e o mar aberto, no litoral do Rio de Janeiro.',
    ouvirRegiao: 'Ouvir a região',
    navCidades: 'Cidades',
    navRotas: 'Rotas',
    navLugares: 'Lugares',
    navProfissional: 'Profissional',
    rotasTitulo: 'Rotas',
    rotasChamada: 'Quatro caminhos que atravessam as cidades.',
    lugaresTitulo: 'Todos os lugares',
    profissionalTitulo: 'Para quem vende',
    contatos: 'Contatos das secretarias de turismo',
    cidadesDaRota: 'Cidades desta rota',
    pontosDaRota: 'No caminho',
    navPrincipal: 'Navegação',
    compartilhar: 'Compartilhar',
    linkCopiado: 'Link copiado',
    maisEm: 'Mais em',
    assinatura: 'Conteúdo e tecnologia: Tuggi',
  },
  en: {
    ouvirCidade: 'Listen to the city',
    ouvir: 'Listen',
    lerMais: 'Read more',
    lerMenos: 'Read less',
    outrasOito: 'Costa do Sol has eight more cities.',
    ordemSorteada: 'The order changes on every visit.',
    receberMaterial: 'Receive material from',
    secretaria: 'Tourism Office',
    secretariaDaCidade: '{cidade} Tourism Office',
    osLugares: 'The 36 places in Costa do Sol',
    idioma: 'Language',
    cidades: 'Cities',
    chamadaDaCapa: 'Between the lagoon and the open sea, on the Rio de Janeiro coast.',
    ouvirRegiao: 'Listen to the region',
    navCidades: 'Cities',
    navRotas: 'Routes',
    navLugares: 'Places',
    navProfissional: 'Trade',
    rotasTitulo: 'Routes',
    rotasChamada: 'Four paths that cross the cities.',
    lugaresTitulo: 'All places',
    profissionalTitulo: 'For travel trade',
    contatos: 'Tourism office contacts',
    cidadesDaRota: 'Cities on this route',
    pontosDaRota: 'Along the way',
    navPrincipal: 'Navigation',
    compartilhar: 'Share',
    linkCopiado: 'Link copied',
    maisEm: 'More in',
    assinatura: 'Content and technology: Tuggi',
  },
  es: {
    ouvirCidade: 'Escuchar la ciudad',
    ouvir: 'Escuchar',
    lerMais: 'Leer más',
    lerMenos: 'Leer menos',
    outrasOito: 'Costa do Sol tiene ocho ciudades más.',
    ordemSorteada: 'El orden cambia en cada visita.',
    receberMaterial: 'Recibir el material de',
    secretaria: 'Secretaría de Turismo',
    secretariaDaCidade: 'Secretaría de Turismo de {cidade}',
    osLugares: 'Los 36 lugares de Costa do Sol',
    idioma: 'Idioma',
    cidades: 'Ciudades',
    chamadaDaCapa: 'Entre la laguna y el mar abierto, en el litoral de Río de Janeiro.',
    ouvirRegiao: 'Escuchar la región',
    navCidades: 'Ciudades',
    navRotas: 'Rutas',
    navLugares: 'Lugares',
    navProfissional: 'Profesional',
    rotasTitulo: 'Rutas',
    rotasChamada: 'Cuatro caminos que atraviesan las ciudades.',
    lugaresTitulo: 'Todos los lugares',
    profissionalTitulo: 'Para quien vende',
    contatos: 'Contactos de las secretarías de turismo',
    cidadesDaRota: 'Ciudades de esta ruta',
    pontosDaRota: 'En el camino',
    navPrincipal: 'Navegación',
    compartilhar: 'Compartir',
    linkCopiado: 'Enlace copiado',
    maisEm: 'Más en',
    assinatura: 'Contenido y tecnología: Tuggi',
  },
}

export function rotulos(idioma: string): Rotulos {
  return DICIONARIO[idioma] ?? (DICIONARIO['pt'] as Rotulos)
}
