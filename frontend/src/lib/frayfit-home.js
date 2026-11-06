import { isoOf, weekStartOf, weekDayOffset } from './format.js'
import { effectiveRoutines, nextTrainingDay, sessionVolume, doneUnits, workoutDay } from './history.js'
import { queueOf } from './queue.js'

// Read-only dashboard model. Scheduling and volume retain the same readers as Home/History.
export function frayfitHome(S, now = new Date()) {
  const today = isoOf(now)
  const start = new Date(now)
  start.setDate(now.getDate() - weekDayOffset(now.getDay(), weekStartOf(S)))
  const workouts = S.workouts || []
  const timeOf = w => Number(w.start ?? w.end) || 0
  const latest = workouts.reduce((last, w) => {
    if (!last) return w
    const byDay = (workoutDay(w) || '').localeCompare(workoutDay(last) || '')
    return byDay > 0 || (byDay === 0 && timeOf(w) >= timeOf(last)) ? w : last
  }, null)
  const doneDays = new Set(workouts.map(workoutDay))
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const iso = isoOf(date)
    return { iso, date, today: iso === today, done: doneDays.has(iso), planned: effectiveRoutines(S, iso).length > 0 }
  })
  const inWeek = workouts.filter(w => {
    const d = workoutDay(w)
    return d && d >= days[0].iso && d <= days[6].iso
  })
  const queueIds = queueOf(S)?.ids || []
  const loggedToday = workouts.filter(w => workoutDay(w) === today)
  const routines = effectiveRoutines(S, today).filter(r => queueIds.includes(r.id) || !loggedToday.some(w =>
    (Array.isArray(w.routineIds) ? w.routineIds : [w.routineId]).includes(r.id)))
  const next = routines.some(r => r.ex?.length) ? { iso: today, routines } : nextTrainingDay(S, today)
  return {
    today, days, next, latest,
    week: {
      sessions: inWeek.length,
      sets: inWeek.reduce((n, w) => n + (w.entries || []).reduce((m, e) => m + (e.sets || []).reduce((k, s) => k + doneUnits(s), 0), 0), 0),
      volume: inWeek.reduce((n, w) => n + sessionVolume(w, S), 0),
    },
  }
}
