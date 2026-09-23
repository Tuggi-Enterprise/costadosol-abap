/**
 * Compoe content/*.json a partir de fatos apurados em fonte oficial.
 *
 * Enquanto nao existe projeto Supabase (P-27), o conteudo e escrito aqui e versionado
 * como JSON. A tabela abaixo e a fonte: cada ponto carrega a URL oficial de onde o fato
 * saiu, e o build recusa qualquer ponto sem ela (CS-OURO-006).
 *
 * O que este arquivo NAO faz: inventar. Onde o dado nao foi apurado, o campo fica
 * pendente e aparece como pendente na tela — nunca preenchido "por enquanto".
 *
 *   npx tsx scripts/compor-conteudo.ts
 */
import { readFile, writeFile } from 'node:fs/promises'
import { MUNICIPIOS } from './content-schema.ts'

const CONSULTA = '2026-08-12'

/** Segundo levantamento: Armacao dos Buzios e os canais de rede social (CS-MUN-005). */
const CONSULTA_14_08 = '2026-08-14'

/**
 * ATENCAO: as coordenadas sao aproximadas, tiradas da localizacao geral de cada ponto.
 * Servem para posicionar marcador em mapa de regiao; NAO servem para navegacao. Antes de
 * o mapa ir ao ar, conferir uma a uma (P-28).
 */
const REVISOR = 'Levantamento em fonte oficial — revisão humana pendente (P-23)'

/** Marcador de foto que ainda nao existe. O componente Foto desenha o espaco vazio. */
const FOTO_PENDENTE = '/img/pendente'
const CREDITO_PENDENTE = 'Foto ainda não disponível'

const SETUR = (slug: string) => `https://www.turismo.rj.gov.br/destino/${slug}/`
/** Portal da Secretaria de Turismo de Armacao dos Buzios: descreve praia por praia. */
const TURISMO_BUZIOS = (caminho: string) => `https://turismo.buzios.rj.gov.br/${caminho}/`
const PREFEITURA_SAQUAREMA = 'https://www.saquarema.rj.gov.br/turismo/'
const DECRETO_PARQUE = 'https://www.saquarema.rj.gov.br/wp-content/uploads/2020/07/DECRETO-N%C2%B0-42.929-11-PCSOL.pdf'

/**
 * CS-MUN-005 — o canal de rede social de cada municipio, levantado em 14/08/2026.
 *
 * **A regra de escolha, e ela e uma so:** conta da Secretaria de Turismo quando existe;
 * conta da prefeitura quando nao existe. Oito das dez tem conta propria de turismo; Casimiro
 * de Abreu e Rio das Ostras nao, e nas duas o proprio site oficial aponta a conta da
 * prefeitura — foi de la que o perfil saiu, e nao de busca.
 *
 * **Instagram nos dez, e so ele, de proposito.** Varias das dez tambem tem Facebook, YouTube
 * ou TikTok, e a lista aceita os tres primeiros. Publicar duas redes numa cidade e uma em
 * outra faz a primeira parecer mais ativa que a segunda, que e o tipo de leitura que
 * CS-OURO-004 existe para evitar. Rede nova entra quando entrar nas dez.
 *
 * **Cuidado ao mexer:** o perfil que a busca devolve nem sempre e o que o municipio publica.
 * Rio das Ostras usa `riodasostrasgov` no Facebook e no TikTok, mas o Instagram oficial e
 * `prefeiturariodasostras`; seguir a busca teria publicado um link errado.
 */
const IG = (perfil: string) => `https://www.instagram.com/${perfil}/`

type RedeBruta = { perfil: string; dono: 'turismo' | 'prefeitura'; fonte: string }

/** Onde cada perfil foi conferido. O proprio perfil declara de quem e, no nome da conta. */
const REDES: Record<string, RedeBruta> = {
  araruama: { perfil: 'setur_araruamaoficial', dono: 'turismo', fonte: IG('setur_araruamaoficial') },
  'armacao-dos-buzios': { perfil: 'secturismobuzios', dono: 'turismo', fonte: IG('secturismobuzios') },
  'arraial-do-cabo': { perfil: 'setur.arraialdocabo', dono: 'turismo', fonte: IG('setur.arraialdocabo') },
  'cabo-frio': { perfil: 'cabofrioturismo', dono: 'turismo', fonte: IG('cabofrioturismo') },
  'casimiro-de-abreu': {
    perfil: 'prefeituradecasimirodeabreu',
    dono: 'prefeitura',
    // A propria pagina da Secretaria de Turismo e Eventos aponta esta conta, nao uma dela.
    fonte: 'https://casimirodeabreu.rj.gov.br/secretarias/turismo-e-eventos/',
  },
  'iguaba-grande': { perfil: 'secturiguabagrande', dono: 'turismo', fonte: IG('secturiguabagrande') },
  'rio-das-ostras': {
    perfil: 'prefeiturariodasostras',
    dono: 'prefeitura',
    fonte: 'https://www.riodasostras.rj.gov.br/',
  },
  'sao-pedro-da-aldeia': { perfil: 'turismosaopedrodaaldeia', dono: 'turismo', fonte: IG('turismosaopedrodaaldeia') },
  saquarema: { perfil: 'turismosaquaremarj', dono: 'turismo', fonte: IG('turismosaquaremarj') },
  'silva-jardim': { perfil: 'sec.turismosilvajardim', dono: 'turismo', fonte: IG('sec.turismosilvajardim') },
}

type Texto3 = { pt: string; en: string; es: string }
type PontoBruto = {
  id: string
  foto: string
  tipo: 'essencial' | 'complementar' | 'inesperado'
  categoria: 'natureza' | 'historia' | 'cultura' | 'gastronomia' | 'esporte'
  coords: [number, number]
  nome: Texto3
  teaser: Texto3
  texto: Texto3
  afirmacao: string
  fonte: string
  /** Só onde a consulta não foi na data do levantamento original (CONSULTA). */
  consultado_em?: string
}
type MunicipioBruto = { slug: string; linha: Texto3; foto: string; secretaria: string; pontos: PontoBruto[] }

const DADOS: MunicipioBruto[] = [
  {
    slug: 'araruama',
    foto: 'img/mun/araruama',
    secretaria: SETUR('araruama'),
    linha: {
      pt: 'A cidade que vive na margem da maior lagoa de água salgada da América Latina.',
      en: 'The city on the shore of the largest saltwater lagoon in Latin America.',
      es: 'La ciudad a orillas de la mayor laguna de agua salada de América Latina.',
    },
    pontos: [
      {
        id: 'araruama-lagoa', foto: 'img/poi/araruama-lagoa', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.8708, -42.3419],
        nome: { pt: 'Lagoa de Araruama', en: 'Araruama Lagoon', es: 'Laguna de Araruama' },
        teaser: {
          pt: 'Água morna e transparente, e uma das melhores raias de vento do país para kitesurf e windsurf.',
          en: 'Warm, clear water and one of the country’s best wind corridors for kitesurfing and windsurfing.',
          es: 'Agua templada y transparente, y uno de los mejores corredores de viento del país para kitesurf y windsurf.',
        },
        texto: {
          pt: 'A lagoa banha sete municípios e é procurada por praticantes de kitesurf, windsurf e jet-ski. As praias de água salgada têm ondas curtas e fundo raso por centenas de metros.',
          en: 'The lagoon borders seven municipalities and draws kitesurfers, windsurfers and jet-ski riders. Its saltwater beaches have short waves and a shallow bottom for hundreds of metres.',
          es: 'La laguna baña siete municipios y atrae a practicantes de kitesurf, windsurf y jet-ski. Sus playas de agua salada tienen olas cortas y fondo bajo por cientos de metros.',
        },
        afirmacao: 'A Lagoa de Araruama é considerada uma das melhores raias de vento do país para kitesurf e windsurf.',
        fonte: SETUR('araruama'),
      },
      {
        id: 'araruama-praia-seca', foto: 'img/poi/araruama-praia-seca', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.9333, -42.2833],
        nome: { pt: 'Praia Seca', en: 'Praia Seca', es: 'Praia Seca' },
        teaser: {
          pt: 'O distrito onde a lagoa e o oceano correm lado a lado, separados por uma faixa estreita de restinga.',
          en: 'The district where lagoon and ocean run side by side, split by a narrow strip of sandbank.',
          es: 'El distrito donde laguna y océano corren lado a lado, separados por una franja de restinga.',
        },
        texto: {
          pt: 'Praia Seca fica entre a Lagoa de Araruama e o mar aberto. De um lado, água parada e morna. Do outro, arrebentação.',
          en: 'Praia Seca sits between the Araruama Lagoon and the open sea. Still, warm water on one side. Surf on the other.',
          es: 'Praia Seca está entre la Laguna de Araruama y el mar abierto. De un lado, agua quieta y templada. Del otro, rompiente.',
        },
        afirmacao: 'Praia Seca é distrito de Araruama, situado entre a Lagoa de Araruama e o oceano.',
        fonte: SETUR('araruama'),
      },
      {
        id: 'araruama-massambaba', foto: 'img/poi/araruama-massambaba', tipo: 'inesperado', categoria: 'natureza',
        coords: [-22.9236, -42.2361],
        nome: { pt: 'Restinga de Massambaba', en: 'Massambaba Sandbank', es: 'Restinga de Massambaba' },
        teaser: {
          pt: 'Parte do Parque Estadual da Costa do Sol, criado em 2011 com 9.790 hectares em seis municípios.',
          en: 'Part of Costa do Sol State Park, created in 2011 with 9,790 hectares across six municipalities.',
          es: 'Parte del Parque Estadual da Costa do Sol, creado en 2011 con 9.790 hectáreas en seis municipios.',
        },
        texto: {
          pt: 'A restinga separa a Lagoa de Araruama do oceano por dezenas de quilômetros. Mais da metade do Parque Estadual da Costa do Sol está na Área de Proteção Ambiental de Massambaba.',
          en: 'The sandbank separates the lagoon from the ocean for dozens of kilometres. More than half of Costa do Sol State Park lies within the Massambaba protected area.',
          es: 'La restinga separa la laguna del océano por decenas de kilómetros. Más de la mitad del Parque Estadual da Costa do Sol está en el área de protección ambiental de Massambaba.',
        },
        afirmacao: 'O Parque Estadual da Costa do Sol foi criado pelo Decreto Estadual 42.929, de 18 de abril de 2011, com 9.790,44 hectares.',
        fonte: DECRETO_PARQUE,
      },
      {
        id: 'araruama-juturnaiba', foto: 'img/poi/araruama-juturnaiba', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.6167, -42.3167],
        nome: { pt: 'Lagoa de Juturnaíba', en: 'Juturnaíba Lagoon', es: 'Laguna de Juturnaíba' },
        teaser: {
          pt: 'A única lagoa de água doce da região, dividida com Silva Jardim e Casimiro de Abreu.',
          en: 'The region’s only freshwater lagoon, shared with Silva Jardim and Casimiro de Abreu.',
          es: 'La única laguna de agua dulce de la región, compartida con Silva Jardim y Casimiro de Abreu.',
        },
        texto: {
          pt: 'Juturnaíba abastece de água boa parte da região e contrasta com as lagoas salgadas do litoral.',
          en: 'Juturnaíba supplies water to much of the region and stands in contrast to the saltwater lagoons on the coast.',
          es: 'Juturnaíba abastece de agua a buena parte de la región y contrasta con las lagunas saladas del litoral.',
        },
        afirmacao: 'A Lagoa de Juturnaíba é a única lagoa de água doce da região.',
        fonte: SETUR('araruama'),
      },
    ],
  },
  {
    // Armacao dos Buzios entrou em 14/08/2026, quando P-29 fechou pela opcao 2. Os quatro
    // pontos saem do portal da propria Secretaria de Turismo do municipio, que descreve
    // praia por praia; a pagina da Setur-RJ, fonte dos outros nove, so cita as 23 praias.
    slug: 'armacao-dos-buzios',
    foto: 'img/mun/armacao-dos-buzios',
    secretaria: SETUR('armacao-dos-buzios'),
    linha: {
      pt: 'Vinte e três praias ao redor de uma península só.',
      en: 'Twenty-three beaches around a single peninsula.',
      es: 'Veintitrés playas alrededor de una sola península.',
    },
    pontos: [
      {
        id: 'buzios-orla-bardot', foto: 'img/poi/buzios-orla-bardot', tipo: 'essencial', categoria: 'historia',
        coords: [-22.7476, -41.8817],
        nome: { pt: 'Orla Brigitte Bardot', en: 'Brigitte Bardot Boardwalk', es: 'Paseo Brigitte Bardot' },
        teaser: {
          pt: 'Quatrocentos metros de calçada à beira da Praia da Armação, com três esculturas de bronze.',
          en: 'Four hundred metres of walkway along Praia da Armação, with three bronze sculptures.',
          es: 'Cuatrocientos metros de paseo junto a la Praia da Armação, con tres esculturas de bronce.',
        },
        texto: {
          pt: 'As esculturas homenageiam Brigitte Bardot, os pescadores e Juscelino Kubitschek. No mesmo trecho ficam o Píer do Centro, de onde saem os passeios de barco, e o Píer dos Pescadores, ainda usado por famílias de pescadores.',
          en: 'The sculptures honour Brigitte Bardot, the local fishermen and Juscelino Kubitschek. The same stretch holds the Centro pier, where boat tours depart, and the fishermen’s pier, still used by fishing families today.',
          es: 'Las esculturas homenajean a Brigitte Bardot, a los pescadores y a Juscelino Kubitschek. En el mismo tramo están el muelle del Centro, de donde salen los paseos en barco, y el muelle de los pescadores, todavía usado por familias de pescadores.',
        },
        afirmacao: 'A Praia da Armação tem 400 metros, margeia a Orla Bardot e reúne três esculturas de bronze em homenagem a Brigitte Bardot, aos pescadores e a Juscelino Kubitschek; no trecho ficam o Píer do Centro e o Píer dos Pescadores.',
        fonte: TURISMO_BUZIOS('praias/praia-da-armacao'),
        consultado_em: CONSULTA_14_08,
      },
      {
        id: 'buzios-ferradura', foto: 'img/poi/buzios-ferradura', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.7614, -41.8797],
        nome: { pt: 'Praia da Ferradura', en: 'Ferradura Beach', es: 'Playa de Ferradura' },
        teaser: {
          pt: 'Um quilômetro e meio de areia clara numa enseada fechada em forma de ferradura.',
          en: 'A kilometre and a half of pale sand in a cove closed into a horseshoe shape.',
          es: 'Un kilómetro y medio de arena clara en una ensenada cerrada en forma de herradura.',
        },
        texto: {
          pt: 'O formato da enseada protege a praia dos ventos e das correntes marítimas, e é o que a torna procurada por quem viaja com crianças. A água calma e fria recebe mergulho, caiaque, pedalinho e wakeboard.',
          en: 'The shape of the cove shelters the beach from wind and sea currents, which is what makes it a favourite for families with children. The calm, cold water is used for diving, kayaking, pedal boats and wakeboarding.',
          es: 'La forma de la ensenada protege la playa del viento y de las corrientes marinas, y es lo que la hace buscada por quienes van con niños. El agua tranquila y fría recibe buceo, kayak, hidropedales y wakeboard.',
        },
        afirmacao: 'A Praia da Ferradura tem 1,5 km de extensão, é protegida dos ventos e das correntes marítimas e recebe esportes náuticos como wake-board, mergulho, pedalinho e caiaque.',
        fonte: TURISMO_BUZIOS('praias/praia-da-ferradura'),
        consultado_em: CONSULTA_14_08,
      },
      {
        id: 'buzios-geriba', foto: 'img/poi/buzios-geriba', tipo: 'essencial', categoria: 'esporte',
        coords: [-22.7719, -41.9086],
        nome: { pt: 'Praia de Geribá', en: 'Geribá Beach', es: 'Playa de Geribá' },
        teaser: {
          pt: 'Quase dois quilômetros de areia fina e branca, com água agitada: é a praia do surfe.',
          en: 'Almost two kilometres of fine white sand and rough water: this is the surfing beach.',
          es: 'Casi dos kilómetros de arena fina y blanca, con agua agitada: es la playa del surf.',
        },
        texto: {
          pt: 'No canto direito fica a Ponta do Marisco, cujas rochas têm mais de dois bilhões de anos e registram a abertura do oceano Atlântico, quando a América se separou da África. O lado esquerdo tem espaço delimitado para esportes na areia.',
          en: 'At the right end sits Ponta do Marisco, whose rocks are more than two billion years old and record the opening of the Atlantic Ocean, when America split from Africa. The left end has an area set aside for beach sports.',
          es: 'En el extremo derecho está la Ponta do Marisco, cuyas rocas tienen más de dos mil millones de años y registran la apertura del océano Atlántico, cuando América se separó de África. El lado izquierdo tiene un espacio delimitado para deportes en la arena.',
        },
        afirmacao: 'A Praia de Geribá tem quase 2 km de extensão e é ideal para a prática de surf; na Ponta do Marisco, no canto direito, há rochas com mais de dois bilhões de anos que evidenciam a abertura do oceano Atlântico e a separação entre o continente americano e o africano.',
        fonte: TURISMO_BUZIOS('praias/praia-de-geriba'),
        consultado_em: CONSULTA_14_08,
      },
      {
        id: 'buzios-rua-das-pedras', foto: 'img/poi/buzios-rua-das-pedras', tipo: 'inesperado', categoria: 'cultura',
        coords: [-22.748, -41.8829],
        nome: { pt: 'Rua das Pedras', en: 'Rua das Pedras', es: 'Rua das Pedras' },
        teaser: {
          pt: 'A rua do centro é calçada com pedra tirada da Ponta do Marisco, no canto de Geribá.',
          en: 'The street in the town centre is paved with stone quarried at Ponta do Marisco, off Geribá.',
          es: 'La calle del centro está pavimentada con piedra sacada de la Ponta do Marisco, junto a Geribá.',
        },
        texto: {
          pt: 'A pedreira que existiu na Ponta do Marisco forneceu as pedras que dão nome à rua. Hoje ela concentra lojas, bares e restaurantes, e é onde a cidade se encontra depois que o sol se põe.',
          en: 'The quarry that once operated at Ponta do Marisco supplied the stones that give the street its name. Today it gathers shops, bars and restaurants, and it is where the town meets once the sun goes down.',
          es: 'La cantera que existió en la Ponta do Marisco proveyó las piedras que dan nombre a la calle. Hoy reúne tiendas, bares y restaurantes, y es donde la ciudad se encuentra después de la puesta del sol.',
        },
        afirmacao: 'As pedras da Rua das Pedras vieram da pedreira que existiu na Ponta do Marisco, no canto direito da Praia de Geribá.',
        fonte: TURISMO_BUZIOS('praias/praia-de-geriba'),
        consultado_em: CONSULTA_14_08,
      },
    ],
  },
  {
    slug: 'arraial-do-cabo',
    foto: 'img/mun/arraial-do-cabo',
    secretaria: SETUR('arraial-do-cabo'),
    linha: {
      pt: 'Cerca de 30 pontos de mergulho a poucos minutos do porto.',
      en: 'Around 30 dive sites, minutes from the harbour.',
      es: 'Cerca de 30 puntos de buceo a pocos minutos del puerto.',
    },
    pontos: [
      {
        id: 'arraial-prainhas', foto: 'img/poi/arraial-prainhas', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.9833, -42.0167],
        nome: { pt: 'Prainhas do Pontal do Atalaia', en: 'Prainhas do Pontal do Atalaia', es: 'Prainhas do Pontal do Atalaia' },
        teaser: {
          pt: 'Duas enseadas de areia branca no núcleo Atalaia do Parque Estadual da Costa do Sol.',
          en: 'Two white-sand coves inside the Atalaia sector of Costa do Sol State Park.',
          es: 'Dos ensenadas de arena blanca en el sector Atalaia del Parque Estadual da Costa do Sol.',
        },
        texto: {
          pt: 'O acesso é por escada, a partir do mirante do Pontal do Atalaia. A área integra o Parque Estadual da Costa do Sol.',
          en: 'Access is by staircase from the Pontal do Atalaia lookout. The area is part of Costa do Sol State Park.',
          es: 'El acceso es por escalera desde el mirador de Pontal do Atalaia. El área integra el Parque Estadual da Costa do Sol.',
        },
        afirmacao: 'As Prainhas do Pontal do Atalaia estão entre as atrações listadas pela Setur-RJ para Arraial do Cabo.',
        fonte: SETUR('arraial-do-cabo'),
      },
      {
        id: 'arraial-farol', foto: 'img/poi/arraial-farol', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.9975, -41.9908],
        nome: { pt: 'Praia do Farol', en: 'Praia do Farol', es: 'Praia do Farol' },
        teaser: {
          pt: 'Na Ilha do Cabo Frio, com acesso só por embarcação autorizada e tempo de permanência controlado.',
          en: 'On Cabo Frio Island, reachable only by authorised boat, with a controlled time ashore.',
          es: 'En la Isla de Cabo Frio, solo con embarcación autorizada y tiempo de permanencia controlado.',
        },
        texto: {
          pt: 'A ilha é área militar e o desembarque é regulado. As águas transparentes são o motivo pelo qual a cidade é conhecida pelo mergulho.',
          en: 'The island is military ground and landing is regulated. Its transparent water is why the town is known for diving.',
          es: 'La isla es área militar y el desembarco está regulado. Sus aguas transparentes explican la fama de buceo de la ciudad.',
        },
        afirmacao: 'A Praia do Farol fica na Ilha do Cabo Frio e é citada pela Setur-RJ entre as praias de Arraial do Cabo.',
        fonte: SETUR('arraial-do-cabo'),
      },
      {
        id: 'arraial-anjos', foto: 'img/poi/arraial-anjos', tipo: 'complementar', categoria: 'historia',
        coords: [-22.9714, -42.0203],
        nome: { pt: 'Praia dos Anjos', en: 'Praia dos Anjos', es: 'Praia dos Anjos' },
        teaser: {
          pt: 'De onde saem os barcos, e onde fica o Museu Oceanográfico da cidade.',
          en: 'Where the boats leave from, and home to the town’s Oceanographic Museum.',
          es: 'De donde salen los barcos y donde está el Museo Oceanográfico.',
        },
        texto: {
          pt: 'A enseada abriga o porto de onde partem os passeios de barco e o Museu Oceanográfico.',
          en: 'The cove holds the harbour where the boat trips leave from, and the Oceanographic Museum.',
          es: 'La ensenada alberga el puerto de donde salen los paseos en barco y el Museo Oceanográfico.',
        },
        afirmacao: 'A Praia dos Anjos e o Museu Oceanográfico constam da lista oficial de atrações de Arraial do Cabo.',
        fonte: SETUR('arraial-do-cabo'),
      },
      {
        id: 'arraial-forno', foto: 'img/poi/arraial-forno', tipo: 'inesperado', categoria: 'natureza',
        coords: [-22.9722, -42.0083],
        nome: { pt: 'Praia do Forno', en: 'Praia do Forno', es: 'Praia do Forno' },
        teaser: {
          pt: 'Só se chega a pé, por trilha, ou de barco. Não há estrada até a areia.',
          en: 'You get there on foot or by boat. No road reaches the sand.',
          es: 'Se llega a pie o en barco. No hay carretera hasta la arena.',
        },
        texto: {
          pt: 'A trilha parte da Praia dos Anjos. A enseada é fechada por costões dos dois lados.',
          en: 'The trail starts at Anjos Beach. The cove is closed off by rocky outcrops on both sides.',
          es: 'El sendero parte de la Praia dos Anjos. La ensenada está cerrada por peñascos a ambos lados.',
        },
        afirmacao: 'Para chegar à Praia do Forno é necessário fazer uma trilha ou pegar um barco.',
        fonte: SETUR('arraial-do-cabo'),
      },
    ],
  },
  {
    slug: 'cabo-frio',
    foto: 'img/mun/cabo-frio',
    secretaria: SETUR('cabo-frio'),
    linha: {
      pt: 'Areia branca e fina de um lado, o monumento histórico mais antigo da região do outro.',
      en: 'Fine white sand on one side, the region’s oldest historic monument on the other.',
      es: 'Arena blanca y fina de un lado, el monumento histórico más antiguo de la región del otro.',
    },
    pontos: [
      {
        id: 'cabo-frio-praia-do-forte', foto: 'img/poi/cabo-frio-praia-do-forte', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.8894, -42.0197],
        nome: { pt: 'Praia do Forte', en: 'Praia do Forte', es: 'Praia do Forte' },
        teaser: {
          pt: 'Sete quilômetros de areia fina e branca, do Canto do Forte às dunas.',
          en: 'Seven kilometres of fine white sand, from Canto do Forte to the dunes.',
          es: 'Siete kilómetros de arena fina y blanca, del Canto do Forte a las dunas.',
        },
        texto: {
          pt: 'É a praia urbana da cidade, com o Forte São Mateus em uma ponta e o campo de dunas na outra.',
          en: 'This is the town’s urban beach, with Forte São Mateus at one end and the dune field at the other.',
          es: 'Es la playa urbana de la ciudad, con el Forte São Mateus en un extremo y las dunas en el otro.',
        },
        afirmacao: 'A Praia do Forte possui areias finas e brancas.',
        fonte: SETUR('cabo-frio'),
      },
      {
        id: 'cabo-frio-forte', foto: 'img/poi/cabo-frio-forte', tipo: 'essencial', categoria: 'historia',
        coords: [-22.8869, -42.0119],
        nome: { pt: 'Forte São Mateus', en: 'São Mateus Fort', es: 'Fuerte São Mateus' },
        teaser: {
          pt: 'O monumento histórico mais antigo da região, sobre a rocha na entrada do canal.',
          en: 'The region’s oldest historic monument, set on the rock at the mouth of the channel.',
          es: 'El monumento histórico más antiguo de la región, sobre la roca en la entrada del canal.',
        },
        texto: {
          pt: 'O forte guarda a entrada do Canal do Itajuru, por onde o mar entra e alimenta a Lagoa de Araruama.',
          en: 'The fort guards the mouth of the Itajuru Channel, through which the sea feeds the Araruama Lagoon.',
          es: 'El fuerte vigila la entrada del Canal do Itajuru, por donde el mar alimenta la Laguna de Araruama.',
        },
        afirmacao: 'O Forte São Mateus é o monumento histórico mais antigo da região.',
        fonte: SETUR('cabo-frio'),
      },
      {
        id: 'cabo-frio-pero', foto: 'img/poi/cabo-frio-pero', tipo: 'complementar', categoria: 'esporte',
        coords: [-22.8419, -41.9636],
        nome: { pt: 'Praia do Peró', en: 'Peró Beach', es: 'Playa de Peró' },
        teaser: {
          pt: 'Praia oceânica com certificação Bandeira Azul e campo de dunas aberto ao vento.',
          en: 'Ocean beach with Blue Flag certification and a dune field open to the wind.',
          es: 'Playa oceánica con certificación Bandera Azul y campo de dunas abierto al viento.',
        },
        texto: {
          pt: 'O Peró tem mar aberto e vento constante, procurado por quem pratica esportes de prancha.',
          en: 'Peró has open sea and steady wind, sought out by board-sport riders.',
          es: 'Peró tiene mar abierto y viento constante, buscado por quienes practican deportes de tabla.',
        },
        afirmacao: 'A Praia do Peró tem certificação Bandeira Azul, segundo a Setur-RJ.',
        fonte: SETUR('cabo-frio'),
      },
      {
        id: 'cabo-frio-itajuru', foto: 'img/poi/cabo-frio-itajuru', tipo: 'inesperado', categoria: 'cultura',
        coords: [-22.8842, -42.0206],
        nome: { pt: 'Canal do Itajuru', en: 'Itajuru Channel', es: 'Canal do Itajuru' },
        teaser: {
          pt: 'O canal que liga o oceano à lagoa, com o Boulevard Canal na margem urbana.',
          en: 'The channel linking ocean to lagoon, with the Boulevard Canal along the town side.',
          es: 'El canal que une océano y laguna, con el Boulevard Canal en la orilla urbana.',
        },
        texto: {
          pt: 'É por este canal estreito que a água do mar entra e mantém a salinidade da Lagoa de Araruama.',
          en: 'It is through this narrow channel that seawater enters and keeps the Araruama Lagoon salty.',
          es: 'Por este canal estrecho entra el agua de mar que mantiene la salinidad de la laguna.',
        },
        afirmacao: 'O Canal do Itajuru, a Ponte Feliciano Sodré e o Boulevard Canal constam da lista oficial de atrações de Cabo Frio.',
        fonte: SETUR('cabo-frio'),
      },
    ],
  },
  {
    slug: 'casimiro-de-abreu',
    foto: 'img/mun/casimiro-de-abreu',
    secretaria: SETUR('casimiro-de-abreu'),
    linha: {
      pt: 'Um vulcão extinto de 800 metros, dois rios e o nome de um poeta.',
      en: 'An extinct volcano 800 metres high, two rivers and a poet’s name.',
      es: 'Un volcán extinto de 800 metros, dos ríos y el nombre de un poeta.',
    },
    pontos: [
      {
        id: 'casimiro-morro-sao-joao', foto: 'img/poi/casimiro-morro-sao-joao', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.5433, -41.9975],
        nome: { pt: 'Morro de São João', en: 'Morro de São João', es: 'Morro de São João' },
        teaser: {
          pt: 'Vulcão extinto de 800 metros de altura, visível de quase toda a região.',
          en: 'An extinct volcano 800 metres high, visible from almost anywhere in the region.',
          es: 'Volcán extinto de 800 metros de altura, visible desde casi toda la región.',
        },
        texto: {
          pt: 'O morro é um vulcão extinto e domina a paisagem entre Casimiro de Abreu e o litoral.',
          en: 'The hill is an extinct volcano and dominates the landscape between Casimiro de Abreu and the coast.',
          es: 'El morro es un volcán extinto y domina el paisaje entre Casimiro de Abreu y el litoral.',
        },
        afirmacao: 'O Morro de São João é um vulcão extinto com 800 metros de altura.',
        fonte: SETUR('casimiro-de-abreu'),
      },
      {
        id: 'casimiro-rio-macae', foto: 'img/poi/casimiro-rio-macae', tipo: 'complementar', categoria: 'esporte',
        coords: [-22.4833, -42.2],
        nome: { pt: 'Rio Macaé', en: 'Macaé River', es: 'Río Macaé' },
        teaser: {
          pt: 'Quedas d’água e corredeiras. É o trecho onde se pratica rafting na região.',
          en: 'Waterfalls and rapids. This is the stretch where rafting happens in the region.',
          es: 'Cascadas y rápidos. Es el tramo donde se practica rafting en la región.',
        },
        texto: {
          pt: 'O rio tem grande número de quedas d’água e corredeiras, e é onde a região oferece rafting.',
          en: 'The river has a large number of waterfalls and rapids, and is where the region offers rafting.',
          es: 'El río tiene gran número de cascadas y rápidos, y es donde la región ofrece rafting.',
        },
        afirmacao: 'O Rio Macaé apresenta grande número de quedas d’água e corredeiras, próprias para rafting.',
        fonte: SETUR('casimiro-de-abreu'),
      },
      {
        id: 'casimiro-barra-de-sao-joao', foto: 'img/poi/casimiro-barra-de-sao-joao', tipo: 'essencial', categoria: 'historia',
        coords: [-22.5906, -41.9875],
        nome: { pt: 'Barra de São João', en: 'Barra de São João', es: 'Barra de São João' },
        teaser: {
          pt: 'Vila de pescadores na foz do rio, com capela cuja construção data da primeira metade do século XVII.',
          en: 'Fishing village at the river mouth, with a chapel built in the first half of the 17th century.',
          es: 'Villa de pescadores en la desembocadura, con capilla construida en la primera mitad del siglo XVII.',
        },
        texto: {
          pt: 'A capela de São João é do século XVII. A vila fica onde o Rio São João encontra o mar.',
          en: 'The chapel of São João dates from the 17th century. The village sits where the São João River meets the sea.',
          es: 'La capilla de São João es del siglo XVII. La villa está donde el río São João encuentra el mar.',
        },
        afirmacao: 'A construção da Capela de São João data da primeira metade do século XVII.',
        fonte: SETUR('casimiro-de-abreu'),
      },
      {
        id: 'casimiro-museu', foto: 'img/poi/casimiro-museu', tipo: 'inesperado', categoria: 'cultura',
        coords: [-22.4794, -42.2019],
        nome: { pt: 'Memória do poeta Casimiro de Abreu', en: 'Memory of the poet Casimiro de Abreu', es: 'Memoria del poeta Casimiro de Abreu' },
        teaser: {
          pt: 'A cidade leva o nome de um dos principais representantes do romantismo brasileiro.',
          en: 'The town is named after a leading figure of Brazilian Romanticism.',
          es: 'La ciudad lleva el nombre de una figura central del romanticismo brasileño.',
        },
        texto: {
          pt: 'O nome da cidade homenageia o poeta Casimiro José Marques de Abreu, com memória preservada em museu.',
          en: 'The town’s name honours the poet Casimiro José Marques de Abreu, remembered in a local museum.',
          es: 'El nombre de la ciudad honra al poeta Casimiro José Marques de Abreu, recordado en un museo local.',
        },
        afirmacao: 'A cidade homenageia o poeta Casimiro José Marques de Abreu, com memória preservada por meio de um museu.',
        fonte: SETUR('casimiro-de-abreu'),
      },
    ],
  },
  {
    slug: 'iguaba-grande',
    foto: 'img/mun/iguaba-grande',
    secretaria: SETUR('iguaba-grande'),
    linha: {
      pt: 'Cinco trilhas, uma serra e a pedra onde se salgava o peixe antes de existir geladeira.',
      en: 'Five trails, a mountain range, and the rock where fish was salted before there were fridges.',
      es: 'Cinco senderos, una sierra y la piedra donde se salaba el pescado antes de que hubiera neveras.',
    },
    pontos: [
      {
        id: 'iguaba-lagoa', foto: 'img/poi/iguaba-lagoa', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.8394, -42.2286],
        nome: { pt: 'A lagoa em Iguaba', en: 'The lagoon at Iguaba', es: 'La laguna en Iguaba' },
        teaser: {
          pt: 'Águas calmas na margem norte da maior lagoa de água salgada da América Latina.',
          en: 'Calm water on the northern shore of the largest saltwater lagoon in Latin America.',
          es: 'Aguas calmas en la orilla norte de la mayor laguna de agua salada de América Latina.',
        },
        texto: {
          pt: 'A Setur-RJ descreve a Lagoa de Araruama como a maior lagoa de água salgada da América Latina, com cerca de 200 km de perímetro.',
          en: 'Setur-RJ describes the Araruama Lagoon as the largest saltwater lagoon in Latin America, about 200 km around.',
          es: 'Setur-RJ describe la Laguna de Araruama como la mayor laguna de agua salada de América Latina, con unos 200 km de perímetro.',
        },
        afirmacao: 'A Lagoa de Araruama é descrita pela Setur-RJ como a maior lagoa de água salgada da América Latina.',
        fonte: SETUR('iguaba-grande'),
      },
      {
        id: 'iguaba-pedra-da-salga', foto: 'img/poi/iguaba-pedra-da-salga', tipo: 'inesperado', categoria: 'historia',
        coords: [-22.8342, -42.2244],
        nome: { pt: 'Pedra da Salga', en: 'Pedra da Salga', es: 'Pedra da Salga' },
        teaser: {
          pt: 'Salina natural onde o peixe era limpo, secado e salgado. É o motivo de a cidade estar onde está.',
          en: 'A natural salt works where fish was cleaned, dried and salted. It is why the town grew where it did.',
          es: 'Salina natural donde el pescado se limpiaba, secaba y salaba. Es la razón de que la ciudad esté donde está.',
        },
        texto: {
          pt: 'A pedra serviu como salina natural e área de limpeza, secagem e salga do pescado.',
          en: 'The rock served as a natural salt works and an area for cleaning, drying and salting fish.',
          es: 'La piedra sirvió como salina natural y área de limpieza, secado y salado del pescado.',
        },
        afirmacao: 'A Pedra da Salga serviu como salina natural e área para limpeza, secagem e salga do pescado.',
        fonte: SETUR('iguaba-grande'),
      },
      {
        id: 'iguaba-sapeatiba', foto: 'img/poi/iguaba-sapeatiba', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.8106, -42.2664],
        nome: { pt: 'Serra de Sapeatiba', en: 'Sapeatiba Range', es: 'Sierra de Sapeatiba' },
        teaser: {
          pt: 'Trilha que sobe a 350 metros de altitude, com vista para toda a lagoa.',
          en: 'A trail climbing to 350 metres, overlooking the whole lagoon.',
          es: 'Sendero que sube a 350 metros de altitud, con vista de toda la laguna.',
        },
        texto: {
          pt: 'É a mais alta das cinco trilhas do município.',
          en: 'It is the highest of the five trails in the municipality.',
          es: 'Es el más alto de los cinco senderos del municipio.',
        },
        afirmacao: 'A Serra de Sapeatiba alcança 350 metros de altitude e integra as trilhas listadas pela Setur-RJ em Iguaba Grande.',
        fonte: SETUR('iguaba-grande'),
      },
      {
        id: 'iguaba-santa-rita', foto: 'img/poi/iguaba-santa-rita', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.8447, -42.2119],
        nome: { pt: 'Ilha de Santa Rita', en: 'Santa Rita Island', es: 'Isla de Santa Rita' },
        teaser: {
          pt: 'Ilha dentro da lagoa, ponto de onde se vê o pôr do sol no verão.',
          en: 'An island inside the lagoon, and where the summer sunset is watched.',
          es: 'Isla dentro de la laguna, punto desde donde se ve la puesta de sol en verano.',
        },
        texto: {
          pt: 'A ilha fica dentro da Lagoa de Araruama, e é conhecida pelo pôr do sol de verão.',
          en: 'The island lies inside the Araruama Lagoon, and is known for its summer sunset.',
          es: 'La isla está dentro de la Laguna de Araruama, y es conocida por su atardecer de verano.',
        },
        afirmacao: 'A Ilha de Santa Rita consta da lista oficial de atrações de Iguaba Grande, com destaque para o pôr do sol no verão.',
        fonte: SETUR('iguaba-grande'),
      },
    ],
  },
  {
    slug: 'rio-das-ostras',
    foto: 'img/mun/rio-das-ostras',
    secretaria: SETUR('rio-das-ostras'),
    linha: {
      pt: 'Vinte e oito quilômetros de costa, quinze praias e um festival de jazz e blues.',
      en: 'Twenty-eight kilometres of coast, fifteen beaches and a jazz and blues festival.',
      es: 'Veintiocho kilómetros de costa, quince playas y un festival de jazz y blues.',
    },
    pontos: [
      {
        id: 'ostras-praca-da-baleia', foto: 'img/poi/ostras-praca-da-baleia', tipo: 'essencial', categoria: 'cultura',
        coords: [-22.5272, -41.9453],
        nome: { pt: 'Praça da Baleia', en: 'Praça da Baleia', es: 'Praça da Baleia' },
        teaser: {
          pt: 'Escultura de baleia-jubarte de 20 metros sobre uma estrutura metálica revestida de bronze.',
          en: 'A 20-metre humpback whale sculpture on a metal frame clad in bronze.',
          es: 'Escultura de ballena jorobada de 20 metros sobre una estructura metálica revestida de bronce.',
        },
        texto: {
          pt: 'A Setur-RJ registra a obra como a maior homenagem a um cetáceo no mundo.',
          en: 'Setur-RJ records the work as the largest tribute to a cetacean in the world.',
          es: 'Setur-RJ registra la obra como el mayor homenaje a un cetáceo del mundo.',
        },
        afirmacao: 'A escultura da Praça da Baleia tem 20 metros e é descrita pela Setur-RJ como a maior homenagem a um cetáceo do mundo.',
        fonte: SETUR('rio-das-ostras'),
      },
      {
        id: 'ostras-costazul', foto: 'img/poi/ostras-costazul', tipo: 'essencial', categoria: 'esporte',
        coords: [-22.5347, -41.9294],
        nome: { pt: 'Praia de Costazul', en: 'Costazul Beach', es: 'Playa de Costazul' },
        teaser: {
          pt: 'Praia oceânica de 2,3 quilômetros, frequentada por surfistas e pescadores.',
          en: 'A 2.3-kilometre ocean beach, used by surfers and fishermen.',
          es: 'Playa oceánica de 2,3 kilómetros, frecuentada por surfistas y pescadores.',
        },
        texto: {
          pt: 'Costazul é a maior praia oceânica da cidade e tem píer próprio.',
          en: 'Costazul is the town’s longest ocean beach and has its own pier.',
          es: 'Costazul es la mayor playa oceánica de la ciudad y tiene su propio muelle.',
        },
        afirmacao: 'A Praia de Costazul tem 2,3 km de extensão e é frequentada por surfistas e praticantes de pesca.',
        fonte: SETUR('rio-das-ostras'),
      },
      {
        id: 'ostras-pier', foto: 'img/poi/ostras-pier', tipo: 'complementar', categoria: 'cultura',
        coords: [-22.5361, -41.9269],
        nome: { pt: 'Píer de Costazul', en: 'Costazul Pier', es: 'Muelle de Costazul' },
        teaser: {
          pt: 'Estrutura sobre o mar na ponta da praia, ponto de pesca e de vista.',
          en: 'A structure over the sea at the end of the beach, for fishing and for the view.',
          es: 'Estructura sobre el mar al final de la playa, punto de pesca y de vista.',
        },
        texto: {
          pt: 'O píer avança sobre o mar no fim de Costazul, a maior praia oceânica da cidade.',
          en: 'The pier reaches out over the sea at the end of Costazul, the town’s longest ocean beach.',
          es: 'El muelle se adentra en el mar al final de Costazul, la mayor playa oceánica de la ciudad.',
        },
        afirmacao: 'O Píer de Costazul consta da lista oficial de atrações de Rio das Ostras.',
        fonte: SETUR('rio-das-ostras'),
      },
      {
        id: 'ostras-costoes', foto: 'img/poi/ostras-costoes', tipo: 'inesperado', categoria: 'natureza',
        coords: [-22.5219, -41.9481],
        nome: { pt: 'Monumento dos Costões Rochosos', en: 'Monumento dos Costões Rochosos', es: 'Monumento dos Costões Rochosos' },
        teaser: {
          pt: 'Marco dedicado às formações de pedra que separam uma praia da outra ao longo da costa.',
          en: 'A marker dedicated to the rock formations that separate one beach from the next along the coast.',
          es: 'Marco dedicado a las formaciones rocosas que separan una playa de otra a lo largo de la costa.',
        },
        texto: {
          pt: 'Os costões dividem as quinze praias da cidade e dão a elas águas calmas.',
          en: 'The outcrops divide the town’s fifteen beaches and give them calm water.',
          es: 'Los peñascos dividen las quince playas de la ciudad y les dan aguas calmas.',
        },
        afirmacao: 'Rio das Ostras tem 28 km de litoral e 15 praias, com o Monumento dos Costões Rochosos entre suas atrações.',
        fonte: SETUR('rio-das-ostras'),
      },
    ],
  },
  {
    slug: 'sao-pedro-da-aldeia',
    foto: 'img/mun/sao-pedro-da-aldeia',
    secretaria: SETUR('sao-pedro-da-aldeia'),
    linha: {
      pt: 'Uma igreja de 1783, uma casa feita de cacos e o vento que traz os veleiros.',
      en: 'A church from 1783, a house built from broken pieces, and the wind that brings the sailboats.',
      es: 'Una iglesia de 1783, una casa hecha de fragmentos y el viento que trae los veleros.',
    },
    pontos: [
      {
        id: 'aldeia-casa-da-flor', foto: 'img/poi/aldeia-casa-da-flor', tipo: 'inesperado', categoria: 'cultura',
        coords: [-22.8378, -42.1017],
        nome: { pt: 'Casa da Flor', en: 'Casa da Flor', es: 'Casa da Flor' },
        teaser: {
          pt: 'Construída a partir de 1912 por Gabriel Joaquim dos Santos, filho de escravizados, com objetos achados.',
          en: 'Built from 1912 by Gabriel Joaquim dos Santos, son of enslaved people, from found objects.',
          es: 'Construida desde 1912 por Gabriel Joaquim dos Santos, hijo de esclavizados, con objetos encontrados.',
        },
        texto: {
          pt: 'A casa foi erguida com cacos de louça, conchas e restos de material. A Setur-RJ compara sua arquitetura à obra de Antoni Gaudí.',
          en: 'The house was raised from broken china, shells and leftover material. Setur-RJ compares its architecture to Antoni Gaudí’s work.',
          es: 'La casa se levantó con fragmentos de loza, conchas y restos de material. Setur-RJ compara su arquitectura con la obra de Gaudí.',
        },
        afirmacao: 'A Casa da Flor começou a ser construída em 1912 por Gabriel Joaquim dos Santos, filho de escravizados, com objetos encontrados.',
        fonte: SETUR('sao-pedro-da-aldeia'),
      },
      {
        id: 'aldeia-igreja-matriz', foto: 'img/poi/aldeia-igreja-matriz', tipo: 'essencial', categoria: 'historia',
        coords: [-22.8386, -42.1022],
        nome: { pt: 'Igreja Matriz de São Pedro', en: 'São Pedro Mother Church', es: 'Iglesia Matriz de São Pedro' },
        teaser: {
          pt: 'Inaugurada em 1783. O conjunto serviu como colégio jesuíta para a região.',
          en: 'Opened in 1783. The complex served as a Jesuit college for the region.',
          es: 'Inaugurada en 1783. El conjunto sirvió como colegio jesuita para la región.',
        },
        texto: {
          pt: 'A igreja está no ponto alto do centro e é o edifício mais antigo em uso da cidade.',
          en: 'The church stands on the high point of the town centre and is its oldest building still in use.',
          es: 'La iglesia está en el punto alto del centro y es el edificio más antiguo en uso de la ciudad.',
        },
        afirmacao: 'A Igreja Matriz de São Pedro foi inaugurada em 1783 e o conjunto serviu como colégio jesuíta.',
        fonte: SETUR('sao-pedro-da-aldeia'),
      },
      {
        id: 'aldeia-sudoeste', foto: 'img/poi/aldeia-sudoeste', tipo: 'essencial', categoria: 'esporte',
        coords: [-22.8447, -42.1122],
        nome: { pt: 'Praia do Sudoeste', en: 'Praia do Sudoeste', es: 'Praia do Sudoeste' },
        teaser: {
          pt: 'Um quilômetro e meio de margem de lagoa, com vento forte e água parada. Kitesurf e vela.',
          en: 'A kilometre and a half of lagoon shore, strong wind and still water. Kitesurfing and sailing.',
          es: 'Kilómetro y medio de orilla de laguna, viento fuerte y agua quieta. Kitesurf y vela.',
        },
        texto: {
          pt: 'A água é morna e transparente, e é daqui que se vê o pôr do sol da região.',
          en: 'The water is warm and clear, and this is where the region’s sunset is watched from.',
          es: 'El agua es templada y transparente, y desde aquí se ve el atardecer de la región.',
        },
        afirmacao: 'A Praia do Sudoeste tem 1,5 km de extensão, com águas mornas e transparentes.',
        fonte: SETUR('sao-pedro-da-aldeia'),
      },
      {
        id: 'aldeia-aviacao-naval', foto: 'img/poi/aldeia-aviacao-naval', tipo: 'complementar', categoria: 'historia',
        coords: [-22.8125, -42.0925],
        nome: { pt: 'Museu da Aviação Naval', en: 'Naval Aviation Museum', es: 'Museo de Aviación Naval' },
        teaser: {
          pt: 'A cidade abriga a base de aviação naval do país, e o museu conta essa história.',
          en: 'The town hosts the country’s naval aviation base, and the museum tells that story.',
          es: 'La ciudad alberga la base de aviación naval del país, y el museo cuenta esa historia.',
        },
        texto: {
          pt: 'O museu funciona na base de aviação naval que a cidade abriga.',
          en: 'The museum sits inside the naval aviation base the town hosts.',
          es: 'El museo funciona en la base de aviación naval que alberga la ciudad.',
        },
        afirmacao: 'O Museu da Aviação Naval consta da lista oficial de atrações de São Pedro da Aldeia.',
        fonte: SETUR('sao-pedro-da-aldeia'),
      },
    ],
  },
  {
    slug: 'saquarema',
    foto: 'img/mun/saquarema',
    secretaria: PREFEITURA_SAQUAREMA,
    linha: {
      pt: 'A única cidade do mundo a receber as três divisões do circuito mundial de surfe.',
      en: 'The only city in the world to host all three divisions of the world surfing tour.',
      es: 'La única ciudad del mundo que recibe las tres divisiones del circuito mundial de surf.',
    },
    pontos: [
      {
        id: 'saquarema-itauna', foto: 'img/poi/saquarema-itauna', tipo: 'essencial', categoria: 'esporte',
        coords: [-22.9328, -42.4794],
        nome: { pt: 'Praia de Itaúna', en: 'Itaúna Beach', es: 'Playa de Itaúna' },
        teaser: {
          pt: 'Onde acontece a etapa brasileira do circuito mundial de surfe, com contrato renovado até 2028.',
          en: 'Home of the Brazilian stop on the world surfing tour, with the contract renewed through 2028.',
          es: 'Sede de la etapa brasileña del circuito mundial de surf, con contrato renovado hasta 2028.',
        },
        texto: {
          pt: 'A prefeitura registra que Saquarema é a única cidade do mundo a receber as três divisões do circuito: QS, CT e Challenger Series.',
          en: 'The city records that Saquarema is the only city in the world hosting all three tour divisions: QS, CT and Challenger Series.',
          es: 'El municipio registra que Saquarema es la única ciudad del mundo que recibe las tres divisiones: QS, CT y Challenger Series.',
        },
        afirmacao: 'Saquarema é a única cidade do mundo a receber as três etapas do circuito da WSL, com a etapa mundial renovada até 2028.',
        fonte: 'https://www.saquarema.rj.gov.br/saquarema-garante-etapa-do-mundial-de-surfe-ate-2028/',
      },
      {
        id: 'saquarema-nazareth', foto: 'img/poi/saquarema-nazareth', tipo: 'essencial', categoria: 'historia',
        coords: [-22.9264, -42.5106],
        nome: { pt: 'Igreja Nossa Senhora de Nazareth', en: 'Church of Nossa Senhora de Nazareth', es: 'Iglesia de Nossa Senhora de Nazareth' },
        teaser: {
          pt: 'Sobre a rocha, na ponta entre a praia e a lagoa. O Círio daqui é o mais antigo do Brasil.',
          en: 'On the rock, on the point between beach and lagoon. Its Círio procession is Brazil’s oldest.',
          es: 'Sobre la roca, en la punta entre playa y laguna. Su Círio es el más antiguo de Brasil.',
        },
        texto: {
          pt: 'A prefeitura registra o Círio de Nazareth de Saquarema como o mais antigo do Brasil.',
          en: 'The city records Saquarema’s Círio de Nazareth as the oldest in Brazil.',
          es: 'El municipio registra el Círio de Nazareth de Saquarema como el más antiguo de Brasil.',
        },
        afirmacao: 'O Círio de Nazareth de Saquarema é registrado pela prefeitura como o mais antigo do Brasil.',
        fonte: PREFEITURA_SAQUAREMA,
      },
      {
        id: 'saquarema-lagoa', foto: 'img/poi/saquarema-lagoa', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.9219, -42.5036],
        nome: { pt: 'Lagoa de Saquarema', en: 'Saquarema Lagoon', es: 'Laguna de Saquarema' },
        teaser: {
          pt: 'A barra que liga a lagoa ao mar fica a poucos metros da arrebentação de Itaúna.',
          en: 'The bar linking lagoon to sea sits a few metres from the surf at Itaúna.',
          es: 'La barra que une laguna y mar está a pocos metros de la rompiente de Itaúna.',
        },
        texto: {
          pt: 'Saquarema tem outras duas lagoas, a de Jacarepiá e a Vermelha.',
          en: 'Saquarema has two other lagoons, Jacarepiá and Vermelha.',
          es: 'Saquarema tiene otras dos lagunas, la de Jacarepiá y la Vermelha.',
        },
        afirmacao: 'A Lagoa de Saquarema consta da lista oficial de atrações da prefeitura de Saquarema.',
        fonte: PREFEITURA_SAQUAREMA,
      },
      {
        id: 'saquarema-vila', foto: 'img/poi/saquarema-vila', tipo: 'inesperado', categoria: 'cultura',
        coords: [-22.9283, -42.5081],
        nome: { pt: 'Praia da Vila', en: 'Praia da Vila', es: 'Praia da Vila' },
        teaser: {
          pt: 'A praia aos pés da igreja, entre o costão e a barra da lagoa.',
          en: 'The beach at the foot of the church, between the rocks and the lagoon bar.',
          es: 'La playa al pie de la iglesia, entre el peñasco y la barra de la laguna.',
        },
        texto: {
          pt: 'É a praia do centro histórico, ao lado de Prainha, Barrinha e Itaúna.',
          en: 'It is the historic centre’s beach, next to Prainha, Barrinha and Itaúna.',
          es: 'Es la playa del centro histórico, junto a Prainha, Barrinha e Itaúna.',
        },
        afirmacao: 'A Praia da Vila consta da lista oficial de praias da prefeitura de Saquarema.',
        fonte: PREFEITURA_SAQUAREMA,
      },
    ],
  },
  {
    slug: 'silva-jardim',
    foto: 'img/mun/silva-jardim',
    secretaria: SETUR('silva-jardim'),
    linha: {
      pt: 'Nenhum outro município do estado tem tantas reservas particulares de patrimônio natural.',
      en: 'No other municipality in the state has as many private natural heritage reserves.',
      es: 'Ningún otro municipio del estado tiene tantas reservas privadas de patrimonio natural.',
    },
    pontos: [
      {
        id: 'silva-jardim-poco-das-antas', foto: 'img/poi/silva-jardim-poco-das-antas', tipo: 'essencial', categoria: 'natureza',
        coords: [-22.5497, -42.2711],
        nome: { pt: 'Reserva Biológica Poço das Antas', en: 'Poço das Antas Biological Reserve', es: 'Reserva Biológica Poço das Antas' },
        teaser: {
          pt: 'Conhecida internacionalmente pela preservação do mico-leão-dourado.',
          en: 'Known internationally for the conservation of the golden lion tamarin.',
          es: 'Conocida internacionalmente por la conservación del mono león dorado.',
        },
        texto: {
          pt: 'Reserva biológica é categoria de proteção integral e a visitação tem restrição legal. As regras de acesso devem ser confirmadas com o órgão gestor antes da visita.',
          en: 'A biological reserve is a strict-protection category and visitation is legally restricted. Access rules must be confirmed with the managing body before any visit.',
          es: 'Una reserva biológica es de protección integral y la visita tiene restricción legal. Las reglas deben confirmarse con el órgano gestor antes de la visita.',
        },
        afirmacao: 'A Reserva Biológica Poço das Antas é conhecida internacionalmente pela preservação do mico-leão-dourado.',
        fonte: SETUR('silva-jardim'),
      },
      {
        id: 'silva-jardim-aldeia-velha', foto: 'img/poi/silva-jardim-aldeia-velha', tipo: 'complementar', categoria: 'natureza',
        coords: [-22.5167, -42.4167],
        nome: { pt: 'Aldeia Velha', en: 'Aldeia Velha', es: 'Aldeia Velha' },
        teaser: {
          pt: 'Distrito cortado por dois rios de águas cristalinas, dentro da APA São João / Mico-Leão-Dourado.',
          en: 'A district crossed by two clear-water rivers, inside the São João / Golden Lion Tamarin protected area.',
          es: 'Distrito atravesado por dos ríos de aguas cristalinas, dentro del APA São João / Mico-Leão-Dourado.',
        },
        texto: {
          pt: 'Os dois rios atravessam o distrito dentro da APA São João / Mico-Leão-Dourado.',
          en: 'The two rivers cross the district inside the São João / Golden Lion Tamarin protected area.',
          es: 'Los dos ríos atraviesan el distrito dentro del APA São João / Mico-Leão-Dourado.',
        },
        afirmacao: 'Dois rios de águas cristalinas cortam o distrito de Aldeia Velha, situado na APA São João / Mico-Leão-Dourado.',
        fonte: SETUR('silva-jardim'),
      },
      {
        id: 'silva-jardim-sete-quedas', foto: 'img/poi/silva-jardim-sete-quedas', tipo: 'inesperado', categoria: 'natureza',
        coords: [-22.5250, -42.4300],
        nome: { pt: 'Cachoeira das Sete Quedas', en: 'Sete Quedas Waterfall', es: 'Cascada de Sete Quedas' },
        teaser: {
          pt: 'Uma das duas cachoeiras do município, ao lado da Cachoeira das Andorinhas.',
          en: 'One of the two waterfalls in the municipality, alongside Cachoeira das Andorinhas.',
          es: 'Una de las dos cascadas del municipio, junto a la Cachoeira das Andorinhas.',
        },
        texto: {
          pt: 'Fica em Silva Jardim, o município do estado com mais reservas particulares de patrimônio natural.',
          en: 'It is in Silva Jardim, the municipality with the most private natural heritage reserves in the state.',
          es: 'Está en Silva Jardim, el municipio con más reservas privadas de patrimonio natural del estado.',
        },
        afirmacao: 'A Cachoeira das Sete Quedas consta da lista oficial de atrações de Silva Jardim.',
        fonte: SETUR('silva-jardim'),
      },
      {
        id: 'silva-jardim-lapa', foto: 'img/poi/silva-jardim-lapa', tipo: 'complementar', categoria: 'historia',
        coords: [-22.6567, -42.3906],
        nome: { pt: 'Igreja Nossa Senhora da Lapa', en: 'Church of Nossa Senhora da Lapa', es: 'Iglesia de Nossa Senhora da Lapa' },
        teaser: {
          pt: 'A igreja do centro, ao lado do Centro Cultural Capivari.',
          en: 'The church in the town centre, next to the Capivari Cultural Centre.',
          es: 'La iglesia del centro, junto al Centro Cultural Capivari.',
        },
        texto: {
          pt: 'A igreja fica no centro de Silva Jardim, na bacia do Rio São João.',
          en: 'The church stands in the centre of Silva Jardim, in the São João river basin.',
          es: 'La iglesia está en el centro de Silva Jardim, en la cuenca del río São João.',
        },
        afirmacao: 'A Igreja Nossa Senhora da Lapa e o Centro Cultural Capivari constam da lista oficial de atrações de Silva Jardim.',
        fonte: SETUR('silva-jardim'),
      },
    ],
  },
]

// ---------------------------------------------------------------------------

const catalogoDeFotos: Record<string, { credito: string; alt?: Texto3 }> = JSON.parse(
  await readFile('content/fotos.json', 'utf8'),
)

/**
 * Destino sem entrada em content/fotos.json vira o marcador de pendente: e o catalogo, e nao
 * esta tabela, que diz se a foto existe (scripts/fotos-do-conteudo).
 */
function foto(destino: string): { src: string; credito: string; alt: Texto3 | undefined } {
  const achada = catalogoDeFotos[destino]
  if (!achada) return { src: FOTO_PENDENTE, credito: CREDITO_PENDENTE, alt: undefined }
  return { src: `/${destino}`, credito: achada.credito, alt: achada.alt }
}

const idiomas = ['pt', 'en', 'es'] as const
const audioPendente = (arquivo: string) =>
  Object.fromEntries(idiomas.map((i) => [i, { url: `/audio/${i}/${arquivo}.mp3`, dur: 45 }]))

const municipios = DADOS.map((m) => {
  const oficial = MUNICIPIOS.find((x) => x.slug === m.slug)
  if (!oficial) throw new Error(`slug fora da lista oficial: ${m.slug}`)
  const capa = foto(m.foto)
  const rede = REDES[m.slug]
  if (!rede) throw new Error(`CS-MUN-005: ${m.slug} sem canal de rede social`)
  return {
    slug: m.slug,
    nome: oficial.nome,
    redes: [
      {
        rede: 'instagram' as const,
        perfil: `@${rede.perfil}`,
        url: IG(rede.perfil),
        dono: rede.dono,
        fonte: rede.fonte,
        consultado_em: CONSULTA_14_08,
      },
    ],
    linha: m.linha,
    hero: {
      src: capa.src,
      alt: capa.alt ?? {
        pt: `Vista de ${oficial.nome}`,
        en: `View of ${oficial.nome}`,
        es: `Vista de ${oficial.nome}`,
      },
      credito: capa.credito,
    },
    audio: audioPendente(`mun-${m.slug}`),
    secretaria: { nome: 'Secretaria Municipal de Turismo', url: m.secretaria, selo: `/img/selo/${m.slug}.svg` },
    pontos: m.pontos.map((p) => p.id),
  }
})

const pontos = DADOS.flatMap((m) =>
  m.pontos.map((p, indice) => {
    const imagem = foto(p.foto)
    return {
      id: p.id,
      municipio: m.slug,
      tipo: p.tipo,
      nome: p.nome,
      categoria: p.categoria,
      coords: p.coords,
      teaser: p.teaser,
      texto: p.texto,
      audio: { ...audioPendente(p.id), pt: { url: `/audio/pt/${p.id}.mp3`, dur: 50 } },
      foto: {
        v: imagem.src,
        h: imagem.src,
        alt: imagem.alt ?? { pt: p.nome.pt, en: p.nome.en, es: p.nome.es },
        credito: imagem.credito,
      },
      fonte_verificacao: [
        { afirmacao: p.afirmacao, url: p.fonte, consultado_em: p.consultado_em ?? CONSULTA, revisor: REVISOR },
      ],
      ordem: indice + 1,
    }
  }),
)

/** Centroides aproximados, mesma ressalva das coordenadas dos pontos (P-28). */
const CENTRO: Record<string, [number, number]> = {
  araruama: [-22.8728, -42.3433],
  'armacao-dos-buzios': [-22.7469, -41.8817],
  'arraial-do-cabo': [-22.9661, -42.0278],
  'cabo-frio': [-22.8894, -42.0286],
  'casimiro-de-abreu': [-22.4794, -42.2044],
  'iguaba-grande': [-22.8394, -42.2286],
  'rio-das-ostras': [-22.5269, -41.945],
  'sao-pedro-da-aldeia': [-22.8386, -42.1022],
  saquarema: [-22.92, -42.51],
  'silva-jardim': [-22.6567, -42.3906],
}

const ROTAS = [
  {
    id: 'rota-da-lagoa',
    nome: { pt: 'A rota da lagoa', en: 'The lagoon route', es: 'La ruta de la laguna' },
    eixo: { pt: 'O entorno da Lagoa de Araruama', en: 'Around the Araruama Lagoon', es: 'El entorno de la Laguna de Araruama' },
    cor: '#1d6f8b',
    municipios: ['saquarema', 'araruama', 'iguaba-grande', 'sao-pedro-da-aldeia'],
  },
  {
    id: 'rota-do-mar',
    nome: { pt: 'A rota do mar aberto', en: 'The open sea route', es: 'La ruta del mar abierto' },
    eixo: { pt: 'O encontro do canal com o oceano', en: 'Where the channel meets the ocean', es: 'Donde el canal encuentra el océano' },
    cor: '#0f8f8f',
    municipios: ['cabo-frio', 'arraial-do-cabo', 'armacao-dos-buzios'],
  },
  {
    id: 'rota-da-mata',
    nome: { pt: 'A rota da mata', en: 'The forest route', es: 'La ruta del bosque' },
    eixo: { pt: 'A bacia do Rio São João', en: 'The São João river basin', es: 'La cuenca del río São João' },
    cor: '#3f7a3f',
    municipios: ['silva-jardim', 'casimiro-de-abreu', 'rio-das-ostras'],
  },
  {
    id: 'conderlagos-inteiro',
    nome: { pt: 'O Conderlagos inteiro', en: 'The whole of Conderlagos', es: 'Conderlagos entero' },
    eixo: { pt: 'De ponta a ponta do território', en: 'From one end of the territory to the other', es: 'De un extremo al otro del territorio' },
    cor: '#b06a2c',
    municipios: [
      'saquarema', 'araruama', 'silva-jardim', 'iguaba-grande', 'sao-pedro-da-aldeia',
      'arraial-do-cabo', 'cabo-frio', 'armacao-dos-buzios', 'casimiro-de-abreu', 'rio-das-ostras',
    ],
  },
]

const rotas = ROTAS.map((r) => {
  const quantidade = r.municipios.length
  return {
    id: r.id,
    nome: r.nome,
    eixo: r.eixo,
    cor: r.cor,
    municipios: r.municipios,
    pontos: r.municipios.map((slug) => pontos.find((p) => p.municipio === slug && p.ordem === 1)!.id),
    geometria: {
      type: 'LineString',
      // GeoJSON e [lon, lat] — invertido em relacao a `coords` dos pontos.
      coordinates: r.municipios.map((slug) => [CENTRO[slug]![1], CENTRO[slug]![0]]),
    },
    // Contagem, nao estimativa de tempo: quantos dias uma rota leva depende de quem
    // viaja, e numero sem apuracao nao vai ao ar (CS-OURO-006, P-04).
    duracao_sugerida: {
      pt: `${quantidade} cidades`,
      en: `${quantidade} cities`,
      es: `${quantidade} ciudades`,
    },
    distancia_km: null,
    tempo_estimado: null,
    fonte: null,
    pdf: Object.fromEntries(idiomas.map((i) => [i, `/pdf/${r.id}-${i}.pdf`])),
  }
})

/**
 * CS-HOME-005 pede tres fatos. Estao aqui os dois com fonte oficial apurada e o terceiro,
 * do acesso aereo, tambem com fonte da prefeitura de Cabo Frio. Nenhum numero sem fonte.
 */
const fatos = [
  {
    id: 'aereo',
    titulo: { pt: 'Voo internacional direto', en: 'Direct international flights', es: 'Vuelo internacional directo' },
    numero: '54',
    texto: {
      pt: 'Voos diretos de Buenos Aires e Rosário para Cabo Frio entre janeiro e abril de 2026, que retomaram a rota internacional depois de cinco anos.',
      en: 'Direct flights from Buenos Aires and Rosario to Cabo Frio between January and April 2026, resuming the international route after five years.',
      es: 'Vuelos directos de Buenos Aires y Rosario a Cabo Frio entre enero y abril de 2026, que retomaron la ruta internacional tras cinco años.',
    },
    fonte_url: 'https://noticias.cabofrio.rj.gov.br/primeiros-turistas-argentinos-desembarcam-em-cabo-frio-e-marcam-retomada-dos-voos-internacionais-em-2026/',
    fonte_nome: 'Prefeitura de Cabo Frio',
    confianca: 'alta',
  },
  {
    id: 'wsl',
    titulo: { pt: 'As três divisões do circuito mundial', en: 'All three world tour divisions', es: 'Las tres divisiones del circuito mundial' },
    numero: '3',
    texto: {
      // A frase das tres divisoes esta na pagina de turismo da prefeitura; a noticia de
      // 2028, que era a fonte antes, so fala da etapa principal.
      pt: 'Saquarema é a única cidade do mundo que recebe as três divisões do circuito mundial de surfe da WSL.',
      en: 'Saquarema is the only city in the world that hosts all three divisions of the WSL world surfing tour.',
      es: 'Saquarema es la única ciudad del mundo que recibe las tres divisiones del circuito mundial de surf de la WSL.',
    },
    fonte_url: PREFEITURA_SAQUAREMA,
    fonte_nome: 'Prefeitura de Saquarema',
    confianca: 'alta',
  },
  {
    id: 'natureza',
    titulo: { pt: 'Um parque estadual de ponta a ponta', en: 'A state park across the region', es: 'Un parque estatal de punta a punta' },
    // Espaco fino inseparavel: "9.790" le como nove virgula sete em ingles, e "9,790" como
    // nove virgula sete em portugues. O espaco e a grafia do SI, e nao quebra linha.
    numero: '9\u202f790 ha',
    texto: {
      pt: 'O Parque Estadual da Costa do Sol, criado em 2011, protege 9.790 hectares distribuídos por seis municípios.',
      en: 'Costa do Sol State Park, created in 2011, protects 9,790 hectares across six municipalities.',
      es: 'El Parque Estadual da Costa do Sol, creado en 2011, protege 9.790 hectáreas en seis municipios.',
    },
    fonte_url: DECRETO_PARQUE,
    fonte_nome: 'Decreto Estadual 42.929/2011',
    confianca: 'alta',
  },
]

await writeFile('content/municipios.json', JSON.stringify(municipios, null, 2) + '\n', 'utf8')
await writeFile('content/pontos.json', JSON.stringify(pontos, null, 2) + '\n', 'utf8')
await writeFile('content/rotas.json', JSON.stringify(rotas, null, 2) + '\n', 'utf8')
await writeFile('content/fatos.json', JSON.stringify(fatos, null, 2) + '\n', 'utf8')

console.log(`content/: ${municipios.length} municipios, ${pontos.length} pontos.`)
console.log(`Fotos pendentes: ${pontos.filter((p) => p.foto.v === FOTO_PENDENTE).length} de ${pontos.length} pontos.`)
