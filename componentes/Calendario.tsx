/**
 * Mês em grade de sete colunas, com os dias de evento marcados. Cada dia marcado é âncora
 * para o primeiro cartão daquele dia, logo abaixo — o calendário é índice, não enfeite.
 *
 * Só evento de data confirmada marca dia: "Em breve" não tem dia para marcar (CS-OURO-006).
 * Evento de mais de uma semana também não: o Festival Sabores de Cabo Frio dura um mês, e
 * pintava setembro inteiro, apagando os eventos de fim de semana que o calendário existe
 * para mostrar. O cartão dele continua na lista.
 */
import { formatar, type EventoExibido } from './Agenda.tsx'

/** Os dias do mês `aaaa-mm`, com o deslocamento da semana começando no domingo. */
function diasDoMes(mes: string): { vazios: number; dias: string[] } {
  const [ano, m] = mes.split('-').map(Number) as [number, number]
  const primeiro = new Date(Date.UTC(ano, m - 1, 1))
  const total = new Date(Date.UTC(ano, m, 0)).getUTCDate()
  const dias = Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`)
  return { vazios: primeiro.getUTCDay(), dias }
}

/** Domingo a sábado no idioma da página: 2026-09-06 caiu num domingo. */
function iniciaisDaSemana(lang: string): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    formatar(`2026-09-${String(6 + i).padStart(2, '0')}`, lang, { weekday: 'narrow' }),
  )
}

const DIAS_MAXIMOS_MARCADOS = 7

function duracaoEmDias(e: EventoExibido): number {
  return (Date.parse(e.fim) - Date.parse(e.inicio)) / 86_400_000 + 1
}

export function Calendario({ mes, eventos, lang }: { mes: string; eventos: EventoExibido[]; lang: string }) {
  const { vazios, dias } = diasDoMes(mes)
  const marcaveis = eventos.filter((e) => duracaoEmDias(e) <= DIAS_MAXIMOS_MARCADOS)
  const primeiroDoDia = (dia: string) => marcaveis.find((e) => e.inicio <= dia && dia <= e.fim)

  return (
    <div aria-hidden className="grid grid-cols-7 gap-1 text-center text-[0.75rem] tabular-nums">
      {iniciaisDaSemana(lang).map((inicial, i) => (
        <span key={i} className="pb-1 text-tinta-suave">
          {inicial}
        </span>
      ))}
      {Array.from({ length: vazios }, (_, i) => (
        <span key={`v${i}`} />
      ))}
      {dias.map((dia) => {
        const evento = primeiroDoDia(dia)
        const numero = Number(dia.slice(8))
        // aria-hidden no bloco: o leitor de tela lê a lista de cartões, que tem as mesmas
        // datas por extenso. A grade repetiria cada dia do mês sem acrescentar nada.
        return evento ? (
          <a
            key={dia}
            href={`#${evento.id}`}
            tabIndex={-1}
            className="rounded-full bg-lagoa-tinta py-1.5 font-semibold text-white"
          >
            {numero}
          </a>
        ) : (
          <span key={dia} className="py-1.5 text-tinta">
            {numero}
          </span>
        )
      })}
    </div>
  )
}
