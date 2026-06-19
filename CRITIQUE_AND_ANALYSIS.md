# Farm Hero: Design Critique & 2-Hour Hackathon Plan

## 1. CRITIQUE (5 Key Points)

**Gameplay:**
- **Missing NASA data integration**: The current prototype has no NDVI, SMAP, or IMERG data visualization despite being the core differentiator. Players can't see real satellite data driving their decisions.
- **Action feedback loop unclear**: When players water/fertilize, there's no immediate visual feedback showing how NASA data (soil moisture, vegetation health) responds to their actions.

**Data Integration:**
- **No data pipeline**: The design docs specify AppEEARS/GEE integration but there's no backend endpoint or pre-baked data aggregates in the current build. Need `/state` and `/action` endpoints immediately.

**Tech Approach:**
- **Frontend-only prototype**: Current build is pure React state management with no FastAPI backend or data layer. For a 2-hour demo, need to mock NASA data endpoints or use static JSON files.
- **Overly complex for MVP**: 9 plots, multiple seasons, livestock, nitrogen management—too much scope. Reduce to 3 plots, 3 actions, 3 missions as per the quick MVP doc.

---

## 2. AESTHETIC IMPROVEMENTS (Priority #1)

### Visual System

**Color Palette:**
\`\`\`css
/* Primary: Earth & Growth */
--farm-earth: oklch(0.45 0.08 60);      /* Rich soil brown */
--farm-growth: oklch(0.55 0.15 140);    /* Vibrant crop green */
--farm-sky: oklch(0.65 0.12 230);       /* Clear sky blue */

/* Secondary: Data & Alerts */
--data-healthy: oklch(0.6 0.15 145);    /* NDVI high (green) */
--data-warning: oklch(0.7 0.15 85);     /* NDVI medium (yellow) */
--data-critical: oklch(0.6 0.18 35);    /* NDVI low (red-orange) */

/* Neutrals */
--neutral-bg: oklch(0.97 0.005 85);     /* Warm off-white */
--neutral-surface: oklch(1 0 0);        /* Pure white cards */
--neutral-text: oklch(0.3 0.02 60);     /* Dark brown text */
--neutral-border: oklch(0.88 0.01 85);  /* Soft tan borders */
\`\`\`

**Typography:**
- **Headings**: `font-sans` (system default), `font-semibold`, sizes: `text-2xl` (plot titles), `text-lg` (action cards)
- **Body**: `font-sans`, `font-normal`, `text-sm` to `text-base`, `leading-relaxed` (1.625 line-height)
- **Data labels**: `font-mono`, `text-xs`, `tracking-tight` for NDVI/SMAP values

**Iconography Style:**
- Use Lucide React icons (already in project): `Droplets` (water), `Sprout` (fertilize), `Shield` (protect), `TrendingUp` (soil improvement)
- Icon sizes: `size-4` (16px) for inline, `size-5` (20px) for action buttons, `size-6` (24px) for plot headers
- Always pair icons with text labels for accessibility

**3 Core UI Components:**

1. **PlotCard**: Displays individual plot with NDVI overlay, soil moisture, and health metrics
2. **ActionCard**: Shows available farm actions with cost, effect, and cooldown status
3. **DataSidebar**: Compact panel showing aggregated NASA data and mission progress

---

### Tailwind Tokens & CSS Variables

\`\`\`css
/* Add to globals.css */
:root {
  /* NASA Data Visualization */
  --ndvi-high: oklch(0.6 0.15 145);
  --ndvi-medium: oklch(0.7 0.15 85);
  --ndvi-low: oklch(0.6 0.18 35);
  
  /* Action States */
  --action-available: oklch(0.55 0.15 140);
  --action-cooldown: oklch(0.5 0.02 60);
  --action-disabled: oklch(0.7 0.01 85);
  
  /* Plot Health Gradient */
  --health-critical: oklch(0.55 0.2 25);
  --health-poor: oklch(0.65 0.15 50);
  --health-fair: oklch(0.7 0.15 85);
  --health-good: oklch(0.6 0.15 145);
  
  /* Spacing & Layout */
  --plot-size: 180px;
  --action-card-width: 240px;
  --sidebar-width: 320px;
}

@theme inline {
  --color-ndvi-high: var(--ndvi-high);
  --color-ndvi-medium: var(--ndvi-medium);
  --color-ndvi-low: var(--ndvi-low);
  --color-action-available: var(--action-available);
  --color-action-cooldown: var(--action-cooldown);
  --color-action-disabled: var(--action-disabled);
  --color-health-critical: var(--health-critical);
  --color-health-poor: var(--health-poor);
  --color-health-fair: var(--health-fair);
  --color-health-good: var(--health-good);
}
\`\`\`

---

### Micro-Animations

\`\`\`tsx
/* Subtle, tasteful animations */
// Hover states
className="transition-all duration-200 hover:scale-105 hover:shadow-lg"

// Action feedback
className="animate-in fade-in-0 zoom-in-95 duration-300"

// Data updates
className="transition-colors duration-500"

// Loading states
<Spinner className="size-4 text-primary" />
\`\`\`

**Animation Rules:**
- Keep durations ≤300ms for responsiveness
- Use `ease-out` for entrances, `ease-in` for exits
- Disable animations for `prefers-reduced-motion`

---

### Accessibility Rules

**Contrast:**
- Text on light backgrounds: minimum 4.5:1 ratio (WCAG AA)
- Data labels: use `font-semibold` or `font-bold` for low-contrast colors
- NDVI color scale: add text labels ("High", "Medium", "Low") alongside colors

**Color-Blind Friendly:**
- Never rely on color alone—use icons + text
- NDVI scale: green/yellow/red + up/neutral/down arrows
- Action states: color + icon (checkmark/clock/lock)

**Font Sizes:**
- Minimum body text: `text-sm` (14px)
- Interactive elements: minimum `text-base` (16px)
- Data labels: `text-xs` (12px) acceptable with `font-semibold`

**Keyboard Navigation:**
- All actions focusable with `Tab`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Escape key closes modals

---

## 3. REACT COMPONENTS (Code-Ready)

### PlotCard Component

\`\`\`tsx
// components/plot-card.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from "@/lib/utils"

interface PlotData {
  id: number
  ndvi: number // 0-1 scale
  soilMoisture: number // 0-100 scale
  health: number // 0-100 scale
  cropType: string
  lastAction?: string
}

export function PlotCard({ plot, onClick }: { plot: PlotData; onClick?: () => void }) {
  // NDVI color mapping
  const getNDVIColor = (ndvi: number) => {
    if (ndvi >= 0.6) return "bg-ndvi-high"
    if (ndvi >= 0.3) return "bg-ndvi-medium"
    return "bg-ndvi-low"
  }

  const getNDVILabel = (ndvi: number) => {
    if (ndvi >= 0.6) return { text: "Healthy", icon: TrendingUp }
    if (ndvi >= 0.3) return { text: "Fair", icon: TrendingUp }
    return { text: "Poor", icon: TrendingDown }
  }

  const ndviStatus = getNDVILabel(plot.ndvi)
  const NDVIIcon = ndviStatus.icon

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:scale-105 hover:shadow-lg cursor-pointer",
        "w-[180px] h-[200px] p-3"
      )}
      onClick={onClick}
    >
      {/* NDVI Overlay Bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", getNDVIColor(plot.ndvi))} />

      {/* Plot Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">Plot {plot.id}</span>
        <Badge variant="outline" className="text-xs">
          {plot.cropType}
        </Badge>
      </div>

      {/* NASA Data Metrics */}
      <div className="space-y-2 mb-3">
        {/* NDVI */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <NDVIIcon className="size-3" />
            NDVI
          </span>
          <span className="font-mono font-semibold">{plot.ndvi.toFixed(2)}</span>
        </div>

        {/* Soil Moisture */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Droplets className="size-3" />
            Moisture
          </span>
          <span className="font-mono font-semibold">{plot.soilMoisture}%</span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Health</span>
          <span className="font-semibold">{plot.health}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              plot.health >= 70 && "bg-health-good",
              plot.health >= 40 && plot.health < 70 && "bg-health-fair",
              plot.health < 40 && "bg-health-critical"
            )}
            style={{ width: `${plot.health}%` }}
          />
        </div>
      </div>

      {/* Last Action Indicator */}
      {plot.lastAction && (
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {plot.lastAction}
          </Badge>
        </div>
      )}
    </Card>
  )
}
\`\`\`

---

### ActionCard Component

\`\`\`tsx
// components/action-card.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Droplets, Sprout, Shield, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ActionData {
  id: string
  name: string
  cost: number
  effects: {
    health?: number
    soil?: number
    ecoScore?: number
  }
  cooldown?: number // weeks remaining
  description: string
}

const ACTION_ICONS = {
  water: Droplets,
  fertilize: Sprout,
  protect: Shield,
  improveSoil: TrendingUp,
}

export function ActionCard({ action, onExecute, disabled }: { 
  action: ActionData
  onExecute: () => void
  disabled?: boolean 
}) {
  const Icon = ACTION_ICONS[action.id as keyof typeof ACTION_ICONS] || Sprout
  const isOnCooldown = action.cooldown && action.cooldown > 0

  return (
    <Card className={cn(
      "w-[240px] p-4 transition-all duration-200",
      !disabled && !isOnCooldown && "hover:shadow-md",
      (disabled || isOnCooldown) && "opacity-60"
    )}>
      {/* Action Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            !disabled && !isOnCooldown ? "bg-action-available/10" : "bg-muted"
          )}>
            <Icon className={cn(
              "size-5",
              !disabled && !isOnCooldown ? "text-action-available" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{action.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="size-3" />
              <span className="font-mono">{action.cost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-1 mb-3">
        {action.effects.health && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Health</span>
            <span className="font-semibold text-health-good">+{action.effects.health}</span>
          </div>
        )}
        {action.effects.soil && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Soil</span>
            <span className="font-semibold text-health-good">+{action.effects.soil}</span>
          </div>
        )}
        {action.effects.ecoScore && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Eco Score</span>
            <span className={cn(
              "font-semibold",
              action.effects.ecoScore > 0 ? "text-health-good" : "text-health-critical"
            )}>
              {action.effects.ecoScore > 0 ? "+" : ""}{action.effects.ecoScore}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {action.description}
      </p>

      {/* Cooldown or Action Button */}
      {isOnCooldown ? (
        <Badge variant="outline" className="w-full justify-center gap-1">
          <Clock className="size-3" />
          <span className="text-xs">{action.cooldown} weeks</span>
        </Badge>
      ) : (
        <Button
          onClick={onExecute}
          disabled={disabled}
          className="w-full"
          size="sm"
        >
          Apply Action
        </Button>
      )}
    </Card>
  )
}
\`\`\`

---

## 4. GAMEPLAY REFINEMENTS (Low-Effort, High-Impact)

### Refinement 1: Simplified Action Economy
**Change**: Reduce to 4 core actions with clear trade-offs
\`\`\`typescript
const ACTIONS = {
  water: { cost: 30, healthBoost: 15, soilBoost: 2, cooldown: 1 },
  fertilize: { cost: 40, healthBoost: 12, soilBoost: 10, ecoScorePenalty: -15, cooldown: 2 },
  protect: { cost: 35, healthBoost: 20, duration: 3, ecoScorePenalty: -5, cooldown: 2 },
  improveSoil: { cost: 50, soilBoost: 20, delay: 3, cooldown: 4 }
}
\`\`\`
**Impact**: Players can learn the system in 30 seconds instead of 5 minutes.

---

### Refinement 2: NDVI-Driven Visual Feedback
**Change**: Plot cards change color based on NDVI thresholds
\`\`\`typescript
// Add to PlotCard background
const getPlotBackground = (ndvi: number) => {
  if (ndvi >= 0.6) return "bg-gradient-to-br from-green-50 to-green-100"
  if (ndvi >= 0.3) return "bg-gradient-to-br from-yellow-50 to-yellow-100"
  return "bg-gradient-to-br from-orange-50 to-red-50"
}
\`\`\`
**Impact**: Instant visual understanding of plot health without reading numbers.

---

### Refinement 3: Mission-Driven Onboarding
**Change**: Start with 1 active mission, unlock next after completion
\`\`\`typescript
const MISSIONS = [
  { 
    id: 1, 
    title: "Recover Plot 1", 
    goal: "Soil ≥40 AND Health ≥50", 
    weeks: 6, 
    reward: 200 
  },
  { 
    id: 2, 
    title: "Water Efficiency", 
    goal: "Reduce water use by 10%", 
    weeks: 8, 
    reward: 300 
  },
  { 
    id: 3, 
    title: "Crop Rotation", 
    goal: "Plant 2 different crops in sequence", 
    weeks: 10, 
    reward: 400 
  }
]
\`\`\`
**Impact**: Clear progression path, reduces cognitive overload.

---

## 5. 2-HOUR TASK LIST (Prioritized)

### Task 1: Integrate PlotCard & ActionCard Components (25 min)
**Acceptance Criteria:**
- [ ] Replace existing plot display with new `PlotCard` component
- [ ] Replace action buttons with `ActionCard` component
- [ ] All 3 plots render with mock NDVI data (0.3, 0.5, 0.7)
- [ ] Clicking a plot shows its details
- [ ] Action cards show correct costs and effects

---

### Task 2: Add Mock NASA Data Endpoint (20 min)
**Acceptance Criteria:**
- [ ] Create `/api/plot-data/route.ts` returning JSON with NDVI, SMAP, IMERG
- [ ] Mock data structure:
\`\`\`json
{
  "plots": [
    { "id": 1, "ndvi": 0.45, "soilMoisture": 35, "rain7d": 12 },
    { "id": 2, "ndvi": 0.62, "soilMoisture": 55, "rain7d": 18 },
    { "id": 3, "ndvi": 0.28, "soilMoisture": 20, "rain7d": 5 }
  ]
}
\`\`\`
- [ ] Frontend fetches and displays data on load

---

### Task 3: Implement Action System with Cooldowns (30 min)
**Acceptance Criteria:**
- [ ] Clicking "Apply Action" on ActionCard updates plot health/soil
- [ ] Action enters cooldown state (shows weeks remaining)
- [ ] Diminishing returns: same action within 7 days = 50% effect
- [ ] Money deducted from player balance
- [ ] Visual feedback: plot card animates on action application

---

### Task 4: Add Mission Panel with Progress Tracking (25 min)
**Acceptance Criteria:**
- [ ] Sidebar shows active mission (Mission 1: Recover Plot 1)
- [ ] Progress bar shows current vs. target (Soil: 25/40, Health: 35/50)
- [ ] Week counter displays (Week 1/6)
- [ ] Mission completes when goals met → shows reward modal
- [ ] Next mission unlocks automatically

---

### Task 5: Polish UI & Add Microcopy Tooltips (20 min)
**Acceptance Criteria:**
- [ ] Add hover tooltips to NDVI, SMAP, rain metrics (see microcopy below)
- [ ] Add warning banner when fertilizing before rain
- [ ] Add success toast when action applied
- [ ] Ensure all text meets WCAG AA contrast (4.5:1)
- [ ] Test keyboard navigation (Tab through all actions)

---

## 6. IMPROVED MICROCOPY (6-8 Lines)

\`\`\`typescript
// Tooltips for NASA data metrics
const TOOLTIPS = {
  ndvi: "NDVI (Vegetation Health): Measures crop greenness from satellite. 0.6+ = healthy, 0.3-0.6 = fair, <0.3 = stressed.",
  
  smap: "SMAP (Soil Moisture): NASA satellite data showing water in top 5cm of soil. Higher = less irrigation needed.",
  
  rain: "IMERG (Rainfall): NASA precipitation data from last 7 days. Recent rain reduces irrigation needs.",
  
  waterAction: "Irrigation adds +15 Health and +2 Soil. Best used when SMAP shows low moisture (<30%).",
  
  fertilizeWarning: "⚠️ Rain forecast in 48h! Fertilizing now may cause runoff (−15 Eco Score). Wait for dry period.",
  
  protectAction: "Pesticide protection boosts Health +20 for 3 weeks but reduces Eco Score −5. Use sparingly.",
  
  soilAction: "Soil amendment takes 3 weeks to activate but provides lasting +20 Soil boost. Plan ahead!",
  
  missionProgress: "Complete missions to unlock new regions and advanced farming techniques. Focus on one goal at a time."
}
\`\`\`

---

## 7. OUTPUT FILES SUMMARY

### Files Created:
1. **CRITIQUE_AND_ANALYSIS.md** (this file) - Full analysis and specifications
2. **components/plot-card.tsx** - Production-ready PlotCard component
3. **components/action-card.tsx** - Production-ready ActionCard component
4. **Updated globals.css** - New color tokens for NASA data visualization

### Next Steps for WindSurf Team:
1. Copy PlotCard and ActionCard components into your project
2. Update `globals.css` with new color tokens
3. Follow the 2-hour task list in order
4. Use the microcopy tooltips verbatim for consistency
5. Test with keyboard navigation and screen readers

### Design System Quick Reference:
- **Primary color**: `bg-action-available` (green)
- **Data colors**: `bg-ndvi-high/medium/low` (green/yellow/red)
- **Spacing**: `gap-3` for cards, `gap-2` for metrics
- **Typography**: `text-sm` body, `text-xs` labels, `font-mono` for data
- **Animations**: `duration-200` hover, `duration-500` data updates

---

**Estimated Total Implementation Time**: 2 hours
**Priority**: Aesthetics → Data Integration → Missions → Polish
