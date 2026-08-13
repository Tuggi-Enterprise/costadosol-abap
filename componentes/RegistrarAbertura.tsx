'use client'

/**
 * A abertura é contada na página que abriu, não no link que levou até ela.
 *
 * O motivo é CS-DADO-002: a entrada por mesa (CS-NAV-002) chega na página do município
 * sem passar por clique nenhum, e por isso a abertura do município de ENTRADA nunca era
 * contada — exatamente a linha que a regra descreve como "inflada para o município de
 * entrada". Contando aqui, toda abertura entra pelo mesmo lugar, venha da mesa, da grade
 * da home, do módulo das outras oito ou de um link compartilhado.
 *
 * De onde veio é um bilhete deixado pelo componente do link (`marcarOrigemDeAbertura`);
 * sem bilhete, a origem se deduz da sessão. Quem calcula tudo isso é lib/track.ts, e não
 * este componente: CS-EVT-004 quer a métrica mais valiosa do projeto num lugar só.
 */
import { useEffect } from 'react'
import { track, trackMunicipioOpen } from '../lib/track.ts'

export function RegistrarAberturaDeMunicipio({ municipio }: { municipio: string }) {
  useEffect(() => {
    trackMunicipioOpen(municipio)
  }, [municipio])
  return null
}

export function RegistrarAberturaDePonto({ poiId, municipio }: { poiId: string; municipio: string }) {
  useEffect(() => {
    track('poi_open', { poi_id: poiId, municipio })
  }, [poiId, municipio])
  return null
}
