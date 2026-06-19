import fs from "fs"
import path from "path"

const replacements = [
  [/from "@\/types\/crops"/g, 'from "@/types/initiatives"'],
  [/from "\.\.\/types\/crops"/g, 'from "../types/initiatives"'],
  [/from "\.\/crops"/g, 'from "./initiatives"'],
  [/CropType/g, "InitiativeType"],
  [/CROPS/g, "INITIATIVES"],
  [/waterNeed/g, "executionNeed"],
  [/nitrogenNeed/g, "teamFocusNeed"],
  [/soilCapital/g, "techModernization"],
  [/environmentalImpact/g, "regulatoryRisk"],
  [/CropSelector/g, "InitiativeSelector"],
  [/crop-selector/g, "initiative-selector"],
  [/showCropSelector/g, "showInitiativeSelector"],
  [/onSelectCrop/g, "onSelectInitiative"],
  [/handleSelectCrop/g, "handleSelectInitiative"],
  [/previousCrop/g, "previousInitiative"],
  [/CropSelectorProps/g, "InitiativeSelectorProps"],
  [/onSelectInitiative: \(cropType: InitiativeType\)/g, "onSelectInitiative: (initiativeType: InitiativeType)"],
  [/choose = \(initiativeType: InitiativeType\)/g, "choose = (initiativeType: InitiativeType)"],
]

function transform(content) {
  let s = content
  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement)
  }
  return s
}

function walk(dir, skip = new Set(["node_modules", ".next"])) {
  const files = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) files.push(...walk(p, skip))
    else if (/\.(ts|tsx)$/.test(ent.name) && !p.endsWith("types\\crops.ts") && !p.endsWith("types/crops.ts"))
      files.push(p)
  }
  return files
}

for (const file of walk(".")) {
  const original = fs.readFileSync(file, "utf8")
  if (
    !original.includes("crops") &&
    !original.includes("Crop") &&
    !original.includes("soilCapital") &&
    !original.includes("environmentalImpact") &&
    !original.includes("crop-selector")
  ) {
    continue
  }
  const next = transform(original)
  if (next !== original) {
    fs.writeFileSync(file, next)
    console.log("updated", file)
  }
}
