// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { DEF, useStore } from '../store/useStore.js'
import { startFlow, starterPlanSheet, bwSheet } from '../sheets.jsx'
import FrayFitHome from './FrayFitHome.jsx'
import FrayFitSidebar from '../components/FrayFitSidebar.jsx'
import { openFrayFitPrograms } from '../components/FrayFitPrograms.jsx'

vi.mock('../sheets.jsx', () => ({ startFlow: vi.fn(), starterPlanSheet: vi.fn(), bwSheet: vi.fn(), dayOverrideSheet: vi.fn(), calendarSheet: vi.fn(), workoutDetailSheet: vi.fn() }))
vi.mock('../components/FrayFitPrograms.jsx', () => ({ openFrayFitPrograms: vi.fn() }))
globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root, original
const Location = () => <output data-location>{useLocation().pathname}</output>
const mount = (over = {}) => {
  useStore.setState({ S: { ...structuredClone(DEF), ...over }, user: null })
  act(() => root.render(<MemoryRouter initialEntries={['/home']}><FrayFitSidebar /><FrayFitHome /><Location /></MemoryRouter>))
}
const click = text => {
  const button = [...host.querySelectorAll('button, a')].find(el => el.textContent.includes(text))
  expect(button, text).toBeTruthy()
  act(() => button.click())
}
beforeEach(() => {
  original = useStore.getState()
  vi.clearAllMocks()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove(); useStore.setState(original) })

describe('FrayFit home actions', () => {
  it('offers a starter plan, exercise library and weight logging with no account data added', () => {
    mount()
    expect(host.textContent).toContain('Ton entraînement, à ton rythme.')
    expect(host.textContent).toContain('Ta première séance lance ton historique.')
    click('Choisir un programme'); expect(openFrayFitPrograms).toHaveBeenCalledOnce()
    expect(host.textContent).toContain('Ton élan, jour après jour.')
    click('Enregistrer mon poids'); expect(bwSheet).toHaveBeenCalledOnce()
    click('Explorer les exercices'); expect(host.querySelector('[data-location]').textContent).toBe('/library')
    expect(useStore.getState().S.workouts).toEqual([])
    expect(useStore.getState().S.routines).toEqual([])
  })

  it('starts the combined same-day plan, displaying custom exercises by their real name', () => {
    const day = new Date().getDay()
    mount({ routines: [{ id: 'a', name: 'Haut', ex: [{ id: 'personal', sets: 3, reps: 8 }] }, { id: 'b', name: 'Bas', ex: [{ id: 'personal', sets: 2 }] }], customEx: [{ id: 'personal', n: 'Mon mouvement' }], week: { [day]: ['a', 'b'] } })
    expect(host.textContent).toContain('Haut + Bas')
    expect(host.textContent).toContain('Mon mouvement')
    click('Commencer la séance'); expect(startFlow).toHaveBeenCalledWith(['a', 'b'])
    click('Nouvelle séance'); expect(host.querySelector('[data-location]').textContent).toBe('/workout')
  })

  it.each([{}, { editingWorkoutId: 'saved' }])('resumes an active workout or saved editor without overwriting it: %j', flags => {
    const active = { id: 'active', name: 'Ma séance', entries: [], start: Date.now(), ...flags }
    mount({ active })
    click(flags.editingWorkoutId ? 'Continuer la modification' : 'Reprendre la séance')
    expect(host.querySelector('[data-location]').textContent).toBe('/workout')
    expect(startFlow).not.toHaveBeenCalled()
    expect(useStore.getState().S.active).toEqual(active)
  })

  it('links every sidebar destination and retains the detailed original dashboard', () => {
    mount()
    const links = [...host.querySelectorAll('.frayfit-sidebar nav a')]
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/home', '/plan', '/library', '/history', '/stats'])
    expect(links[0].getAttribute('aria-current')).toBe('page')
    click('Vue détaillée'); expect(host.querySelector('[data-location]').textContent).toBe('/home/details')
    click('Mon compte'); expect(host.querySelector('[data-location]').textContent).toBe('/settings')
  })

  it('shows the latest of two sessions logged on the same day', () => {
    const d = new Date().toISOString().slice(0, 10)
    mount({ workouts: [{ id: 'first', name: 'Matin', d, start: 1000, entries: [] }, { id: 'second', name: 'Soir', d, start: 2000, entries: [] }] })
    expect(host.querySelector('.frayfit-progress-content').textContent).toContain('Dernière séance : Soir')
  })

  it('counts each completed side of an active unilateral set', () => {
    mount({ active: { id: 'active', name: 'Ma séance', start: Date.now(), entries: [{ id: '0025', sets: [{ done: false, sides: { L: { done: true, w: 10, r: 8 }, R: { done: false, w: 10, r: 8 } } }] }] } })
    expect(host.querySelector('.frayfit-exercise-list').textContent).toContain('1 / 2 séries')
  })
})
