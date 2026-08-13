/**
 * A lista de fotos a buscar, e o unico lugar onde ela existe.
 *
 * Saida: public/img/**.webp|.avif e content/fotos.json com autor e licenca de cada uma.
 * O que nao tiver foto com licenca aceita fica de fora do JSON, e o conteudo usa o
 * marcador de foto pendente — melhor um espaco vazio honesto do que uma foto errada.
 *
 *   npx tsx scripts/fotos-do-conteudo.ts
 */
import { writeFile } from 'node:fs/promises'
import { credito, executar, type Busca, type FotoEncontrada } from './buscar-fotos.ts'

const FORA = ['map', 'mapa', 'flag', 'bandeira', 'brasão', 'coat of arms', 'logo', 'seal']

const BUSCAS: Busca[] = [
  // Heros de municipio
  { destino: 'img/mun/araruama', termos: 'Araruama lagoa vista', exigir: ['araruama'], excluir: FORA },
  { destino: 'img/mun/arraial-do-cabo', termos: 'Arraial do Cabo praia', exigir: ['arraial'], excluir: FORA },
  { destino: 'img/mun/cabo-frio', termos: 'Cabo Frio praia do forte', exigir: ['cabo frio', 'cabofrio'], excluir: FORA },
  { destino: 'img/mun/casimiro-de-abreu', termos: 'Casimiro de Abreu Rio de Janeiro', exigir: ['casimiro de abreu', 'barra de sao joao'], excluir: FORA },
  { destino: 'img/mun/iguaba-grande', termos: 'Iguaba Grande lagoa', exigir: ['iguaba'], excluir: FORA },
  { destino: 'img/mun/rio-das-ostras', termos: 'Rio das Ostras praia', exigir: ['rio das ostras'], excluir: FORA },
  { destino: 'img/mun/sao-pedro-da-aldeia', termos: 'São Pedro da Aldeia lagoa', exigir: ['sao pedro da aldeia', 'spa rj', 'spedroaldeia'], excluir: FORA },
  { destino: 'img/mun/saquarema', termos: 'Saquarema praia Itaúna', exigir: ['saquarema'], excluir: FORA },
  { destino: 'img/mun/silva-jardim', termos: 'Silva Jardim Rio de Janeiro', exigir: ['silva jardim', 'poco das antas'], excluir: FORA },

  // Pontos
  { destino: 'img/poi/araruama-lagoa', termos: 'Lagoa de Araruama', exigir: ['araruama'], excluir: FORA },
  { destino: 'img/poi/araruama-praia-seca', termos: 'Praia Seca Araruama', exigir: ['praia seca'], excluir: FORA },
  { destino: 'img/poi/araruama-massambaba', termos: 'Massambaba restinga', exigir: ['massambaba'], excluir: FORA },
  { destino: 'img/poi/araruama-juturnaiba', termos: 'Lagoa de Juturnaíba', exigir: ['juturnaiba'], excluir: FORA },

  { destino: 'img/poi/arraial-prainhas', termos: 'Prainhas do Pontal do Atalaia', exigir: ['pontal', 'prainhas'], excluir: FORA },
  { destino: 'img/poi/arraial-farol', termos: 'Ilha do Cabo Frio farol praia', exigir: ['farol', 'ilha do cabo frio'], excluir: FORA },
  { destino: 'img/poi/arraial-anjos', termos: 'Praia dos Anjos Arraial do Cabo', exigir: ['anjos'], excluir: FORA },
  { destino: 'img/poi/arraial-forno', termos: 'Praia do Forno Arraial do Cabo', exigir: ['forno'], excluir: FORA },

  { destino: 'img/poi/cabo-frio-forte', termos: 'Forte São Mateus Cabo Frio', exigir: ['forte de sao mateus', 'forte sao mateus'], excluir: FORA },
  { destino: 'img/poi/cabo-frio-praia-do-forte', termos: 'Praia do Forte Cabo Frio', exigir: ['praia do forte'], excluir: FORA },
  { destino: 'img/poi/cabo-frio-pero', termos: 'Praia do Peró Cabo Frio', exigir: ['pero'], excluir: FORA },
  { destino: 'img/poi/cabo-frio-itajuru', termos: 'Canal do Itajuru Cabo Frio', exigir: ['itajuru'], excluir: FORA },

  { destino: 'img/poi/casimiro-morro-sao-joao', termos: 'Morro de São João Casimiro de Abreu', exigir: ['morro de sao joao', 'morro sao joao'], excluir: FORA },
  { destino: 'img/poi/casimiro-rio-macae', termos: 'Rio Macaé', exigir: ['macae'], excluir: FORA },
  { destino: 'img/poi/casimiro-barra-de-sao-joao', termos: 'Barra de São João Casimiro de Abreu', exigir: ['barra de sao joao'], excluir: FORA },
  { destino: 'img/poi/casimiro-museu', termos: 'Casimiro de Abreu poeta', exigir: ['casimiro de abreu'], excluir: FORA },

  { destino: 'img/poi/iguaba-pedra-da-salga', termos: 'Pedra da Salga Iguaba', exigir: ['salga'], excluir: FORA },
  { destino: 'img/poi/iguaba-sapeatiba', termos: 'Sapeatiba Iguaba Grande', exigir: ['sapeatiba'], excluir: FORA },
  { destino: 'img/poi/iguaba-santa-rita', termos: 'Ilha de Santa Rita Iguaba Grande', exigir: ['santa rita'], excluir: FORA },
  { destino: 'img/poi/iguaba-lagoa', termos: 'Iguaba Grande praia lagoa', exigir: ['iguaba'], excluir: FORA },

  { destino: 'img/poi/ostras-praca-da-baleia', termos: 'Praça da Baleia Rio das Ostras', exigir: ['baleia'], excluir: FORA },
  { destino: 'img/poi/ostras-costazul', termos: 'Costazul Rio das Ostras', exigir: ['costazul'], excluir: FORA },
  { destino: 'img/poi/ostras-pier', termos: 'Rio das Ostras píer', exigir: ['rio das ostras'], excluir: FORA },
  { destino: 'img/poi/ostras-costoes', termos: 'Rio das Ostras costão rochoso', exigir: ['rio das ostras'], excluir: FORA },

  { destino: 'img/poi/aldeia-casa-da-flor', termos: 'Casa da Flor São Pedro da Aldeia', exigir: ['casa da flor'], excluir: FORA },
  { destino: 'img/poi/aldeia-igreja-matriz', termos: 'Igreja Matriz São Pedro da Aldeia', exigir: ['spedroaldeia', 'sao pedro da aldeia', 'igreja'], excluir: FORA },
  { destino: 'img/poi/aldeia-aviacao-naval', termos: 'Museu da Aviação Naval São Pedro da Aldeia', exigir: ['sao pedro da aldeia', 'aviacao naval'], excluir: FORA },
  { destino: 'img/poi/aldeia-sudoeste', termos: 'São Pedro da Aldeia praia', exigir: ['sao pedro da aldeia', 'spa rj'], excluir: FORA },

  { destino: 'img/poi/saquarema-itauna', termos: 'Praia de Itaúna Saquarema surf', exigir: ['itauna'], excluir: FORA },
  { destino: 'img/poi/saquarema-nazareth', termos: 'Igreja Nossa Senhora de Nazareth Saquarema', exigir: ['nazareth', 'nazare'], excluir: FORA },
  { destino: 'img/poi/saquarema-lagoa', termos: 'Lagoa de Saquarema', exigir: ['saquarema'], excluir: FORA },
  { destino: 'img/poi/saquarema-vila', termos: 'Saquarema praia da vila', exigir: ['saquarema'], excluir: FORA },

  { destino: 'img/poi/silva-jardim-poco-das-antas', termos: 'mico-leão-dourado Leontopithecus rosalia', exigir: ['mico-leao', 'leontopithecus', 'poco das antas'], excluir: FORA },
  { destino: 'img/poi/silva-jardim-sete-quedas', termos: 'Silva Jardim cachoeira', exigir: ['silva jardim'], excluir: FORA },
  { destino: 'img/poi/silva-jardim-aldeia-velha', termos: 'Aldeia Velha Silva Jardim', exigir: ['aldeia velha'], excluir: FORA },
  { destino: 'img/poi/silva-jardim-juturnaiba', termos: 'Silva Jardim Rio de Janeiro igreja', exigir: ['silva jardim', 'juturnaiba'], excluir: FORA },
]

const encontradas = await executar(BUSCAS)

const catalogo = Object.fromEntries(
  encontradas.map((foto: FotoEncontrada) => [
    foto.destino,
    {
      credito: credito(foto),
      autor: foto.autor,
      licenca: foto.licenca,
      pagina: foto.paginaDaFoto,
      arquivo: foto.titulo,
    },
  ]),
)

await writeFile('content/fotos.json', JSON.stringify(catalogo, null, 2) + '\n', 'utf8')
console.log(`\n${encontradas.length} de ${BUSCAS.length} com licenca aceita. Catalogo em content/fotos.json.`)
