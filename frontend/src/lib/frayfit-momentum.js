import { isoOf, weekStartOf, weekDayOffset } from './format.js'
import { workoutDay, workoutDuration, doneUnits } from './history.js'

const shift = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d }
const empty = () => ({ sessions: 0, sets: 0, durationMs: 0, timedSessions: 0 })

// Read-only windows use local calendar dates, including across DST changes and imported history.
export function frayfitMomentum(S, now = new Date()) {
  const today = isoOf(now), from = isoOf(shift(now, -27)), previousFrom = isoOf(shift(now, -55))
  const current = empty(), previous = empty(), byDay = new Map()
  for (const w of S.workouts || []) {
    const day = workoutDay(w)
    if (!day || day > today) continue
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day).push(w)
    const period = day >= from ? current : day >= previousFrom ? previous : null
    if (!period) continue
    period.sessions++
    for (const entry of w.entries || []) for (const set of entry.sets || []) if (set) period.sets += doneUnits(set)
    const duration = workoutDuration(w)
    if (duration > 0) {
      period.durationMs += duration
      period.timedSessions++
    }
  }
  const first = shift(now, -weekDayOffset(now.getDay(), weekStartOf(S)) - 77)
  const days = Array.from({ length: 84 }, (_, i) => {
    const iso = isoOf(shift(first, i))
    return { iso, workouts: byDay.get(iso) || [], future: iso > today, today: iso === today }
  })
  return { current, previous, change: current.sessions - previous.sessions, days,
    activeDays: [...byDay.keys()].filter(d => d >= from).length }
}
