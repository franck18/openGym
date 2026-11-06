import { describe, expect, it } from 'vitest'
import { frayfitHome } from './frayfit-home.js'

const base = { routines: [], week: {}, dayPlan: {}, workouts: [], bodyweight: [], weekStart: 1 }
const routine = (id, name = id) => ({ id, name, ex: [{ id: 'custom', sets: 3 }] })
const session = (d, over = {}) => ({ d, entries: [{ id: 'custom', sets: [{ w: 20, r: 5, done: true }, { w: 20, r: 5, done: false }] }], ...over })

describe('FrayFit dashboard reads the existing profile', () => {
  it('uses the real local week, excluding previous and following weeks', () => {
    const S = { ...base, workouts: [session('2026-11-01'), session('2026-11-02'), session('2026-11-06'), session('2026-11-09')] }
    const result = frayfitHome(S, new Date('2026-11-06T12:00:00'))
    expect(result.days.map(d => d.iso)).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'])
    expect(result.week).toEqual({ sessions: 2, sets: 2, volume: 200 })
    expect(result.days[4].done).toBe(true)
    expect(S.workouts).toHaveLength(4)
  })

  it('respects Sunday as first day and legacy cached volume', () => {
    const S = { ...base, weekStart: 0, workouts: [{ d: '2026-11-01', vol: 120 }] }
    const result = frayfitHome(S, new Date('2026-11-06T12:00:00'))
    expect(result.days[0].iso).toBe('2026-11-01')
    expect(result.week).toEqual({ sessions: 1, sets: 0, volume: 120 })
  })

  it('keeps every same-day routine and skips ones already completed', () => {
    const S = { ...base, routines: [routine('a'), routine('b')], week: { 5: ['a', 'b'] }, workouts: [session('2026-11-06', { routineIds: ['a'] })] }
    expect(frayfitHome(S, new Date('2026-11-06T12:00:00')).next.routines.map(r => r.id)).toEqual(['b'])
    expect(frayfitHome({ ...S, workouts: [] }, new Date('2026-11-06T12:00:00')).next.routines.map(r => r.id)).toEqual(['a', 'b'])
  })

  it('does not fabricate a session or progress for an empty profile', () => {
    const result = frayfitHome(base, new Date('2026-11-06T12:00:00'))
    expect(result.next).toBeNull()
    expect(result.week).toEqual({ sessions: 0, sets: 0, volume: 0 })
  })
})
