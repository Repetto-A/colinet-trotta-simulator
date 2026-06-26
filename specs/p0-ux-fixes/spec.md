# Spec — P0 UX Fixes (REP-10, REP-12, REP-13)

Fuente de verdad: descripciones de los issues de Linear (proyecto **Colinet Trotta Simulator**) +
documento de auditoría UX/Game Dev (Jun 2026). Un solo PR contra `master`. El copy de cara al
usuario se mantiene en **español**. No se toca `office-scene` ni visuales de oficina.

## Contexto

El juego mezclaba dos longitudes de ciclo: `CYCLE_TURNS = 10` (cierre "suave", denominador del
header `Mes N/10`) vs `MAX_TURNS = 12` (tope duro) vs copy de marketing "12 meses" y `CYCLE_MONTHS`
con 12 entradas. Además el CTA del header presentaba una falsa affordance y el CTA post-partida no
hacía lo que su etiqueta promete.

---

## REP-10 — Unificar duración del ciclo (mandato = 12 meses)

**Decisión de producto:** el mandato dura **12 meses**. Alinear código con el copy/marketing.

### Cambios

- `lib/game-balance.ts`: `CYCLE_TURNS = 12` (antes 10). `MAX_TURNS` se mantiene en 12.
- `evaluateGameStatus`: el tope duro (`defeat_timeout`) pasa a aplicar solo cuando se **excede** el
  mandato (`state.turn > MAX_TURNS`), de modo que el cierre natural del mes 12 se evalúa por la rama
  de puntaje (`excellent` / `victory` / `partial` / `defeat_score`). Así el mes 12 cierra con copy
  coherente y `defeat_timeout` queda como red de seguridad por sobrepasar el mandato.
- `components/strategic-header.tsx`: header muestra `Mes N/12` y la barra de avance usa `CYCLE_TURNS`
  (= 12). (Ya consumía `CYCLE_TURNS`; el cambio de valor lo unifica.)
- `lib/cycle-months.ts` y `lib/game-content.ts`: ya consistentes con 12 (12 meses + copy "12 meses");
  se verifican vía tests.

### Criterios de aceptación

- El header muestra `Mes N/12` y la barra de progreso se completa al 100% en el mes 12.
- `CYCLE_TURNS === 12`, `CYCLE_MONTHS.length === 12`, `cycleMonthName(0) === "Enero"`,
  `cycleMonthName(11) === "Diciembre"`.
- El copy de bienvenida sigue diciendo "12 meses".
- Cerrar el ciclo en el mes 12 con puntaje bajo produce `defeat_score` (no `defeat_timeout`); con
  puntaje suficiente produce `partial`/`victory`/`excellent`.
- Los playtests de balance siguen en verde (las bandas de score no cambian).

---

## REP-12 — CTA "Siguiente mes" (falsa affordance)

El botón deshabilitado "Siguiente mes" sugiere una acción que no existe (el mes avanza ejecutando
decisiones del deck, no desde el header).

### Cambios

- `components/strategic-header.tsx`: mientras el ciclo no se pueda cerrar (`!canCloseCycle &&
  !isGameOver`), en lugar de un botón deshabilitado se muestra un **hint no interactivo**:
  `"Ejecutá una decisión del deck para avanzar el mes"`. El botón real ("Cerrar ciclo" / "Ver
  resultado") aparece solo cuando `canCloseCycle` o `isGameOver`.

### Criterios de aceptación

- Durante el juego normal no hay un botón deshabilitado con etiqueta "Siguiente mes".
- Se ve el texto guía "Ejecutá una decisión del deck para avanzar el mes".
- Al alcanzar el cierre del ciclo aparece el botón "Cerrar ciclo" (o "Ver resultado" en derrota).

---

## REP-13 — CTA post-partida "Jugar otro escenario"

`handlePlayAgain` reiniciaba el **mismo** escenario y volvía directo al dashboard, contradiciendo la
etiqueta "Jugar otro escenario".

### Cambios

- `app/page.tsx`: `handlePlayAgain` navega a la selección de escenario (`setCurrentScreen("scenario")`),
  espejando `handleStartGame`, y resetea `selectedScenario`, `cycleResult`, recap de aprendizaje,
  `loopOverrides` y `showSeasonReport`.

### Criterios de aceptación

- "Jugar otro escenario" lleva a la pantalla de selección de escenario.
- El usuario puede elegir un escenario distinto y empezar un mandato nuevo y limpio.

---

## Validación

- `npm test` (Vitest) y `npm run build` en verde. `npm run typecheck` opcional.
- Prueba manual del flujo en navegador (welcome → escenario → dashboard → cierre → resultados →
  "Jugar otro escenario").
