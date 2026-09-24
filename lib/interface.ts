/**
 * Texto de INTERFACE — existe nos TRES idiomas do site (pt, en, es), a mesma lista do
 * conteudo desde 13/08/2026. Antes eram oito aqui e tres em content/, e a diferenca era o
 * defeito: quem escolhia "Deutsch" via cinco rotulos em alemao e o lugar em ingles.
 *
 * Regras que mandam na redacao daqui:
 *   CS-OURO-001 — nenhuma explicacao de mecanica. Nada de "modo", "recurso", "toque aqui
 *                 para ativar". O rotulo diz o que acontece, nao como funciona.
 *   CS-OITO-003 — a chamada das outras cidades e neutra: nada de "veja tambem".
 *
 * O site passou a se chamar **Conderlagos** por decisao do operador em 14/08/2026, e P-29
 * fechou junto, pela opcao 2: Armacao dos Buzios entrou, sao dez municipios e 40 lugares.
 *
 * **Os dois numeros escritos aqui em letra — "nove cidades" e "40 lugares" — nao sao copy
 * livre.** Eles derivam de `MUNICIPIOS` e `PONTOS_POR_MUNICIPIO`, em scripts/content-schema,
 * e um teste de interface confere os dois contra o schema a cada rodada. Municipio novo, ou
 * ponto por municipio diferente, quebra o teste em vez de publicar numero velho.
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
  /** Botão de som do vídeo da capa: o rótulo é a ação, não o estado. */
  ativarSom: string
  desativarSom: string
  lerMenos: string
  outrasCidades: string
  ordemSorteada: string
  receberMaterial: string
  secretaria: string
  /** Leva `{cidade}`: a ordem das palavras muda entre os tres idiomas. */
  secretariaDaCidade: string
  /** CS-MUN-005 — rotulo do grupo de canais. Leva `{cidade}`, pela mesma razao. */
  redesDaCidade: string
  osLugares: string
  idioma: string
  cidades: string
  chamadaDaCapa: string
  /** Descreve o filme da capa para quem nao o ve. Nao e legenda: nao vai a tela. */
  videoDaCapa: string
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
  /** Aviso do rodapé: o site usa cookie do Google Analytics (P-10, 24/09/2026). */
  avisoDeMedicao: string
  /** CS-DESIGN-006 — os controles de leitura do rodape. */
  leituraTamanho: string
  leituraMovimento: string
  leituraMovimentoSistema: string
  leituraMovimentoReduzido: string
  /** Agenda da home (eventos.json). */
  /** CS-HOME-005 — o rótulo do bloco dos três fatos. */
  fatosTitulo: string
  agendaTitulo: string
  agendaChamada: string
  fonte: string
  agendaCompleta: string
  agendaPaginaChamada: string
  /** Evento sem data fechada pela fonte. */
  emBreve: string
  navAgenda: string
  /** Galeria da pagina do municipio. Leva `{cidade}`. */
  fotosDaCidade: string
}

const DICIONARIO: Record<string, Rotulos> = {
  pt: {
    ouvirCidade: 'Ouvir a cidade',
    ouvir: 'Ouvir',
    lerMais: 'Ler mais',
    ativarSom: 'Ativar som',
    desativarSom: 'Desativar som',
    lerMenos: 'Ler menos',
    outrasCidades: 'O Conderlagos tem mais nove cidades.',
    ordemSorteada: 'A ordem muda a cada visita.',
    receberMaterial: 'Receber o material de',
    secretaria: 'Secretaria de Turismo',
    secretariaDaCidade: 'Secretaria de Turismo de {cidade}',
    redesDaCidade: 'Canais de {cidade}',
    osLugares: 'Os 40 lugares do Conderlagos',
    idioma: 'Idioma',
    cidades: 'Cidades',
    chamadaDaCapa: 'Entre a lagoa e o mar aberto, no litoral do Rio de Janeiro.',
    videoDaCapa: 'Imagens aéreas das praias, das lagoas e das cidades do Conderlagos.',
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
    avisoDeMedicao: 'Usamos cookies do Google Analytics para entender como o site é usado. Nenhum dado é usado para publicidade.',
    leituraTamanho: 'Tamanho do texto',
    leituraMovimento: 'Movimento',
    leituraMovimentoSistema: 'Como está',
    leituraMovimentoReduzido: 'Reduzido',
    fatosTitulo: 'O Conderlagos em números',
    agendaTitulo: 'Agenda',
    agendaChamada: 'Próximos eventos nas cidades do Conderlagos.',
    fonte: 'Fonte',
    agendaCompleta: 'Ver a agenda completa',
    agendaPaginaChamada: 'Festivais, inaugurações e datas das cidades do Conderlagos, mês a mês.',
    emBreve: 'Em breve',
    navAgenda: 'Agenda',
    fotosDaCidade: 'Mais de {cidade}',
  },
  en: {
    ouvirCidade: 'Listen to the city',
    ouvir: 'Listen',
    lerMais: 'Read more',
    ativarSom: 'Turn sound on',
    desativarSom: 'Turn sound off',
    lerMenos: 'Read less',
    outrasCidades: 'Conderlagos has nine more cities.',
    ordemSorteada: 'The order changes on every visit.',
    receberMaterial: 'Receive material from',
    secretaria: 'Tourism Office',
    secretariaDaCidade: '{cidade} Tourism Office',
    redesDaCidade: '{cidade} channels',
    osLugares: 'The 40 places in Conderlagos',
    idioma: 'Language',
    cidades: 'Cities',
    chamadaDaCapa: 'Between the lagoon and the open sea, on the Rio de Janeiro coast.',
    videoDaCapa: 'Aerial footage of the beaches, lagoons and towns of Conderlagos.',
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
    avisoDeMedicao: 'We use Google Analytics cookies to understand how the site is used. No data is used for advertising.',
    leituraTamanho: 'Text size',
    leituraMovimento: 'Motion',
    leituraMovimentoSistema: 'As is',
    leituraMovimentoReduzido: 'Reduced',
    fatosTitulo: 'Conderlagos in numbers',
    agendaTitulo: 'Events',
    agendaChamada: 'Upcoming events in the Conderlagos cities.',
    fonte: 'Source',
    agendaCompleta: 'See the full calendar',
    agendaPaginaChamada: 'Festivals, openings and dates in the Conderlagos cities, month by month.',
    emBreve: 'Coming soon',
    navAgenda: 'Events',
    fotosDaCidade: 'More of {cidade}',
  },
  es: {
    ouvirCidade: 'Escuchar la ciudad',
    ouvir: 'Escuchar',
    lerMais: 'Leer más',
    ativarSom: 'Activar sonido',
    desativarSom: 'Desactivar sonido',
    lerMenos: 'Leer menos',
    outrasCidades: 'Conderlagos tiene nueve ciudades más.',
    ordemSorteada: 'El orden cambia en cada visita.',
    receberMaterial: 'Recibir el material de',
    secretaria: 'Secretaría de Turismo',
    secretariaDaCidade: 'Secretaría de Turismo de {cidade}',
    redesDaCidade: 'Canales de {cidade}',
    osLugares: 'Los 40 lugares de Conderlagos',
    idioma: 'Idioma',
    cidades: 'Ciudades',
    chamadaDaCapa: 'Entre la laguna y el mar abierto, en el litoral de Río de Janeiro.',
    videoDaCapa: 'Imágenes aéreas de las playas, las lagunas y las ciudades de Conderlagos.',
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
    avisoDeMedicao: 'Usamos cookies de Google Analytics para entender cómo se usa el sitio. Ningún dato se usa para publicidad.',
    leituraTamanho: 'Tamaño del texto',
    leituraMovimento: 'Movimiento',
    leituraMovimentoSistema: 'Como está',
    leituraMovimentoReduzido: 'Reducido',
    fatosTitulo: 'Conderlagos en cifras',
    agendaTitulo: 'Agenda',
    agendaChamada: 'Próximos eventos en las ciudades de Conderlagos.',
    fonte: 'Fuente',
    agendaCompleta: 'Ver la agenda completa',
    agendaPaginaChamada: 'Festivales, inauguraciones y fechas de las ciudades de Conderlagos, mes a mes.',
    emBreve: 'Próximamente',
    navAgenda: 'Agenda',
    fotosDaCidade: 'Más de {cidade}',
  },
}

export function rotulos(idioma: string): Rotulos {
  return DICIONARIO[idioma] ?? (DICIONARIO['pt'] as Rotulos)
}
