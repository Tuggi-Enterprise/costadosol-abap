'use client'

/**
 * O vídeo institucional do Conderlagos rodando atrás do título da home.
 *
 * **Por que é auto-hospedado e não um embed do YouTube.** O embed exige abrir a CSP para
 * `frame-src` de terceiro, o que revoga na prática CS-OURO-010 e o critério A-17, e carrega
 * meio megabyte de script do Google antes do primeiro fato. O arquivo servido de `/public`
 * cabe em `media-src 'self'`, que a CSP já permite, e não leva ninguém a um terceiro.
 *
 * **Por que `autoplay` não está no HTML.** Se estivesse, o vídeo começaria antes de qualquer
 * script rodar, e quem pediu `prefers-reduced-motion: reduce` no sistema veria exatamente o
 * que pediu para não ver. Quem inicia é o efeito abaixo, depois de consultar a preferência;
 * sem script, ou com movimento reduzido, fica o poster, que é um quadro do próprio vídeo.
 *
 * **Por que `preload="none"`.** CS-PERF-001 e o pavilhão: o poster tem 25 kB e o vídeo tem
 * quase 3 MB. Com `none`, o telefone desenha a capa inteira antes de pedir o primeiro byte
 * do vídeo, e num wifi de feira essa é a diferença entre capa e tela cinza.
 *
 * O vídeo não tem trilha de áudio: ela foi removida na compressão. `muted` fica assim mesmo,
 * porque é ele que a política de reprodução automática dos navegadores exige ver.
 */
import { useEffect, useRef } from 'react'

export function VideoDeCapa({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const referencia = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = referencia.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // `play()` rejeita quando a política de energia do aparelho recusa a reprodução
    // automática. Não é erro a tratar: o poster continua na tela, que é o mesmo resultado
    // do movimento reduzido.
    void video.play().catch(() => {})
  }, [])

  return (
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
  )
}
