// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import FrayFitMomentum from './FrayFitMomentum.jsx'
import { calendarSheet, workoutDetailSheet } from '../sheets.jsx'
vi.mock('../sheets.jsx', () => ({ calendarSheet: vi.fn(), workoutDetailSheet: vi.fn() }))
globalThis.IS_REACT_ACT_ENVIRONMENT = true

it('shows honest empty statistics and opens actual history days', () => {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const workout = { id: 'real', d: '2026-11-06', name: 'Ma séance', entries: [] }
  try {
    act(() => root.render(<FrayFitMomentum S={{ workouts: [] }} today="2026-11-06" />))
    expect(host.textContent).toContain('Ton point de départ')
    expect(host.textContent).toContain('Durée renseignée')
    expect(host.textContent).toContain('–')
    expect(host.querySelectorAll('.ff-activity-day')).toHaveLength(84)
    expect(host.querySelector('.ff-activity-day').textContent).toBe('')
    expect(host.querySelector('.ff-activity-day').getAttribute('aria-label')).toContain('séance')
    act(() => root.render(<FrayFitMomentum S={{ workouts: [workout] }} today="2026-11-06" />))
    act(() => host.querySelector('[data-day="2026-11-06"]').click())
    expect(workoutDetailSheet).toHaveBeenCalledWith(workout)
    act(() => host.querySelector('[data-day="2026-11-05"]').click())
    expect(calendarSheet).toHaveBeenCalledWith('2026-11-05')
    expect(host.querySelector('[data-day="2026-11-07"]').disabled).toBe(true)
  } finally { act(() => root.unmount()); host.remove() }
})
