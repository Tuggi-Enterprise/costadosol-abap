import type { Metadata } from 'next'
import { rotulos } from './interface.ts'

/**
 * Os metadados do site — o que aparece na aba, na busca e no cartao de compartilhamento.
 *
 * Moram aqui, e nao no layout, porque sao a unica copy publicada que nenhuma tela mostra:
 * ninguem os ve revisando o site, e foi assim que a frase "os nove municipios do
 * Conderlagos" ficou no preview de todo link depois de P-29 ter proibido contar cidade.
 * Fora do arquivo de layout eles podem ser lidos por teste — e sao (testes/interface).
 *
 * CS-ARQ-005: dominio de construcao, trocado em 14/08/2026 por decisao do operador. Era
 * `costadosol.tuggi.app`, dominio de terceiro com o nome antigo; passa a ser dominio do
 * proprio consorcio. **O QR impresso carrega o dominio dentro dele**: QR gerado antes desta
 * troca aponta para o host velho, e reimprimir mesa e coisa de grafica, nao de deploy.
 *
 * Sem base absoluta, `og:image` sai como caminho relativo e o cartao que o gabinete
 * municipal posta (CS-MUN-003) chega sem imagem.
 */
export const SITE_URL = process.env['SITE_URL'] ?? 'https://revista.conderlagos.com.br'

export const metadataDoSite: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Conderlagos',
  description: rotulos('pt').chamadaDaCapa,
}
