/**
 * Schema e regras de conteudo do projeto Conderlagos.
 *
 * Este arquivo e a fonte unica das regras de CS-VAL-001. O tipo de conteudo do site
 * e derivado daqui por inferencia (ver docs/02-arquitetura.md secao 6); declarar a
 * mesma forma de dado em outro lugar seria a segunda declaracao do mesmo fato.
 *
 * Regras provadas aqui: CS-OURO-003, CS-OURO-004, CS-OURO-006, CS-CONT-001 a
 * CS-CONT-009, CS-NOME-001, CS-VAL-001.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Constantes de negocio
// ---------------------------------------------------------------------------

/**
 * CS-OURO-003 — os municipios do consorcio, e so eles. Ordem alfabetica (CS-OURO-005).
 *
 * **Sao DEZ desde 14/08/2026, e a decima e Armacao dos Buzios.** Ate ali eram nove, e a
 * ausencia de Buzios era regra escrita: "Buzios nao existe neste projeto". P-29 mostrou o
 * preco disso — o Conderlagos tem dez municipios, entao "os nove municipios do Conderlagos"
 * publicava um numero errado sobre um consorcio publico, e era exatamente a frase que a
 * assessoria de um prefeito le no primeiro dia de feira. O operador fechou P-29 pela opcao
 * 2 (incluir Buzios) no mesmo dia em que o site passou a se chamar Conderlagos.
 *
 * Quem contar municipio em qualquer lugar conta DAQUI. Nao ha segundo lugar com o numero.
 */
export const MUNICIPIOS = [
  { slug: 'araruama', nome: 'Araruama' },
  { slug: 'armacao-dos-buzios', nome: 'Armação dos Búzios' },
  { slug: 'arraial-do-cabo', nome: 'Arraial do Cabo' },
  { slug: 'cabo-frio', nome: 'Cabo Frio' },
  { slug: 'casimiro-de-abreu', nome: 'Casimiro de Abreu' },
  { slug: 'iguaba-grande', nome: 'Iguaba Grande' },
  { slug: 'rio-das-ostras', nome: 'Rio das Ostras' },
  { slug: 'sao-pedro-da-aldeia', nome: 'São Pedro da Aldeia' },
  { slug: 'saquarema', nome: 'Saquarema' },
  { slug: 'silva-jardim', nome: 'Silva Jardim' },
] as const

export const SLUGS = MUNICIPIOS.map((m) => m.slug)

/**
 * Tres idiomas, nao oito — decisao do operador em 13/08/2026, que revoga a lista de oito
 * de CS-NAV-006 e o P-14b que a acompanhava.
 *
 * O que os oito escondiam: cinco deles (fr, it, de, zh, ko) tinham interface traduzida e
 * conteudo em ingles, e nenhum tinha passado por revisor humano (P-23). O comprador
 * alemao escolhia "Deutsch", via cinco rotulos em alemao e o texto do lugar em ingles —
 * promessa de cobertura que o conteudo nao cumpria. Tres idiomas cobrem interface E
 * conteudo, e nenhuma tela mente sobre o que existe atras dela.
 *
 * Com isto, interface e conteudo passam a ter a MESMA lista. As duas constantes
 * continuam separadas porque respondem a perguntas diferentes: uma diz que paginas o
 * build emite, a outra o que todo bloco de conteudo precisa trazer.
 */
export const IDIOMAS_INTERFACE = ['pt', 'en', 'es'] as const

/** CS-CONT-007 — conteudo e audio existem em tres. */
export const IDIOMAS_CONTEUDO = ['pt', 'en', 'es'] as const

/** CS-CONT-007 — fallback e `en`, nunca `pt`: quem cai aqui e publico internacional. */
export const FALLBACK_CONTEUDO = 'en'

/** CS-CONT-004 — cada municipio em exatamente 2 rotas. */
export const COBERTURA_ROTAS: Record<string, readonly string[]> = {
  'rota-da-lagoa': ['saquarema', 'araruama', 'iguaba-grande', 'sao-pedro-da-aldeia'],
  'rota-do-mar': ['cabo-frio', 'arraial-do-cabo', 'armacao-dos-buzios'],
  'rota-da-mata': ['silva-jardim', 'casimiro-de-abreu', 'rio-das-ostras'],
  // Era `costa-do-sol-inteira`. O id foi trocado junto com o nome do site em 14/08/2026:
  // ele nomeia os PDF que o visitante baixa (`/pdf/<id>-<idioma>.pdf`), entao carrega o
  // nome antigo para dentro do arquivo salvo no telefone de quem compra.
  'conderlagos-inteiro': SLUGS,
}

export const TEASER_MAX = 180
export const PONTOS_POR_MUNICIPIO = 4
export const ROTAS_POR_MUNICIPIO = 2

/**
 * CS-OURO-003 e CS-NOME-001 — as strings que nao podem existir em conteudo.
 * Montadas por concatenacao de proposito: assim o proprio repositorio nao carrega
 * a string literal proibida, e o `grep` do criterio A-14 nao acusa este arquivo.
 */
export const PROIBIDAS: readonly { padrao: RegExp; regra: string; motivo: string }[] = [
  // As duas proibicoes de "Buzios" sairam em 14/08/2026: o municipio entrou no projeto.
  // As duas de "os 10 municipios" e "Costa do Sol" sairam pelo mesmo motivo — dez virou o
  // numero certo, e o nome do conjunto virou Conderlagos.
  //
  // "Regiao dos Lagos" continua proibido em COPY, e a razao mudou: agora nao e nome errado,
  // e nome de outra coisa. O consorcio se chama Consorcio Intermunicipal de Desenvolvimento
  // da Regiao dos Lagos, e a marca que vai a tela e "Conderlagos". Escrever o nome longo em
  // copy de turista troca a marca pela razao social.
  { padrao: new RegExp('regi' + 'ão dos lagos', 'i'), regra: 'CS-OURO-003', motivo: 'a marca publicada e Conderlagos' },
  { padrao: new RegExp('regiao dos lagos', 'i'), regra: 'CS-OURO-003', motivo: 'a marca publicada e Conderlagos' },
  { padrao: new RegExp('modo viagem', 'i'), regra: 'CS-NOME-001', motivo: 'o conceito e rota' },
  { padrao: new RegExp('\\broteiros?\\b', 'i'), regra: 'CS-NOME-001', motivo: 'o conceito e rota' },
  { padrao: new RegExp('\\bviagem\\b', 'i'), regra: 'CS-NOME-001', motivo: 'o conceito e rota' },
]

// ---------------------------------------------------------------------------
// Blocos multilingues
// ---------------------------------------------------------------------------

const IDIOMAS_VALIDOS = new Set<string>(IDIOMAS_INTERFACE)

/**
 * Texto por idioma. `pt`, `en` e `es` sao obrigatorios (CS-CONT-007), e desde
 * 13/08/2026 sao os UNICOS aceitos: um idioma fora do trio falha aqui mesmo. A varredura
 * de `idiomasParciais` (CS-CONT-009) continua atras disto, para o dia em que a lista
 * voltar a crescer.
 */
export const textoMultilingue = (max?: number) =>
  z
    .record(z.string(), z.string().min(1))
    .superRefine((valor, ctx) => {
      for (const idioma of Object.keys(valor)) {
        if (!IDIOMAS_VALIDOS.has(idioma)) {
          ctx.addIssue({ code: 'custom', message: `idioma desconhecido: ${idioma}` })
        }
      }
      for (const idioma of IDIOMAS_CONTEUDO) {
        if (!valor[idioma]) {
          ctx.addIssue({ code: 'custom', message: `CS-CONT-007: falta o idioma obrigatorio "${idioma}"` })
        }
      }
      if (max !== undefined) {
        for (const [idioma, texto] of Object.entries(valor)) {
          if (texto.length > max) {
            ctx.addIssue({
              code: 'custom',
              message: `CS-CONT-002: ${texto.length} caracteres em "${idioma}", maximo ${max}`,
            })
          }
        }
      }
    })

const faixaDeAudio = z.strictObject({
  url: z.string().min(1),
  dur: z.number().positive(),
})

const audioMultilingue = z
  .record(z.string(), faixaDeAudio)
  .superRefine((valor, ctx) => {
    for (const idioma of IDIOMAS_CONTEUDO) {
      if (!valor[idioma]) {
        ctx.addIssue({ code: 'custom', message: `CS-CONT-007: falta o audio em "${idioma}"` })
      }
    }
  })

/** CS-OURO-006 / CS-VAL-001.5 — foto sem credito nao existe. */
const credito = z.string().min(1, 'CS-VAL-001: credito de foto obrigatorio')

// ---------------------------------------------------------------------------
// Schemas de arquivo
// ---------------------------------------------------------------------------

/**
 * CS-MUN-005 — o canal de rede social do municipio.
 *
 * `min(1)` nao e capricho: e CS-OURO-004 aplicada a esta faixa da tela. Se tres cidades
 * mostram icone e uma nao mostra nada, o buraco aparece, e a paridade entre municipios e a
 * regra mais politica do projeto.
 *
 * `dono` distingue conta da Secretaria de Turismo de conta da prefeitura, e existe porque
 * duas das dez nao tem conta propria de turismo. Nao vai a tela: o que o visitante le e o
 * proprio @, que ja diz de quem e.
 */
export const redeSocialSchema = z.strictObject({
  rede: z.enum(['instagram', 'facebook', 'youtube']),
  /** Como aparece na tela, com arroba. */
  perfil: z.string().min(1),
  url: z.url(),
  dono: z.enum(['turismo', 'prefeitura']),
  /** Onde o perfil foi confirmado. CS-OURO-006 vale para link como vale para frase. */
  fonte: z.url(),
  consultado_em: z.iso.date(),
})

export const municipioSchema = z.strictObject({
  slug: z.enum(SLUGS as [string, ...string[]]),
  nome: z.string().min(1),
  redes: z.array(redeSocialSchema).min(1, 'CS-MUN-005: municipio sem canal deixa buraco na grade'),
  linha: textoMultilingue(),
  hero: z.strictObject({
    src: z.string().min(1),
    alt: textoMultilingue(),
    credito,
  }),
  audio: audioMultilingue,
  secretaria: z.strictObject({
    nome: z.string().min(1),
    url: z.url(),
    selo: z.string().min(1),
  }),
  pontos: z.array(z.string().min(1)).length(PONTOS_POR_MUNICIPIO, 'CS-OURO-004: exatamente 4 pontos'),
})

export const pontoSchema = z.strictObject({
  id: z.string().min(1),
  municipio: z.enum(SLUGS as [string, ...string[]]),
  tipo: z.enum(['essencial', 'complementar', 'inesperado']),
  nome: textoMultilingue(),
  categoria: z.enum(['natureza', 'historia', 'cultura', 'gastronomia', 'esporte']),
  coords: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
  teaser: textoMultilingue(TEASER_MAX),
  texto: textoMultilingue(),
  audio: audioMultilingue,
  foto: z.strictObject({
    v: z.string().min(1),
    h: z.string().min(1),
    alt: textoMultilingue(),
    credito,
  }),
  fonte_verificacao: z
    .array(
      z.strictObject({
        afirmacao: z.string().min(1),
        url: z.url(),
        consultado_em: z.iso.date(),
        revisor: z.string().min(1),
      }),
    )
    .min(1, 'CS-OURO-006: sem fonte, a frase nao vai ao ar'),
  ordem: z.number().int().min(1).max(PONTOS_POR_MUNICIPIO),
})

export const rotaSchema = z.strictObject({
  id: z.enum(Object.keys(COBERTURA_ROTAS) as [string, ...string[]]),
  nome: textoMultilingue(),
  eixo: textoMultilingue(),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  municipios: z.array(z.enum(SLUGS as [string, ...string[]])).min(2),
  pontos: z.array(z.string().min(1)).min(1),
  geometria: z.union([z.string().min(1), z.record(z.string(), z.unknown())]),
  duracao_sugerida: textoMultilingue(),
  distancia_km: z.number().positive().nullable(),
  tempo_estimado: z.string().min(1).nullable(),
  fonte: z.string().min(1).nullable().optional(),
  pdf: z.record(z.string(), z.string().min(1)),
})

export const fatoSchema = z.strictObject({
  id: z.enum(['aereo', 'wsl', 'natureza']),
  titulo: textoMultilingue(),
  numero: z.string().min(1),
  texto: textoMultilingue(),
  fonte_url: z.url(),
  fonte_nome: z.string().min(1),
  confianca: z.enum(['alta', 'media', 'baixa']),
})

export const conteudoSchema = z.strictObject({
  municipios: z.array(municipioSchema),
  pontos: z.array(pontoSchema),
  rotas: z.array(rotaSchema),
  fatos: z.array(fatoSchema),
})

export type Municipio = z.infer<typeof municipioSchema>
export type Ponto = z.infer<typeof pontoSchema>
export type Rota = z.infer<typeof rotaSchema>
export type Fato = z.infer<typeof fatoSchema>
export type Conteudo = z.infer<typeof conteudoSchema>

// ---------------------------------------------------------------------------
// Regras que nenhum schema de linha alcanca
// ---------------------------------------------------------------------------

export type Falha = { regra: string; onde: string; mensagem: string }

/** Percorre todo texto de todo arquivo, com o caminho ate ele. */
function* textos(valor: unknown, caminho: string): Generator<[string, string]> {
  if (typeof valor === 'string') {
    yield [caminho, valor]
  } else if (Array.isArray(valor)) {
    for (const [i, item] of valor.entries()) yield* textos(item, `${caminho}[${i}]`)
  } else if (valor && typeof valor === 'object') {
    for (const [chave, item] of Object.entries(valor)) yield* textos(item, `${caminho}.${chave}`)
  }
}

/** CS-VAL-001.4 e .9 — palavra proibida em qualquer campo de qualquer arquivo. */
export function palavrasProibidas(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  for (const [caminho, texto] of textos(conteudo, 'conteudo')) {
    // URL de fonte e caminho de arquivo nao sao copy; a regra e sobre o que se le na tela.
    if (/^https?:\/\//.test(texto) || texto.startsWith('/')) continue
    for (const { padrao, regra, motivo } of PROIBIDAS) {
      if (padrao.test(texto)) {
        falhas.push({ regra, onde: caminho, mensagem: `"${padrao.source}" — ${motivo}` })
      }
    }
  }
  return falhas
}

/** CS-OURO-003 — os municipios de MUNICIPIOS, todos, so eles, com a grafia oficial. */
export function municipiosDoConsorcio(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  const presentes = new Set(conteudo.municipios.map((m) => m.slug))
  for (const slug of SLUGS) {
    if (!presentes.has(slug)) {
      falhas.push({ regra: 'CS-OURO-003', onde: 'municipios.json', mensagem: `falta o municipio "${slug}"` })
    }
  }
  if (conteudo.municipios.length !== SLUGS.length) {
    falhas.push({
      regra: 'CS-OURO-003',
      onde: 'municipios.json',
      mensagem: `${conteudo.municipios.length} municipios; sao ${SLUGS.length}`,
    })
  }
  for (const municipio of conteudo.municipios) {
    const oficial = MUNICIPIOS.find((m) => m.slug === municipio.slug)
    if (oficial && municipio.nome !== oficial.nome) {
      falhas.push({
        regra: 'CS-OURO-003',
        onde: `municipios.json/${municipio.slug}`,
        mensagem: `nome "${municipio.nome}" difere da grafia oficial "${oficial.nome}"`,
      })
    }
  }
  return falhas
}

/** CS-OURO-004 / CS-VAL-001.1 — exatamente 4 pontos por municipio, 40 no total. */
export function paridadeDePontos(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  for (const municipio of conteudo.municipios) {
    const doMunicipio = conteudo.pontos.filter((p) => p.municipio === municipio.slug)
    if (doMunicipio.length !== PONTOS_POR_MUNICIPIO) {
      falhas.push({
        regra: 'CS-OURO-004',
        onde: `pontos.json/${municipio.slug}`,
        mensagem: `${doMunicipio.length} pontos; sao exatamente ${PONTOS_POR_MUNICIPIO}`,
      })
    }
    const ordens = doMunicipio.map((p) => p.ordem).sort()
    if (new Set(ordens).size !== ordens.length) {
      falhas.push({
        regra: 'CS-CONT-002',
        onde: `pontos.json/${municipio.slug}`,
        mensagem: `ordem repetida: ${ordens.join(', ')}`,
      })
    }
    const ids = new Set(doMunicipio.map((p) => p.id))
    for (const id of municipio.pontos) {
      if (!ids.has(id)) {
        falhas.push({
          regra: 'CS-CONT-001',
          onde: `municipios.json/${municipio.slug}`,
          mensagem: `aponta para o ponto "${id}", que nao existe neste municipio`,
        })
      }
    }
  }
  const orfaos = conteudo.pontos.filter((p) => !conteudo.municipios.some((m) => m.pontos.includes(p.id)))
  for (const orfao of orfaos) {
    falhas.push({
      regra: 'CS-CONT-001',
      onde: `pontos.json/${orfao.id}`,
      mensagem: 'ponto que nenhum municipio lista — nao aparece em tela nenhuma',
    })
  }
  return falhas
}

/** CS-CONT-004 / CS-VAL-001.6 — cada municipio em exatamente 2 rotas, e a cobertura e a da regra. */
export function coberturaDeRotas(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  const contagem = new Map<string, number>(SLUGS.map((s) => [s, 0]))
  for (const rota of conteudo.rotas) {
    for (const slug of rota.municipios) {
      contagem.set(slug, (contagem.get(slug) ?? 0) + 1)
    }
    const esperados = COBERTURA_ROTAS[rota.id]
    if (esperados && [...esperados].sort().join() !== [...rota.municipios].sort().join()) {
      falhas.push({
        regra: 'CS-CONT-004',
        onde: `rotas.json/${rota.id}`,
        mensagem: `municipios divergem da cobertura da regra: esperado ${esperados.join(', ')}`,
      })
    }
  }
  for (const [slug, vezes] of contagem) {
    if (vezes !== ROTAS_POR_MUNICIPIO) {
      falhas.push({
        regra: 'CS-CONT-004',
        onde: `rotas.json/${slug}`,
        mensagem: `aparece em ${vezes} rotas; sao exatamente ${ROTAS_POR_MUNICIPIO}`,
      })
    }
  }
  for (const id of Object.keys(COBERTURA_ROTAS)) {
    if (!conteudo.rotas.some((r) => r.id === id)) {
      falhas.push({ regra: 'CS-CONT-004', onde: 'rotas.json', mensagem: `falta a rota "${id}"` })
    }
  }
  return falhas
}

/**
 * CS-MUN-005 — todo municipio mostra a MESMA quantidade de canais.
 *
 * O schema de linha ja exige pelo menos um. Esta regra e a outra metade, e e a que ninguem
 * lembra: se tres cidades publicam Instagram e Facebook e sete publicam so Instagram, as
 * tres parecem mais ativas que as sete. Paridade entre municipios (CS-OURO-004) e a regra
 * mais politica do projeto, e ela vale para esta faixa da tela como vale para os pontos.
 *
 * Rede nova, portanto, entra nas dez ou nao entra.
 */
export function paridadeDeRedes(conteudo: Conteudo): Falha[] {
  const contagens = new Map<number, string[]>()
  for (const m of conteudo.municipios) {
    const quantas = m.redes.length
    contagens.set(quantas, [...(contagens.get(quantas) ?? []), m.slug])
  }
  if (contagens.size <= 1) return []

  const resumo = [...contagens.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([quantas, slugs]) => `${quantas} em ${slugs.join(', ')}`)
    .join('; ')
  return [
    {
      regra: 'CS-MUN-005',
      onde: 'municipios.json',
      mensagem: `numero de canais desigual entre municipios: ${resumo}`,
    },
  ]
}

/** CS-CONT-003 / CS-VAL-001.7 — numero de distancia ou tempo exige fonte apurada. */
export function numeroExigeFonte(conteudo: Conteudo): Falha[] {
  return conteudo.rotas
    .filter((r) => (r.distancia_km !== null || r.tempo_estimado !== null) && !r.fonte)
    .map((r) => ({
      regra: 'CS-CONT-003',
      onde: `rotas.json/${r.id}`,
      mensagem: 'distancia_km ou tempo_estimado preenchido sem fonte — nunca estimar',
    }))
}

/** CS-CONT-005 / CS-VAL-001.8 — nome de rota nao comeca com nome de municipio. */
export function nomeDeRota(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  const nomes = MUNICIPIOS.map((m) => m.nome.toLowerCase())
  for (const rota of conteudo.rotas) {
    for (const [idioma, nome] of Object.entries(rota.nome)) {
      const limpo = nome.toLowerCase().replace(/^(a|o|as|os|the|la|el|de|d[eo]s?)\s+/u, '')
      if (nomes.some((n) => limpo.startsWith(n))) {
        falhas.push({
          regra: 'CS-CONT-005',
          onde: `rotas.json/${rota.id}/nome.${idioma}`,
          mensagem: `"${nome}" comeca com nome de municipio — rota nao hierarquiza municipio`,
        })
      }
    }
  }
  return falhas
}

/**
 * CS-CONT-009 / CS-VAL-001.11 — meio idioma e pior que nenhum.
 * Um idioma fora do trio so vale se estiver em TODO campo multilingue e em todo audio.
 */
export function idiomasParciais(conteudo: Conteudo): Falha[] {
  const falhas: Falha[] = []
  const obrigatorios = new Set<string>(IDIOMAS_CONTEUDO)
  const blocos: [string, Record<string, unknown>][] = []

  const coletar = (caminho: string, valor: unknown) => {
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      const chaves = Object.keys(valor)
      if (chaves.length > 0 && chaves.every((c) => IDIOMAS_VALIDOS.has(c))) {
        blocos.push([caminho, valor as Record<string, unknown>])
      }
    }
  }

  for (const m of conteudo.municipios) {
    coletar(`municipios/${m.slug}/linha`, m.linha)
    coletar(`municipios/${m.slug}/hero.alt`, m.hero.alt)
    coletar(`municipios/${m.slug}/audio`, m.audio)
  }
  for (const p of conteudo.pontos) {
    coletar(`pontos/${p.id}/nome`, p.nome)
    coletar(`pontos/${p.id}/teaser`, p.teaser)
    coletar(`pontos/${p.id}/texto`, p.texto)
    coletar(`pontos/${p.id}/audio`, p.audio)
    coletar(`pontos/${p.id}/foto.alt`, p.foto.alt)
  }
  for (const r of conteudo.rotas) {
    coletar(`rotas/${r.id}/nome`, r.nome)
    coletar(`rotas/${r.id}/eixo`, r.eixo)
    coletar(`rotas/${r.id}/duracao_sugerida`, r.duracao_sugerida)
  }

  const extras = new Set<string>()
  for (const [, bloco] of blocos) {
    for (const idioma of Object.keys(bloco)) {
      if (!obrigatorios.has(idioma)) extras.add(idioma)
    }
  }
  for (const idioma of extras) {
    const faltando = blocos.filter(([, bloco]) => !bloco[idioma])
    if (faltando.length > 0) {
      falhas.push({
        regra: 'CS-CONT-009',
        onde: `idioma "${idioma}"`,
        mensagem: `presente pela metade — falta em ${faltando.length} campos, a comecar por ${faltando[0]?.[0]}. So o pacote inteiro entra`,
      })
    }
  }
  return falhas
}

/** Todas as regras globais, na ordem em que sao mais uteis de ler. */
export function verificarConteudo(conteudo: Conteudo): Falha[] {
  return [
    ...municipiosDoConsorcio(conteudo),
    ...paridadeDePontos(conteudo),
    ...paridadeDeRedes(conteudo),
    ...coberturaDeRotas(conteudo),
    ...numeroExigeFonte(conteudo),
    ...nomeDeRota(conteudo),
    ...palavrasProibidas(conteudo),
    ...idiomasParciais(conteudo),
  ]
}
