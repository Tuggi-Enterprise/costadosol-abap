'use client'

/**
 * O vídeo institucional do Conderlagos rodando atrás do título da home.
 *
 * **Por que é auto-hospedado e não um embed do YouTube.** O embed exige abrir a CSP para
 * `frame-src` de terceiro e carrega meio megabyte de script antes do primeiro fato. O
 * arquivo servido de `/public` cabe em `media-src 'self'`, que a CSP já permite.
 *
 * **Por que `autoplay` não está no HTML.** Se estivesse, o vídeo começaria antes de qualquer
 * script rodar, e quem pediu `prefers-reduced-motion: reduce` no sistema veria exatamente o
 * que pediu para não ver. Quem inicia é o efeito abaixo, depois de consultar a preferência;
 * sem script, ou com movimento reduzido, fica o poster, que é um quadro do próprio vídeo.
 *
 * **Por que `preload="none"`.** CS-PERF-001 e o pavilhão: o poster tem 25 kB e o vídeo tem
 * 3,7 MB. Com `none`, o telefone desenha a capa inteira antes de pedir o primeiro byte do
 * vídeo, e num wifi de feira essa é a diferença entre capa e tela cinza.
 *
 * **Som.** Pedido do consórcio em 24/09/2026. O vídeo sempre começa mudo: nenhum navegador
 * deixa tocar som sozinho antes de a pessoa tocar no site ("Muted autoplay is always
 * allowed", developer.chrome.com/blog/autoplay). O botão no canto liga e desliga, e o som
 * desliga sozinho quando o vídeo sai da tela. A escolha vale para a sessão, como o resto do
 * estado do site.
 */
import { useEffect, useRef, useState } from 'react'
import { EVENTO_MUDOU, movimentoReduzido } from '../lib/preferencias.ts'

const CHAVE_DO_SOM = 'video_capa_som'

function somSalvo(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_DO_SOM) === 'ligado'
  } catch {
    return false
  }
}

function salvarSom(ligado: boolean): void {
  try {
    sessionStorage.setItem(CHAVE_DO_SOM, ligado ? 'ligado' : 'desligado')
  } catch {
    // Aba privada ou armazenamento bloqueado: a escolha vale só nesta página.
  }
}

export function VideoDeCapa({
  src,
  poster,
  alt,
  rotulos,
}: {
  src: string
  poster: string
  alt: string
  rotulos: { ativarSom: string; desativarSom: string }
}) {
  const referencia = useRef<HTMLVideoElement>(null)
  const [comSom, setComSom] = useState(false)
  const [parado, setParado] = useState(true)

  function aplicarSom(ligado: boolean) {
    const video = referencia.current
    if (!video) return
    video.muted = !ligado
    setComSom(ligado)
  }

  useEffect(() => {
    const video = referencia.current
    if (!video) return

    // A decisão de parar não é tomada aqui: `movimentoReduzido()` junta a preferência do
    // sistema com a escolha do rodapé (CS-DESIGN-006), e é a mesma resposta que o CSS usa.
    function acompanhar() {
      if (!video) return
      if (movimentoReduzido()) {
        video.pause()
        video.muted = true
        setComSom(false)
        setParado(true)
        return
      }
      // Quem ligou o som e voltou à home já tocou no site, e o navegador deixa. Se recusar,
      // o vídeo segue mudo, que é o comportamento de quem nunca ligou.
      const querSom = somSalvo()
      video.muted = !querSom
      video
        .play()
        .then(() => {
          setParado(false)
          setComSom(querSom)
        })
        .catch(() => {
          if (!querSom) return
          video.muted = true
          setComSom(false)
          void video.play().then(() => setParado(false)).catch(() => {})
        })
    }

    acompanhar()
    // O controle está no rodapé da MESMA página: sem isto, quem pede para reduzir movimento
    // continua com o vídeo rodando acima até trocar de página.
    window.addEventListener(EVENTO_MUDOU, acompanhar)
    return () => window.removeEventListener(EVENTO_MUDOU, acompanhar)
  }, [])

  useEffect(() => {
    const video = referencia.current
    if (!video) return

    const silenciar = () => {
      video.muted = true
      setComSom(false)
    }
    // Som de vídeo que ninguém vê é ruído. Emudece sem gravar a escolha: quem ligou e
    // rolou continua sendo alguém que quer som, se voltar à home depois.
    const observador = new IntersectionObserver(
      ([registro]) => {
        if (registro && registro.intersectionRatio < 0.25) silenciar()
      },
      { threshold: [0, 0.25] },
    )
    observador.observe(video)

    return () => {
      observador.disconnect()
    }
  }, [])

  const rotulo = comSom ? rotulos.desativarSom : rotulos.ativarSom

  return (
    <div className="relative h-full w-full">
      <video
        ref={referencia}
        poster={poster}
        aria-label={alt}
        muted
        loop
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      {!parado && (
        <button
          type="button"
          onClick={() => {
            const ligado = !comSom
            aplicarSom(ligado)
            salvarSom(ligado)
          }}
          aria-pressed={comSom}
          className="absolute right-3 top-3 flex min-h-11 items-center gap-2 rounded-full bg-black/55 px-4 text-sm font-medium text-white backdrop-blur-sm"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {comSom ? (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
            ) : (
              <path d="m23 9-6 6M17 9l6 6" />
            )}
          </svg>
          {rotulo}
        </button>
      )}
    </div>
  )
}
