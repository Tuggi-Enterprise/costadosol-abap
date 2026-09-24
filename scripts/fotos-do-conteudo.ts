/**
 * A lista de fotos publicadas, e o unico lugar onde ela existe.
 *
 * Desde 23/09/2026 cada foto e fixada pelo titulo exato no Commons, depois de alguem abrir a
 * imagem e conferir o lugar na pagina do arquivo. A busca por palavra-chave, que vinha antes,
 * publicou uma estacao meteorologica como capa de Iguaba Grande, Aldeia Velha de Portugal
 * por Aldeia Velha de Silva Jardim e um banner "sem foto" do Wiki Loves Monuments na Casa da
 * Flor. Licenca e autor continuam conferidos na hora do download (buscar-fotos).
 *
 * Ponto que nao esta aqui nao tem foto aceitavel no Commons nem no Flickr (busca por texto e
 * por coordenada, 24/09/2026) e mostra o espaco vazio: Sete Quedas. A Casa da Flor so
 * existe no Flickr. Pedra da Salga, Ilha de Santa Rita, Serra de Sapeatiba e Igreja da Lapa
 * sairam da lista de pontos pelo mesmo motivo, trocadas por lugares com foto.
 *
 * `autor` e o nome como vai no credito: importacao do Flickr traz o nome da conta inteira.
 * `alt` descreve o que a foto mostra; o conteudo le daqui (compor-conteudo).
 *
 * Saida: public/img/**.webp|.avif e content/fotos.json.
 *
 *   npx tsx scripts/fotos-do-conteudo.ts
 *   npx tsx scripts/fotos-do-conteudo.ts img/poi/ostras-pier   # so estas; o resto do catalogo fica
 */
import { readFile, writeFile } from 'node:fs/promises'
import { credito, executar, type Fixa, type FotoEncontrada } from './buscar-fotos.ts'

const FIXAS: Fixa[] = [
  { destino: "img/gal/araruama-1", arquivo: "File:Araruama - RJ (50971789128).jpg", autor: "Rômulo Gama Ferreira",
    alt: {"pt": "Faixa de areia avançando sobre a Lagoa de Araruama", "en": "Sandbar stretching into Araruama Lagoon", "es": "Franja de arena que avanza sobre la Laguna de Araruama"} },
  { destino: "img/gal/araruama-2", arquivo: "File:Fim de tarde na Lagoa de Araruama.JPG", autor: "Juh oliveira87",
    alt: {"pt": "Pôr do sol na Lagoa de Araruama emoldurado por folhas de coqueiro", "en": "Sunset over Araruama Lagoon framed by palm fronds", "es": "Puesta de sol en la Laguna de Araruama enmarcada por hojas de cocotero"} },
  { destino: "img/gal/araruama-3", arquivo: "File:P1070982.JPG", autor: "Ebengtso",
    alt: {"pt": "Pescador caminhando nas águas rasas da Lagoa de Araruama", "en": "Fisherman wading in the shallow waters of Araruama Lagoon", "es": "Pescador caminando en las aguas bajas de la Laguna de Araruama"} },
  { destino: "img/gal/armacao-dos-buzios-1", arquivo: "File:Praia Brava - Búzios.jpg", autor: "Juh oliveira87",
    alt: {"pt": "Praia Brava de Búzios vista do alto, com casas na encosta", "en": "Praia Brava in Búzios seen from above, with houses on the hillside", "es": "Praia Brava de Búzios vista desde lo alto, con casas en la ladera"} },
  { destino: "img/gal/armacao-dos-buzios-2", arquivo: "File:Praia da Armação, Búzios 2.JPG", autor: "Leandrobarr",
    alt: {"pt": "Barcos de pesca na Praia da Armação com o casario de Búzios ao fundo", "en": "Fishing boats at Armação Beach with Búzios houses behind", "es": "Barcas de pesca en la Playa de Armação con el caserío de Búzios al fondo"} },
  { destino: "img/gal/armacao-dos-buzios-3", arquivo: "File:Panorama da Praia de Manguinhos.jpg", autor: "Patrick Montenegro",
    alt: {"pt": "Panorama da Praia de Manguinhos com barcos ancorados", "en": "Panorama of Manguinhos Beach with anchored boats", "es": "Panorama de la Playa de Manguinhos con barcas fondeadas"} },
  { destino: "img/gal/arraial-do-cabo-1", arquivo: "File:Praia Grande - Arraial do Cabo - panoramio (17).jpg", autor: "Larissa Fraga",
    alt: {"pt": "Areia branca e mar azul da Praia Grande de Arraial do Cabo", "en": "White sand and blue sea at Praia Grande, Arraial do Cabo", "es": "Arena blanca y mar azul de la Praia Grande de Arraial do Cabo"} },
  { destino: "img/gal/arraial-do-cabo-2", arquivo: "File:Entrance to Gruta Azul on Ilha do Cabo Frio, Arraial do Cabo, Brazil.jpg", autor: "Wilfredor",
    alt: {"pt": "Entrada da Gruta Azul sob o costão da Ilha do Cabo Frio", "en": "Entrance to the Blue Grotto beneath the cliffs of Cabo Frio Island", "es": "Entrada de la Gruta Azul bajo los acantilados de la Isla de Cabo Frío"} },
  { destino: "img/gal/arraial-do-cabo-3", arquivo: "File:Arraial do Cabo-RJ Trilha do Vigia Praia Grande .jpg", autor: "Adriane Rado",
    alt: {"pt": "Sol refletido no mar visto da Trilha do Vigia, na Praia Grande", "en": "Sun reflecting on the sea seen from the Vigia Trail, Praia Grande", "es": "Sol reflejado en el mar visto desde el Sendero del Vigia, Praia Grande"} },
  { destino: "img/gal/cabo-frio-1", arquivo: "File:Vista da Praia das Dunas, Cabo Frio em 2015.jpg", autor: "Arielom10",
    alt: {"pt": "Dunas brancas da Praia das Dunas com ilhas ao fundo", "en": "White dunes at Praia das Dunas with islands behind", "es": "Dunas blancas de la Praia das Dunas con islas al fondo"} },
  { destino: "img/gal/cabo-frio-2", arquivo: "File:O caminho do azul.jpg", autor: "Anabel Kovacs",
    alt: {"pt": "Passarela de madeira entre a vegetação rumo à Praia do Forte", "en": "Wooden boardwalk through vegetation toward Praia do Forte", "es": "Pasarela de madera entre la vegetación hacia la Praia do Forte"} },
  { destino: "img/gal/cabo-frio-3", arquivo: "File:The fort beach. Cabo Frio - Rio de Janeiro (24484464950).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Costão rochoso e ilha junto à Praia do Forte", "en": "Rocky shore and island next to Praia do Forte", "es": "Costa rocosa e isla junto a la Praia do Forte"} },
  { destino: "img/gal/casimiro-de-abreu-1", arquivo: "File:Pôr do Sol3 - Beira Rio - Barra de São João - Rio de Janeiro.JPG", autor: "alfredo.figueiredo",
    alt: {"pt": "Pôr do sol sobre o Rio São João, em Barra de São João", "en": "Sunset over the São João River in Barra de São João", "es": "Puesta de sol sobre el río São João, en Barra de São João"} },
  { destino: "img/gal/casimiro-de-abreu-2", arquivo: "File:Cachoeira da Fumaça - Rio Macaé - panoramio (1).jpg", autor: "TMbux",
    alt: {"pt": "Cachoeira da Fumaça no Rio Macaé, na serra de Casimiro de Abreu", "en": "Fumaça Waterfall on the Macaé River, in the Casimiro de Abreu highlands", "es": "Cascada da Fumaça en el río Macaé, en la sierra de Casimiro de Abreu"} },
  { destino: "img/gal/casimiro-de-abreu-3", arquivo: "File:Embarcações.JPG", autor: "Raku90",
    alt: {"pt": "Barcos de pesca na foz do Rio São João ao entardecer", "en": "Fishing boats at the mouth of the São João River at dusk", "es": "Barcas de pesca en la desembocadura del río São João al atardecer"} },
  { destino: "img/gal/iguaba-grande-1", arquivo: "File:Capela N. Senhora da Conceição em Iguaba Grande - Rj. (8700509490).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Capela de Nossa Senhora da Conceição, branca com detalhes azuis, entre palmeiras", "en": "Chapel of Our Lady of the Conception, white with blue trim, among palm trees", "es": "Capilla de Nuestra Señora de la Concepción, blanca con detalles azules, entre palmeras"} },
  { destino: "img/gal/iguaba-grande-2", arquivo: "File:Iguaba Grande - Rio de Janeiro - Brasil (24686778401).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Margem da Lagoa de Araruama com água rasa e transparente, pedras e casuarinas", "en": "Araruama Lagoon edge with clear shallow water, rocks and casuarina trees", "es": "Orilla de la Laguna de Araruama con agua clara y poco profunda, rocas y casuarinas"} },
  { destino: "img/gal/iguaba-grande-3", arquivo: "File:Ubas, Iguaba Grande - RJ, Brazil - panoramio (3).jpg", autor: "Newton paz peres",
    alt: {"pt": "Pôr do sol sobre a lagoa em Ubás, com um barco de madeira encalhado na areia", "en": "Sunset over the lagoon at Ubás, with a wooden boat resting on the sand", "es": "Atardecer sobre la laguna en Ubás, con un barco de madera varado en la arena"} },
  { destino: "img/gal/rio-das-ostras-1", arquivo: "File:ThiagoFreitas Ilha dos Trinta Reis Rio das Ostras RJ (39244159820).jpg", autor: "Thiago Freitas / MTur Destinos",
    alt: {"pt": "Escuna de passeio ancorada diante da Ilha dos Trinta Reis, coberta de mata", "en": "Tour schooner anchored off the forested Ilha dos Trinta Reis", "es": "Goleta de paseo anclada frente a la Ilha dos Trinta Reis, cubierta de bosque"} },
  { destino: "img/gal/rio-das-ostras-2", arquivo: "File:ThiagoFreitas Casa de Cultura Doutor Bento Costa Junior Rio das Ostras RJ (39244163560).jpg", autor: "Thiago Freitas / MTur Destinos",
    alt: {"pt": "Casarão colonial branco com janelas azuis da Casa de Cultura Bento Costa Júnior", "en": "White colonial house with blue windows, Bento Costa Júnior Culture House", "es": "Casona colonial blanca con ventanas azules de la Casa de Cultura Bento Costa Júnior"} },
  { destino: "img/gal/rio-das-ostras-3", arquivo: "File:Rio das Ostras - RJ (50977149798).jpg", autor: "Rômulo Gama Ferreira",
    alt: {"pt": "Posto de salva-vidas de madeira sobre a restinga ao entardecer, com mar ao fundo", "en": "Wooden lifeguard tower on the coastal scrub at dusk, with sea behind", "es": "Puesto de socorrista de madera sobre la vegetación costera al atardecer, con el mar al fondo"} },
  { destino: "img/gal/sao-pedro-da-aldeia-1", arquivo: "File:Praia do centro de São Pedro.jpg", autor: "Tiagosilvaphotography",
    alt: {"pt": "Pôr do sol sobre a lagoa na praia do centro, com barco e píer ao fundo", "en": "Sunset over the lagoon at the town beach, with a boat and pier behind", "es": "Atardecer sobre la laguna en la playa del centro, con barco y muelle al fondo"} },
  { destino: "img/gal/sao-pedro-da-aldeia-2", arquivo: "File:Tons de Azul.jpg", autor: "Edwiges Lopes Tavares",
    alt: {"pt": "Deque de madeira sobre água azul da lagoa, areia clara e céu sem nuvens", "en": "Wooden deck over the lagoon's blue water, pale sand and cloudless sky", "es": "Muelle de madera sobre el agua azul de la laguna, arena clara y cielo despejado"} },
  { destino: "img/gal/sao-pedro-da-aldeia-3", arquivo: "File:Conjunto Arquitetônico, Urbanístico e Paisagístico do Sítio Histórico - São Pedro da Aldeia - 20260909111755.jpg", autor: "Túllio F",
    alt: {"pt": "Sítio histórico tombado: igreja branca com torre e casario ao redor da praça", "en": "Listed historic district: white church with bell tower and surrounding square", "es": "Sitio histórico protegido: iglesia blanca con torre y casas alrededor de la plaza"} },
  { destino: "img/gal/saquarema-1", arquivo: "File:SAQUAREMA 05.JPG", autor: "JORGE PAQUETA",
    alt: {"pt": "Praia lotada de água verde-clara em Saquarema, com a cidade e morros ao fundo", "en": "Crowded beach with pale green water in Saquarema, town and hills behind", "es": "Playa concurrida de agua verde claro en Saquarema, con la ciudad y cerros al fondo"} },
  { destino: "img/gal/saquarema-2", arquivo: "File:Saquarema do alto da Igreja N. Sra. de Nazaré (6372010401).jpg", autor: "Cesar Cardoso",
    alt: {"pt": "Centro de Saquarema e a praia vistos do alto do morro da igreja de Nazareth", "en": "Saquarema town centre and beach seen from the Nazareth church hill", "es": "Centro de Saquarema y la playa vistos desde lo alto del morro de la iglesia"} },
  { destino: "img/gal/saquarema-3", arquivo: "File:Igreja de Saquarema.jpg", autor: "Rodrigo Alves",
    alt: {"pt": "Igreja de Nazareth no alto do costão, com ondas quebrando nas pedras", "en": "Nazareth church atop the rocky headland, with waves breaking on the rocks", "es": "Iglesia de Nazareth en lo alto del promontorio, con olas rompiendo en las rocas"} },
  { destino: "img/gal/silva-jardim-1", arquivo: "File:RPPN Aldeia Velha6.jpg", autor: "Rafael Deminicis",
    alt: {"pt": "Interior de Mata Atlântica densa, com troncos finos e folhagem verde", "en": "Dense Atlantic Forest interior with slender trunks and green foliage", "es": "Interior de Mata Atlántica densa, con troncos finos y follaje verde"} },
  { destino: "img/gal/silva-jardim-2", arquivo: "File:Golden Lion Tamarin Poco das Antas.jpg", autor: "Bart van Dorp",
    alt: {"pt": "Mico-leão-dourado vocalizando num galho, fotografado na REBIO Poço das Antas", "en": "Golden lion tamarin calling from a branch, photographed at Poço das Antas reserve", "es": "Tití león dorado vocalizando en una rama, fotografiado en la reserva Poço das Antas"} },
  { destino: "img/gal/silva-jardim-3", arquivo: "File:Lonely donkey.jpg", autor: "Karen Campbell Tyler-Williams",
    alt: {"pt": "Jumento à sombra de árvore em pasto verde com morros ao fundo, em Aldeia Velha", "en": "Donkey in the shade of a tree on green pasture with hills behind, Aldeia Velha", "es": "Burro a la sombra de un árbol en un prado verde con cerros al fondo, Aldeia Velha"} },
  { destino: "img/mun/araruama", arquivo: "File:A praia da lagoa salgada de Araruama - Rj. (8700515282).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Praia de areia branca com coqueiros às margens da Lagoa de Araruama", "en": "White-sand beach with coconut palms on the shore of Araruama Lagoon", "es": "Playa de arena blanca con cocoteros a orillas de la Laguna de Araruama"} },
  { destino: "img/mun/armacao-dos-buzios", arquivo: "File:Praia de João Fernandes 03.jpg", autor: "Halley Pacheco de Oliveira",
    alt: {"pt": "Enseada da Praia de João Fernandes vista do alto do morro, em Búzios", "en": "João Fernandes Beach cove seen from the hilltop in Búzios", "es": "Ensenada de la Playa de João Fernandes vista desde lo alto del cerro, Búzios"} },
  { destino: "img/mun/arraial-do-cabo", arquivo: "File:Costa do Sol Pontal.jpg", autor: "Antônio André Lopes de Oliveira",
    alt: {"pt": "Mar azul-turquesa do Pontal do Atalaia visto do alto, com ilhas ao fundo", "en": "Turquoise sea at Pontal do Atalaia seen from above, islands behind", "es": "Mar turquesa del Pontal do Atalaia visto desde lo alto, con islas al fondo"} },
  { destino: "img/mun/cabo-frio", arquivo: "File:Cabo Frio - vista aérea.jpg", autor: "Luiz Felipe Lage Levy",
    alt: {"pt": "Vista aérea de Cabo Frio com a Praia do Forte e o Canal do Itajuru", "en": "Aerial view of Cabo Frio with Praia do Forte and the Itajuru Canal", "es": "Vista aérea de Cabo Frío con la Praia do Forte y el Canal de Itajuru"} },
  { destino: "img/mun/casimiro-de-abreu", arquivo: "File:Barra de São João 08.jpg", autor: "Halley Pacheco de Oliveira",
    alt: {"pt": "Praia de Barra de São João com pedras e mar azul", "en": "Barra de São João beach with rocks and blue sea", "es": "Playa de Barra de São João con rocas y mar azul"} },
  { destino: "img/mun/iguaba-grande", arquivo: "File:Iguaba Grande - Rio de Janeiro - Brasil (24484689660).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Orla da Lagoa de Araruama em Iguaba Grande, com areia clara e coqueiros", "en": "Araruama Lagoon shore in Iguaba Grande, with pale sand and palm trees", "es": "Orilla de la Laguna de Araruama en Iguaba Grande, con arena clara y cocoteros"} },
  { destino: "img/mun/rio-das-ostras", arquivo: "File:RioOstras2.jpg", autor: "Fulviusbsas",
    alt: {"pt": "Praia de Rio das Ostras vista do alto do costão, com orla, casas e mar com ondas", "en": "Rio das Ostras beach seen from the headland, with seafront, houses and waves", "es": "Playa de Rio das Ostras vista desde el promontorio, con malecón, casas y olas"} },
  { destino: "img/mun/sao-pedro-da-aldeia", arquivo: "File:São Pedro da Aldeia - RJ (51536048180).jpg", autor: "Rômulo Gama Ferreira",
    alt: {"pt": "Orla da lagoa em São Pedro da Aldeia com cata-vento, ciclovia e céu azul", "en": "Lagoon waterfront in São Pedro da Aldeia with windmill, bike path and blue sky", "es": "Malecón de la laguna en São Pedro da Aldeia con molino de viento, ciclovía y cielo azul"} },
  { destino: "img/mun/saquarema", arquivo: "File:SaquaremaFozLagoa.jpg", autor: "Roger Brock",
    alt: {"pt": "Foz da lagoa de Saquarema no mar", "en": "Mouth of the Saquarema lagoon into the sea", "es": "Desembocadura de la laguna de Saquarema en el mar"} },
  { destino: "img/mun/silva-jardim", arquivo: "File:RPPN Aldeia Velha8.jpg", autor: "Rafael Deminicis",
    alt: {"pt": "Serras cobertas de Mata Atlântica atrás de gramado e palmeiras em Silva Jardim", "en": "Atlantic Forest-covered mountains behind a lawn and palm trees in Silva Jardim", "es": "Sierras cubiertas de Mata Atlántica detrás de un prado y palmeras en Silva Jardim"} },
  { destino: "img/poi/aldeia-aviacao-naval", arquivo: "File:SH-16 Seahawk N-3035, do 1º Esquadrão de Helicópteros Antissubmarino (HS-1) (52747349324).png", autor: "Marinha do Brasil",
    alt: {"pt": "Helicópteros SH-16 Seahawk sobrevoando a Base Aérea Naval, com torre de controle", "en": "SH-16 Seahawk helicopters flying over the Naval Air Base, with control tower", "es": "Helicópteros SH-16 Seahawk sobrevolando la Base Aérea Naval, con torre de control"} },
  { destino: "img/poi/aldeia-casa-da-flor", arquivo: "https://www.flickr.com/photos/rafael-aop/50306627996/",
    original: "https://live.staticflickr.com/65535/50306627996_29af571543_o.jpg",
    alt: {"pt": "Casa caiada da Casa da Flor com pináculos de cacos e pedras no jardim", "en": "Whitewashed Casa da Flor with pinnacles of shards and stones in the garden", "es": "Casa encalada de la Casa da Flor con pináculos de fragmentos y piedras en el jardín"} },
  { destino: "img/poi/aldeia-igreja-matriz", arquivo: "File:SPedroAldeia-JesuitChurch.jpg", autor: "Fulviusbsas",
    alt: {"pt": "Igreja Matriz de São Pedro, antiga igreja jesuíta", "en": "Mother Church of São Pedro, a former Jesuit church", "es": "Iglesia Matriz de São Pedro, antigua iglesia jesuita"} },
  { destino: "img/poi/aldeia-sudoeste", arquivo: "File:Praia.sudoeste1025.jpg", autor: "Msadp06",
    alt: {"pt": "Faixa de areia da Praia do Sudoeste com árvores à direita e lagoa agitada", "en": "Sudoeste beach sand strip with trees on the right and choppy lagoon", "es": "Franja de arena de la Praia do Sudoeste con árboles a la derecha y laguna agitada"} },
  { destino: "img/poi/araruama-juturnaiba", arquivo: "File:Juturnaíba.jpg", autor: "Secretaria de Estado de Defesa Civil do Rio de Janeiro",
    alt: {"pt": "Vista aérea da barragem da Lagoa de Juturnaíba cercada de mata", "en": "Aerial view of the Juturnaíba Lagoon dam surrounded by forest", "es": "Vista aérea de la presa de la Laguna de Juturnaíba rodeada de bosque"} },
  { destino: "img/poi/araruama-lagoa", arquivo: "File:LagoaDeAraruama.JPG", autor: "DeniseGiovana",
    alt: {"pt": "Águas azul-turquesa da Lagoa de Araruama com vegetação em primeiro plano", "en": "Turquoise waters of Araruama Lagoon with vegetation in the foreground", "es": "Aguas turquesa de la Laguna de Araruama con vegetación en primer plano"} },
  { destino: "img/poi/araruama-massambaba", arquivo: "File:APA de massambaba Tarsila Pimentel (01).jpg", autor: "Tamiresin",
    alt: {"pt": "Pôr do sol na praia da APA de Massambaba, em Praia Seca", "en": "Sunset on the beach of the Massambaba protected area, Praia Seca", "es": "Puesta de sol en la playa del área protegida de Massambaba, Praia Seca"} },
  { destino: "img/poi/araruama-praia-seca", arquivo: "File:Praia Seca RJ 2.jpg", autor: "Gladstone at Portuguese Wikipedia",
    alt: {"pt": "Pôr do sol sobre o mar aberto na Praia Seca", "en": "Sunset over the open sea at Praia Seca", "es": "Puesta de sol sobre el mar abierto en Praia Seca"} },
  { destino: "img/poi/arraial-anjos", arquivo: "File:Praia dos Anjos.JPG", autor: "Rafael Rabello de Barros",
    alt: {"pt": "Praia dos Anjos e porto de barcos vistos do alto", "en": "Praia dos Anjos and its boat harbor seen from above", "es": "Praia dos Anjos y su puerto de barcas vistos desde lo alto"} },
  { destino: "img/poi/arraial-farol", arquivo: "File:VistaPraiadoFarol-Arraial do Cabo-feb2016-3.jpg", autor: "Ezarate",
    alt: {"pt": "Águas turquesa da Praia do Farol entre os morros da Ilha do Cabo Frio", "en": "Turquoise waters of Praia do Farol between the hills of Cabo Frio Island", "es": "Aguas turquesa de la Praia do Farol entre los cerros de la Isla de Cabo Frío"} },
  { destino: "img/poi/arraial-forno", arquivo: "File:Forno beach.jpg", autor: "Eurico Zimbres",
    alt: {"pt": "Praia do Forno vista da trilha, com mata e água clara", "en": "Praia do Forno seen from the trail, with forest and clear water", "es": "Praia do Forno vista desde el sendero, con bosque y agua clara"} },
  { destino: "img/poi/arraial-prainhas", arquivo: "File:Pontal do Atalaia, Parque Estadual da Costa do Sol, Núcleo Atalaia - Dama Branca.JPG", autor: "Daniel Souza Lima",
    alt: {"pt": "Enseada das Prainhas do Pontal do Atalaia vista entre cactos", "en": "Prainhas do Pontal do Atalaia cove seen through cacti", "es": "Ensenada de las Prainhas do Pontal do Atalaia vista entre cactus"} },
  { destino: "img/poi/buzios-ferradura", arquivo: "File:Praia da Ferradura com botes de pesca.jpg", autor: "Alberto1939",
    alt: {"pt": "Barcos coloridos na areia da Praia da Ferradura, com a enseada ao fundo", "en": "Colorful boats on the sand of Ferradura Beach, with the cove behind", "es": "Barcas coloridas en la arena de la Playa de la Ferradura, con la ensenada al fondo"} },
  { destino: "img/poi/buzios-geriba", arquivo: "File:Parque Estadual da Costa do Sol - Anna Cláudia Gouveia Salomon (33).jpg", autor: "AnnaClGS",
    alt: {"pt": "Faixa de areia e ondas da Praia de Geribá em dia claro", "en": "Sand and waves of Geribá Beach on a clear day", "es": "Arena y olas de la Playa de Geribá en un día despejado"} },
  { destino: "img/poi/buzios-orla-bardot", arquivo: "File:Buzios-OrlaBardot2.jpg", autor: "Fulviusbsas",
    alt: {"pt": "Calçadão de pedra da Orla Bardot à beira da Praia da Armação", "en": "Stone promenade of Orla Bardot along Armação Beach", "es": "Paseo de piedra de la Orla Bardot junto a la Playa de Armação"} },
  { destino: "img/poi/buzios-rua-das-pedras", arquivo: "File:Búzios (6371922433).jpg", autor: "Cesar Cardoso",
    alt: {"pt": "Rua das Pedras com calçamento de pedra, árvores e lojas", "en": "Rua das Pedras with stone paving, trees and shops", "es": "Rua das Pedras con empedrado, árboles y tiendas"} },
  { destino: "img/poi/cabo-frio-forte", arquivo: "File:Forte de São Mateus do Cabo Frio 01.jpg", autor: "Halley Pacheco de Oliveira",
    alt: {"pt": "Portal branco do Forte São Mateus sob céu azul", "en": "White gate of São Mateus Fort under a blue sky", "es": "Portal blanco del Fuerte São Mateus bajo cielo azul"} },
  { destino: "img/poi/cabo-frio-itajuru", arquivo: "File:CaboFrio Boats at Canal do Itajuru.JPG", autor: "Frenz 69",
    alt: {"pt": "Barcos de pesca atracados no Canal do Itajuru", "en": "Fishing boats moored in the Itajuru Canal", "es": "Barcas de pesca amarradas en el Canal de Itajuru"} },
  { destino: "img/poi/cabo-frio-pero", arquivo: "File:CarlosErbsJr Praia do Pero Morro do Vigia Cabo Frio RJ (27169339728).jpg", autor: "MTur Destinos",
    alt: {"pt": "Barco de pesca na areia da Praia do Peró", "en": "Fishing boat on the sand at Praia do Peró", "es": "Barca de pesca en la arena de la Praia do Peró"} },
  { destino: "img/poi/cabo-frio-praia-do-forte", arquivo: "File:The fort beach. Cabo Frio - Rio de Janeiro (24779920845).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Praia do Forte com água turquesa e a orla de prédios ao fundo", "en": "Praia do Forte with turquoise water and the waterfront buildings behind", "es": "Praia do Forte con agua turquesa y los edificios de la costanera al fondo"} },
  { destino: "img/poi/casimiro-barra-de-sao-joao", arquivo: "File:Ponte caída.JPG", autor: "Raku90",
    alt: {"pt": "Ruínas da antiga ponte de arcos na foz do Rio São João", "en": "Ruins of the old arched bridge at the mouth of the São João River", "es": "Ruinas del antiguo puente de arcos en la desembocadura del río São João"} },
  { destino: "img/poi/casimiro-morro-sao-joao", arquivo: "File:Sombras na areia.JPG", autor: "Raku90",
    alt: {"pt": "Morro de São João visto da Prainha de Barra de São João ao entardecer", "en": "Morro de São João seen from Prainha beach, Barra de São João, at dusk", "es": "Morro de São João visto desde la Prainha de Barra de São João al atardecer"} },
  { destino: "img/poi/casimiro-museu", arquivo: "File:Capela São João Batista.jpg", autor: "Ariguimmares",
    alt: {"pt": "Capela de São João Batista junto à praia, em Barra de São João", "en": "São João Batista Chapel by the beach in Barra de São João", "es": "Capilla de São João Batista junto a la playa, en Barra de São João"} },
  { destino: "img/poi/casimiro-rio-macae", arquivo: "File:Rio Macaé - Cascata - panoramio (7).jpg", autor: "TMbux",
    alt: {"pt": "Corredeira do Rio Macaé entre pedras e mata", "en": "Rapids of the Macaé River among rocks and forest", "es": "Rápidos del río Macaé entre rocas y bosque"} },
  { destino: "img/poi/iguaba-capela", arquivo: "File:Capela N. Senhora da Conceição em Iguaba Grande - Rj. (8700512282).jpg", autor: "Marinelson Almeida",
    alt: {"pt": "Fachada branca com detalhes azul-turquesa da Capela de Nossa Senhora da Conceição, entre palmeiras", "en": "White façade with turquoise trim of the Chapel of Nossa Senhora da Conceição, among palm trees", "es": "Fachada blanca con detalles turquesa de la Capilla de Nossa Senhora da Conceição, entre palmeras"} },
  { destino: "img/poi/iguaba-ponta-da-farinha", arquivo: "File:Ubas, Iguaba Grande - RJ, Brazil - panoramio (5).jpg",
    alt: {"pt": "Areia clara da Praia dos Ubás na margem da lagoa, com morro coberto de mata ao fundo", "en": "Pale sand of Praia dos Ubás on the lagoon shore, with a wooded hill behind", "es": "Arena clara de la Praia dos Ubás a orillas de la laguna, con un cerro cubierto de bosque al fondo"} },
  { destino: "img/poi/iguaba-pieres", arquivo: "File:1029888-I.jpg", descartarBase: 0.14,
    alt: {"pt": "Píer de madeira entrando na lagoa em Iguaba Grande, com banhistas e um barco sob céu nublado", "en": "Wooden pier reaching into the lagoon at Iguaba Grande, with swimmers and a boat under a cloudy sky", "es": "Muelle de madera que entra en la laguna en Iguaba Grande, con bañistas y un barco bajo un cielo nublado"} },
  { destino: "img/poi/iguaba-lagoa", arquivo: "File:PRAIA DA FARINHA IGUABA GRANDE RIO DE JANEIRO BRAZIL.jpg", autor: "DELANO CAMPELLO",
    alt: {"pt": "Praia da Farinha, na margem da lagoa em Iguaba Grande", "en": "Praia da Farinha, on the lagoon shore in Iguaba Grande", "es": "Praia da Farinha, a orillas de la laguna en Iguaba Grande"} },
  { destino: "img/poi/ostras-costazul", arquivo: "File:Costa Azul Rio das Ostras.jpg", autor: "Mateus Berteges",
    alt: {"pt": "Formações rochosas e mar azul-turquesa na Praia de Costazul", "en": "Rock formations and turquoise sea at Costazul beach", "es": "Formaciones rocosas y mar turquesa en la playa de Costazul"} },
  { destino: "img/poi/ostras-costoes", arquivo: "File:Costões rochosos 1.jpg", autor: "Alexandre Machado Ferreira Junior",
    alt: {"pt": "Trilha entre vegetação de restinga até os costões rochosos à beira-mar", "en": "Trail through coastal scrub down to the rocky shore", "es": "Sendero entre vegetación costera hasta los acantilados rocosos junto al mar"} },
  { destino: "img/poi/ostras-pier", arquivo: "File:RioOstras3.jpg", autor: "Fulviusbsas",
    alt: {"pt": "Píer avançando sobre o mar, praia com guarda-sóis e quiosques em primeiro plano", "en": "Pier reaching into the sea, beach with umbrellas and kiosks in the foreground", "es": "Muelle que se adentra en el mar, playa con sombrillas y quioscos en primer plano"} },
  { destino: "img/poi/ostras-praca-da-baleia", arquivo: "File:ThiagoFreitas Praca da Baleia Rio das Ostras RJ (40160022185).jpg", autor: "Thiago Freitas / MTur Destinos",
    alt: {"pt": "Escultura de baleia jubarte em tamanho real na Praça da Baleia, sob céu azul", "en": "Life-size humpback whale sculpture at Praça da Baleia, under blue sky", "es": "Escultura de ballena jorobada a tamaño real en la Praça da Baleia, bajo cielo azul"} },
  { destino: "img/poi/saquarema-itauna", arquivo: "File:Itaúna Beach.jpg", autor: "gspr",
    alt: {"pt": "Praia de Itaúna em manhã de névoa, com o morro da igreja de Nazareth ao fundo", "en": "Itaúna beach on a misty morning, with the Nazareth church hill in the distance", "es": "Playa de Itaúna en una mañana con bruma, con el morro de la iglesia de Nazareth al fondo"} },
  { destino: "img/poi/saquarema-lagoa", arquivo: "File:Vista de Saquarema - Igreja Nossa Senhora de Nazareth.jpg", autor: "Jessicathehuman",
    alt: {"pt": "Lagoa de Saquarema e a cidade vistas do morro da igreja, com serras ao fundo", "en": "Saquarema Lagoon and town seen from the church hill, with mountains behind", "es": "Laguna de Saquarema y la ciudad vistas desde el morro de la iglesia, con sierras al fondo"} },
  { destino: "img/poi/saquarema-nazareth", arquivo: "File:Igreja de Nª Sra de Nazareth, Saquarema - Entardecer.jpg", autor: "Cleo Fernando Martins Machado",
    alt: {"pt": "Igreja de Nossa Senhora de Nazareth ao entardecer", "en": "Our Lady of Nazareth Church at dusk", "es": "Iglesia de Nuestra Señora de Nazareth al atardecer"} },
  { destino: "img/poi/saquarema-vila", arquivo: "File:Pôr do Sol rochedos de Saquarema.jpg", autor: "Cleo Fernando Martins Machado",
    alt: {"pt": "Rochedos da Praia da Vila ao pôr do sol, com ondas e nuvens alaranjadas", "en": "Praia da Vila rocks at sunset, with waves and orange-lit clouds", "es": "Rocas de la Praia da Vila al atardecer, con olas y nubes anaranjadas"} },
  { destino: "img/poi/silva-jardim-aldeia-velha", arquivo: "File:RPPN Aldeia Velha2.jpg", autor: "Rafael Deminicis",
    alt: {"pt": "Rio de água clara correndo entre pedras arredondadas em Aldeia Velha", "en": "Clear river flowing between rounded boulders in Aldeia Velha", "es": "Río de agua clara corriendo entre piedras redondeadas en Aldeia Velha"} },
  { destino: "img/poi/silva-jardim-parque-do-mico", arquivo: "File:RPPN Parque do Mico-LUIZ ANTONIO ARRUDA(008).jpg", autor: "Luiz Antonio Arruda",
    alt: {"pt": "Dois micos-leões-dourados lado a lado num galho, na mata da RPPN Parque do Mico", "en": "Two golden lion tamarins side by side on a branch in the forest of the Parque do Mico Reserve", "es": "Dos monos león dorado uno al lado del otro en una rama, en el bosque de la Reserva Parque do Mico"} },
  { destino: "img/poi/silva-jardim-poco-das-antas", arquivo: "File:Mico-leão-dourado-REBIO de Poço das Antas-Julio Morais Fine Art(004).jpg", autor: "Julio Morais Fine Art",
    alt: {"pt": "Mico-leão-dourado num galho na mata da Reserva Biológica de Poço das Antas", "en": "Golden lion tamarin on a branch in the Poço das Antas Biological Reserve", "es": "Tití león dorado en una rama en la Reserva Biológica de Poço das Antas"} },
]

// Commons devolve erro de banco em rajada; refazer so as que falharam nao rebaixa as 70.
const pedidas = process.argv.slice(2)
const alvo = pedidas.length ? FIXAS.filter((f) => pedidas.includes(f.destino)) : FIXAS
const encontradas = await executar(alvo)

const anterior: Record<string, unknown> = pedidas.length
  ? JSON.parse(await readFile('content/fotos.json', 'utf8'))
  : {}
const catalogo = Object.fromEntries(
  encontradas.map((foto: FotoEncontrada) => {
    const fixa = FIXAS.find((f) => f.destino === foto.destino)!
    const autor = fixa.autor ?? foto.autor
    return [
      foto.destino,
      {
        credito: credito({ ...foto, autor }),
        autor,
        licenca: foto.licenca,
        pagina: foto.paginaDaFoto,
        arquivo: foto.titulo,
        alt: fixa.alt,
      },
    ]
  }),
)

const destinos = new Set(FIXAS.map((f) => f.destino))
const final = Object.fromEntries(
  Object.entries({ ...anterior, ...catalogo }).filter(([destino]) => destinos.has(destino)).sort(),
)
await writeFile('content/fotos.json', JSON.stringify(final, null, 2) + '\n', 'utf8')
console.log(`\n${encontradas.length} de ${alvo.length} baixadas. Catalogo em content/fotos.json.`)
if (encontradas.length < alvo.length) process.exitCode = 1
