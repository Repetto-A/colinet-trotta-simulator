# Spec — P1 UX Polish (REP-11, REP-14, REP-15, REP-17) + bonus (REP-16, REP-18, REP-19)

Fuente de verdad: descripciones de los issues de Linear (proyecto **Colinet Trotta Simulator**) +
documento de auditoría UX/Game Dev (Jun 2026). Un solo PR contra `master` (apilado sobre P0 ya
mergeado). Copy de cara al usuario en **español**. Sigue el patrón de `specs/p0-ux-fixes/spec.md`.

**Fuera de alcance (global):** visuales/animación de `office-scene`. Solo se toca texto de oficina si
es estrictamente necesario para el glosario (ver REP-11 → se decidió NO tocarlo, ver más abajo).

---

## REP-11 — Glosario unificado de KPIs (High)

**Problema:** mismo KPI con nombres distintos según la superficie:
- Header (NavKpiBar) / feedback del engine: `Presupuesto / Clientes / Control / Capacidad / Velocidad`.
- Preview de bienvenida: `Caja / Clientes / Control / Equipo / Ritmo` (derivó del header).
- Oficina: `Cliente / Equipo / Producto GAUS / Cumplimiento` (nombres de área, contextuales).

**Decisión:** el set canónico es el del juego (header + feedback), que ya es consistente entre sí.
Se crea `lib/kpi-glossary.ts` como **única fuente de verdad** (`KPI_GLOSSARY` con `short` + `full`),
y se hace que el header, el preview y las píldoras-teaser de bienvenida consuman esas etiquetas para
que no vuelvan a derivar.

- `lib/kpi-glossary.ts` (nuevo): `KPI_GLOSSARY` y `KPI_SHORT`. `full` reutiliza `KPI_LABELS`.
- `components/kpi-strip.tsx`: labels de pills desde `KPI_SHORT`; tooltip nativo (`title`) con la
  etiqueta completa (mapeo short→full = "tooltips" del issue).
- `components/welcome-game-preview.tsx`: corrige `Caja→Presupuesto`, `Equipo→Capacidad`,
  `Ritmo→Velocidad` usando `KPI_SHORT`.
- `lib/game-content.ts`: `tensionPillars` usa `KPI_SHORT` (`Caja→Presupuesto`, `Equipo→Capacidad`).
- **Oficina:** se mantiene sin cambios. Los nombres de área (`Cliente`, `Producto GAUS`,
  `Cumplimiento`) son un encuadre narrativo deliberado del tablero; alinearlos al nombre crudo del KPI
  empeoraría la lectura y entra en conflicto con "no tocar office-scene salvo necesario". El glosario
  documenta el mapeo para referencia futura. (Deferred, justificado.)

**AC:** preview, header y tension pillars muestran exactamente `Presupuesto / Clientes / Control /
Capacidad / Velocidad`; existe un glosario central reutilizado; el detalle muestra la etiqueta
completa coherente.

## REP-15 — Pill de KPI abre el detalle (High)

Hoy solo el botón de barra completa abre el detalle; las pills individuales no son clickeables.

- `components/kpi-strip.tsx`: el contenedor deja de ser un único `<button>` (HTML inválido anidar
  botones). Cada pill pasa a ser un `<button>` con `onClick=onOpenDetail` y `aria-label="Ver detalle
  de {label}"`; el badge "Detalle" también es botón. El contenedor pasa a `div role="group"`.

**AC:** clic en cualquier pill abre el panel de detalle (desktop y mobile).

## REP-17 — Affordance "Detalle" visible en mobile (High)

El badge "Detalle" estaba oculto en mobile (`hidden sm:flex`).

- `components/kpi-strip.tsx`: el badge "Detalle" se muestra en todos los breakpoints (`flex`).

**AC:** en viewport mobile el usuario ve el affordance "Detalle" y puede abrir el panel.

## REP-14 — Confirmar antes de "Nuevo mandato" (High)

"Nuevo mandato" llama a `onStart` → `clear()` y borra el save sin confirmación.

- `components/ui/alert-dialog.tsx` (nuevo): wrapper shadcn sobre `@radix-ui/react-alert-dialog` (ya
  es dependencia).
- `components/welcome-screen.tsx`: cuando hay save (`hasSave`), "Nuevo mandato" abre un AlertDialog de
  confirmación (título/descr./Cancelar/confirmar en español); confirmar dispara `onStart`. Sin save,
  "Iniciar simulación" sigue disparando `onStart` directo.

**AC:** con partida guardada, "Nuevo mandato" pide confirmación antes de borrar; sin save no hay
fricción.

---

## Bonus (mismo PR, solo si pequeño y testeado)

- **REP-16** — Recharts width/height -1: en `components/data-modal.tsx` `KpiComparisonChart` se elimina
  el `<ResponsiveContainer>` redundante dentro de `ChartContainer` (que ya envuelve en uno) — causa
  señalada en la auditoría. **Parcial:** persiste un warning transitorio de montaje proveniente del
  propio `ChartContainer` (primitivo compartido `components/ui/chart.tsx`, `flex aspect-video` +
  `ResponsiveContainer`); un fix completo requeriría tocar ese primitivo compartido, fuera del alcance
  "trivial" de un bonus. Se deja como parcialmente resuelto.
- **REP-18** — A11y DataModal: `role="dialog"`, `aria-modal`, `aria-labelledby` + `id` en el `<h2>`,
  cierre con `Escape` y clic en backdrop. Solo `data-modal.tsx` (otros modales quedan deferred).
- **REP-19** — Tests de persistencia: `tests/use-game-persistence.test.ts` (con `// @vitest-environment
  jsdom`; se agrega `jsdom` a devDependencies). Cubre round-trip write/read, `clear`, expiración TTL,
  versión inválida y `formatSaveSummary`.
- **Quick win** — `components/season-report.tsx`: `aria-label` en el botón de cerrar (solo ícono).

**Deferred (no en este PR):** a11y de `event-modal`/`initiative-selector` (mismo patrón que REP-18,
pero >alcance), alineación de labels de office-scene, reformateo cosmético de `game-dashboard.tsx`.

## Validación

- `pnpm test && pnpm run typecheck && pnpm run build` en verde.
- Smoke manual: welcome → escenario → dashboard → pill de KPI abre detalle (desktop + mobile) →
  "Nuevo mandato" pide confirmación → jugar a resultados → "Jugar otro escenario".
