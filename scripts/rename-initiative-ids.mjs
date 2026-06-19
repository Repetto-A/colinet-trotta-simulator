import fs from "fs"
import path from "path"

const map = [
  ["wheat", "core_stabilization"],
  ["corn", "ecosystem_expansion"],
  ["soy", "itware_integration"],
  ["sunflower", "iso_program"],
  ["fallow", "unassigned"],
  ["vetch", "ai_pilot"],
  ["rye", "tech_debt_reduction"],
  ["clover", "culture_program"],
]

const skip = new Set(["node_modules", ".next", ".git", "scripts"])

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (/\.(ts|tsx|mjs)$/.test(ent.name)) {
      let s = fs.readFileSync(p, "utf8")
      const orig = s
      for (const [a, b] of map) {
        s = s.split(`"${a}"`).join(`"${b}"`)
        s = s.split(`'${a}'`).join(`'${b}'`)
        s = s.split(`${a}:`).join(`${b}:`)
      }
      if (s !== orig) fs.writeFileSync(p, s)
    }
  }
}

walk(".")
console.log("Initiative ids renamed")
