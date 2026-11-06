import { expect, it } from 'vitest'
import { frayfitMomentum } from './frayfit-momentum.js'

const now = new Date('2026-11-06T12:00:00')
const rec = (d, more = {}) => ({ d, entries: [{ sets: [{ done: true }, { done: false }] }], ...more })

it('compares two inclusive 28-day windows and excludes future and invalid history', () => {
  const S = { weekStart: 1, workouts: [rec('2026-10-10'), rec('2026-11-06'), rec('2026-11-06'), rec('2026-10-09'), rec('2026-09-11'), rec('2026-11-07'), rec('bad')] }
  const before = structuredClone(S)
  const m = frayfitMomentum(S, now)
  expect(m.current.sessions).toBe(3)
  expect(m.previous.sessions).toBe(1)
  expect(m.change).toBe(2)
  expect(m.current.sets).toBe(3)
  expect(m.activeDays).toBe(2)
  expect(m.days).toHaveLength(84)
  expect(m.days.find(d => d.iso === '2026-11-06').workouts).toHaveLength(2)
  expect(m.days.find(d => d.iso === '2026-11-07').future).toBe(true)
  expect(S).toEqual(before)
})

it('counts unilateral sides and only known positive durations, preserving unknown imports', () => {
  const S = { workouts: [rec('2026-11-06', { start: 1000, end: 601000, entries: [{ sets: [{ sides: { L: { done: true }, R: { done: false } } }] }] }), rec('2026-11-05', { start: 1000, end: 500 }), rec('2026-11-04', { entries: [] })] }
  const m = frayfitMomentum(S, now)
  expect(m.current.sets).toBe(2)
  expect(m.current.durationMs).toBe(600000)
  expect(m.current.timedSessions).toBe(1)
  expect(frayfitMomentum({ workouts: [rec('2026-11-06')] }, now).current.timedSessions).toBe(0)
})

it('keeps an empty profile empty and follows Sunday or Monday calendar preferences', () => {
  const m = frayfitMomentum({ workouts: [], weekStart: 0 }, now)
  expect(m.current.sessions).toBe(0)
  expect(m.previous.sessions).toBe(0)
  expect(m.activeDays).toBe(0)
  expect(new Date(m.days[0].iso + 'T12:00:00').getDay()).toBe(0)
  expect(new Date(frayfitMomentum({ workouts: [], weekStart: 1 }, now).days[0].iso + 'T12:00:00').getDay()).toBe(1)
})

it('never turns missing or malformed imported timestamps into duration', () => {
  for (const start of ['', false, 'invalid', null]) {
    const m = frayfitMomentum({ workouts: [rec('2026-11-06', { start, end: 1793962800000 })] }, now)
    expect(m.current.durationMs).toBe(0)
    expect(m.current.timedSessions).toBe(0)
  }
})
