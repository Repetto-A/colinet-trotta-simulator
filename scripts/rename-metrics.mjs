import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

const replacements = [
  ["cropHealthChange", "clientSatisfactionChange"],
  ["soilHealthChange", "processControlChange"],
  ["nutrientChange", "teamCapacityChange"],
  ["waterChange", "executionSpeedChange"],
  ["healthChange", "clientSatisfactionChange"],
  ["cropHealth", "clientSatisfaction"],
  ["soilHealth", "processControl"],
  ["nutrients", "teamCapacity"],
  ["state.crops", "state.initiativeSlots"],
  [".crops", ".initiativeSlots"],
  ["crops:", "initiativeSlots:"],
  ["crops,", "initiativeSlots,"],
  ["crops)", "initiativeSlots)"],
  ["crops]", "initiativeSlots]"],
  ["crops ", "initiativeSlots "],
  [" water:", " executionSpeed:"],
  [" water,", " executionSpeed,"],
  [" water)", " executionSpeed)"],
  [" water ", " executionSpeed "],
  ["state.water", "state.executionSpeed"],
  [".water", ".executionSpeed"],
  ["(water:", "(executionSpeed:"],
  [" water<", " executionSpeed<"],
  [" water>", " executionSpeed>"],
  [" water=", " executionSpeed="],
  ["{ water", "{ executionSpeed"],
]

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "scripts") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8")
  const original = text
  for (const [from, to] of replacements) {
    text = text.split(from).join(to)
  }
  if (text !== original) fs.writeFileSync(file, text)
}

console.log("Rename complete")
