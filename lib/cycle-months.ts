export const CYCLE_MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const

/** Turno 0 = Enero, 1 = Febrero, … (12 meses del mandato). */
export function cycleMonthName(turn: number): string {
  const index = Math.max(0, Math.min(CYCLE_MONTHS.length - 1, turn))
  return CYCLE_MONTHS[index]!
}
