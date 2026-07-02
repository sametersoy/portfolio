import { UNITS } from '../data/rack.js'

// 1U in world space (slightly exaggerated for visual readability).
export const U = 0.17
export const INNER_W = 1.9
export const UNIT_W = INNER_W - 0.05
export const BODY_DEPTH = 1.0
const GAP = 0.01

// Front-face stack, top -> bottom (22U tower). `kind: 'unit'` slots are
// interactive and pull their data from UNITS by id; vent/blank slots are
// filler panels like a real, partially populated enterprise rack.
const STACK = [
  { kind: 'vent', u: 1 },
  { kind: 'unit', id: 'servers' },
  { kind: 'blank', u: 1 },
  { kind: 'unit', id: 'network' },
  { kind: 'unit', id: 'kubernetes' },
  { kind: 'blank', u: 1 },
  { kind: 'unit', id: 'databases' },
  { kind: 'blank', u: 1 },
  { kind: 'unit', id: 'software' },
  { kind: 'unit', id: 'security' },
  { kind: 'vent', u: 1 },
  { kind: 'blank', u: 1 },
  { kind: 'vent', u: 1 },
  { kind: 'pdu', u: 1 },
  { kind: 'psu', u: 2 },
]

export function computeLayout() {
  const byId = Object.fromEntries(UNITS.map((u) => [u.id, u]))
  const slots = STACK.map((s) => {
    const unit = s.kind === 'unit' ? byId[s.id] : null
    const u = unit ? unit.u : s.u
    return { ...s, unit, u, h: u * U - GAP }
  })

  const totalH = slots.reduce((sum, s) => sum + s.u * U, 0)
  let cursor = totalH / 2 // start at top
  for (const s of slots) {
    const slotH = s.u * U
    s.yCenter = cursor - slotH / 2
    cursor -= slotH
  }
  return { slots, totalH }
}

export const LAYOUT = computeLayout()
