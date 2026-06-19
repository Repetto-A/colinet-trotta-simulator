Core mechanics (compact)

Actions and numbers for quick playtest:

Water: $30 → +15 Health, +2 Soil; cooldown 1 week.

Fertilize: $40 → +12 Health, +10 Soil; if rain in 48h → runoff penalty −15 EcoScore.

Protect: $35 → +20 Health for 3 weeks; −5 EcoScore.

Improve Soil: $50 → +20 Soil after 3 weeks (slow).

Diminishing returns: repeating same action within 7 days applies 50% effect.

Yield function (copy-paste)
yield = base_yield * (0.6 + 0.4 * Soil / 100) * (0.7 + 0.3 * Health / 100)

Use this in the engine to compute harvest per plot per season.

Events & triggers

Rain: driven by IMERG value → reduces irrigation need, may trigger runoff if fertilizer applied <48h.

Drought: SMAP below threshold for N weeks → apply drought penalties.

Missions (ready)

Recover plot: bring Soil ≥40 and Health ≥50 in ≤6 weeks.

Water efficiency: lower average water use by 10% across all plots in 8 weeks.

Rotation test: plant rotation (two crops in sequence) and show Soil +X after season.
