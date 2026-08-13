/**
 * Texto de INTERFACE — existe nos oito idiomas (CS-CONT-007). Nao confundir com conteudo:
 * conteudo (linha, teaser, texto, audio) existe em tres e vem de content/.
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
 * PENDENTE (P-23): as versoes fr, it, de, zh e ko nao passaram por revisor humano. Sao
 * cinco frases curtas, mas material institucional de ente publico nao vai ao ar sem
 * revisao — erro de idioma aparece na foto que o gabinete posta.
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
  osLugares: string
  escolhaIdioma: string
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
}

const DICIONARIO: Record<string, Rotulos> = {
  pt: {
    ouvirCidade: 'Ouvir a cidade',
    ouvir: 'Ouvir',
    lerMais: 'Ler mais',
    lerMenos: 'Ler menos',
    outrasOito: 'A Costa do Sol tem mais oito cidades.',
    ordemSorteada: 'A ordem das cidades é sorteada a cada acesso.',
    receberMaterial: 'Receber o material de',
    secretaria: 'Secretaria de Turismo',
    osLugares: 'Os 36 lugares da Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
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
  },
  en: {
    ouvirCidade: 'Listen to the city',
    ouvir: 'Listen',
    lerMais: 'Read more',
    lerMenos: 'Read less',
    outrasOito: 'Costa do Sol has eight more cities.',
    ordemSorteada: 'The order of the cities is drawn at each visit.',
    receberMaterial: 'Receive material from',
    secretaria: 'Tourism Office',
    osLugares: 'The 36 places of Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
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
  },
  es: {
    ouvirCidade: 'Escuchar la ciudad',
    ouvir: 'Escuchar',
    lerMais: 'Leer más',
    lerMenos: 'Leer menos',
    outrasOito: 'Costa do Sol tiene ocho ciudades más.',
    ordemSorteada: 'El orden de las ciudades se sortea en cada visita.',
    receberMaterial: 'Recibir el material de',
    secretaria: 'Secretaría de Turismo',
    osLugares: 'Los 36 lugares de Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
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
  },
  fr: {
    ouvirCidade: 'Écouter la ville',
    ouvir: 'Écouter',
    lerMais: 'Lire la suite',
    lerMenos: 'Réduire',
    outrasOito: 'La Costa do Sol compte huit autres villes.',
    ordemSorteada: "L'ordre des villes est tiré au sort à chaque visite.",
    receberMaterial: 'Recevoir la documentation de',
    secretaria: 'Office de tourisme',
    osLugares: 'Les 36 lieux de la Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
    cidades: 'Villes',
      chamadaDaCapa: 'Entre la lagune et la mer ouverte, sur le littoral de Rio de Janeiro.',
    ouvirRegiao: 'Écouter la région',
    navCidades: 'Villes',
    navRotas: 'Itinéraires',
    navLugares: 'Lieux',
    navProfissional: 'Professionnels',
    rotasTitulo: 'Itinéraires',
    rotasChamada: 'Quatre parcours qui traversent les villes.',
    lugaresTitulo: 'Tous les lieux',
    profissionalTitulo: 'Pour les professionnels',
    contatos: 'Contacts des offices de tourisme',
    cidadesDaRota: 'Villes de ce parcours',
    pontosDaRota: 'En chemin',
    navPrincipal: 'Navigation',
    compartilhar: 'Partager',
    linkCopiado: 'Lien copié',
    maisEm: 'Plus à',
  },
  it: {
    ouvirCidade: 'Ascolta la città',
    ouvir: 'Ascolta',
    lerMais: 'Leggi di più',
    lerMenos: 'Leggi meno',
    outrasOito: 'La Costa do Sol ha altre otto città.',
    ordemSorteada: "L'ordine delle città viene estratto a ogni visita.",
    receberMaterial: 'Ricevere il materiale di',
    secretaria: 'Assessorato al Turismo',
    osLugares: 'I 36 luoghi della Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
    cidades: 'Città',
      chamadaDaCapa: 'Tra la laguna e il mare aperto, sulla costa di Rio de Janeiro.',
    ouvirRegiao: 'Ascolta la regione',
    navCidades: 'Città',
    navRotas: 'Percorsi',
    navLugares: 'Luoghi',
    navProfissional: 'Professionisti',
    rotasTitulo: 'Percorsi',
    rotasChamada: 'Quattro percorsi che attraversano le città.',
    lugaresTitulo: 'Tutti i luoghi',
    profissionalTitulo: 'Per chi vende',
    contatos: 'Contatti degli assessorati al turismo',
    cidadesDaRota: 'Città di questo percorso',
    pontosDaRota: 'Lungo il cammino',
    navPrincipal: 'Navigazione',
    compartilhar: 'Condividi',
    linkCopiado: 'Link copiato',
    maisEm: 'Altro a',
  },
  de: {
    ouvirCidade: 'Die Stadt hören',
    ouvir: 'Hören',
    lerMais: 'Mehr lesen',
    lerMenos: 'Weniger lesen',
    outrasOito: 'Die Costa do Sol hat acht weitere Städte.',
    ordemSorteada: 'Die Reihenfolge der Städte wird bei jedem Besuch neu ausgelost.',
    receberMaterial: 'Material erhalten von',
    secretaria: 'Tourismusamt',
    osLugares: 'Die 36 Orte der Costa do Sol',
    escolhaIdioma: 'Costa do Sol',
    cidades: 'Städte',
      chamadaDaCapa: 'Zwischen Lagune und offenem Meer, an der Küste von Rio de Janeiro.',
    ouvirRegiao: 'Die Region hören',
    navCidades: 'Städte',
    navRotas: 'Routen',
    navLugares: 'Orte',
    navProfissional: 'Fachpublikum',
    rotasTitulo: 'Routen',
    rotasChamada: 'Vier Wege, die die Städte verbinden.',
    lugaresTitulo: 'Alle Orte',
    profissionalTitulo: 'Für den Vertrieb',
    contatos: 'Kontakte der Tourismusämter',
    cidadesDaRota: 'Städte dieser Route',
    pontosDaRota: 'Unterwegs',
    navPrincipal: 'Navigation',
    compartilhar: 'Teilen',
    linkCopiado: 'Link kopiert',
    maisEm: 'Mehr in',
  },
  zh: {
    ouvirCidade: '聆听这座城市',
    ouvir: '聆听',
    lerMais: '阅读更多',
    lerMenos: '收起',
    outrasOito: '太阳海岸还有另外八座城市。',
    ordemSorteada: '城市的顺序每次访问都会重新排列。',
    receberMaterial: '获取相关资料：',
    secretaria: '旅游局',
    osLugares: '太阳海岸的 36 个地方',
    escolhaIdioma: 'Costa do Sol',
    cidades: '城市',
      chamadaDaCapa: '里约热内卢海岸线上，潟湖与外海之间。',
    ouvirRegiao: '聆听这片区域',
    navCidades: '城市',
    navRotas: '路线',
    navLugares: '地点',
    navProfissional: '专业人士',
    rotasTitulo: '路线',
    rotasChamada: '四条串联各城市的路线。',
    lugaresTitulo: '所有地点',
    profissionalTitulo: '面向旅游从业者',
    contatos: '旅游局联系方式',
    cidadesDaRota: '此路线的城市',
    pontosDaRota: '沿途',
    navPrincipal: '导航',
    compartilhar: '分享',
    linkCopiado: '链接已复制',
    maisEm: '更多：',
  },
  ko: {
    ouvirCidade: '도시 듣기',
    ouvir: '듣기',
    lerMais: '더 읽기',
    lerMenos: '접기',
    outrasOito: '코스타 두 솔에는 여덟 개의 도시가 더 있습니다.',
    ordemSorteada: '도시 순서는 방문할 때마다 무작위로 정해집니다.',
    receberMaterial: '자료 받기:',
    secretaria: '관광청',
    osLugares: '코스타 두 솔의 36곳',
    escolhaIdioma: 'Costa do Sol',
    cidades: '도시',
      chamadaDaCapa: '리우데자네이루 해안, 석호와 열린 바다 사이.',
    ouvirRegiao: '지역 듣기',
    navCidades: '도시',
    navRotas: '루트',
    navLugares: '장소',
    navProfissional: '업계',
    rotasTitulo: '루트',
    rotasChamada: '도시를 잇는 네 개의 길.',
    lugaresTitulo: '모든 장소',
    profissionalTitulo: '여행 업계를 위해',
    contatos: '관광청 연락처',
    cidadesDaRota: '이 루트의 도시',
    pontosDaRota: '가는 길에',
    navPrincipal: '내비게이션',
    compartilhar: '공유',
    linkCopiado: '링크 복사됨',
    maisEm: '더 보기:',
  },
}

export function rotulos(idioma: string): Rotulos {
  return DICIONARIO[idioma] ?? (DICIONARIO['pt'] as Rotulos)
}
