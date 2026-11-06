// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { EXIDX } from '../lib/exercises.js'
import { eqAvailable } from '../lib/equipment.js'
import * as starter from '../lib/starter.js'
import { FrayFitPrograms, openFrayFitPrograms } from './FrayFitPrograms.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const home = { id: 'home', name: 'À la maison', equipment: ['dumbbell'], accV: 2 }
const mine = { id: 'mine', name: 'Ma séance', emoji: 'star', ex: [{ id: '0025', sets: 2, reps: 6, weight: 30 }] }
const history = [{ id: 'logged', d: '2026-11-01', name: 'Séance enregistrée', entries: [] }]
const S = () => useStore.getState().S
let mounted

function mount(element) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push({ root, host })
  act(() => root.render(element))
  return host
}

function renderTop() {
  const sheet = useUI.getState().sheets.at(-1)
  return mount(sheet.render(() => useUI.getState().closeSheet(sheet.id)))
}

const button = (host, label) => [...host.querySelectorAll('button')].find(b => b.textContent === label)
const click = element => act(() => element.click())
const pick = (host, id) => click(host.querySelector(`[data-program-id="${id}"]`))
const nameOn = day => S().routines.find(r => r.id === [].concat(S().week[day] || [])[0])?.name
const previewIds = host => [...host.querySelectorAll('[data-exercise-id]')].map(row => row.dataset.exerciseId)

beforeEach(() => {
  mounted = []
  useUI.setState({ sheets: [], toastMsg: '' })
  useStore.setState(s => ({ S: {
    ...s.S, lang: 'en', routines: [structuredClone(mine)], week: {}, workouts: structuredClone(history),
    equipProfiles: [structuredClone(home)], activeEquipId: 'home', equipFilterOn: false, active: null,
    queue: null, scheduleMode: null,
  } }))
})

afterEach(() => {
  act(() => mounted.forEach(({ root }) => root.unmount()))
  mounted.forEach(({ host }) => host.remove())
  vi.restoreAllMocks()
})

describe('FrayFit program studio', () => {
  it('opens a wide sheet with all four real plans and a complete exercise preview', () => {
    openFrayFitPrograms()
    expect(useUI.getState().sheets.at(-1).wide).toBe(true)
    const host = renderTop()
    expect([...host.querySelectorAll('[data-program-id]')].map(b => b.dataset.programId))
      .toEqual(['ppl', 'upper-lower', 'full-body', '5x5'])
    const squat = host.querySelector('[data-exercise-id="0043"]')
    expect(squat.textContent).toContain('Barbell Full Squat')
    expect(squat.textContent).toContain('3 séries × 8 rép.')
    expect(previewIds(host)).toHaveLength(18)
    expect(host.querySelectorAll('img, video, canvas')).toHaveLength(0)
  })

  it('filters and previews equipment without writing profile data or history', () => {
    const before = structuredClone(S())
    const saved = localStorage.getItem('gym_state_v1')
    const host = mount(<FrayFitPrograms close={() => {}} />)
    click(button(host, '4 jours'))
    expect([...host.querySelectorAll('[data-program-id]')].map(b => b.dataset.programId)).toEqual(['upper-lower'])
    expect(host.querySelector('[data-program-id="upper-lower"]').getAttribute('aria-pressed')).toBe('true')
    const select = host.querySelector('select')
    act(() => { select.value = 'home'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(previewIds(host)).not.toContain('0043')
    for (const id of previewIds(host)) expect(eqAvailable(['dumbbell'], EXIDX[id])).toBe(true)
    click(button(host, '3 jours'))
    expect(host.querySelectorAll('[data-program-id]')).toHaveLength(3)
    pick(host, '5x5')
    expect(S()).toEqual(before)
    expect(localStorage.getItem('gym_state_v1')).toBe(saved)
  })

  it('applies the selected plan with exactly the equipment-fitted exercises it previewed', () => {
    const host = mount(<FrayFitPrograms close={() => {}} />)
    pick(host, 'upper-lower')
    const select = host.querySelector('select')
    act(() => { select.value = 'home'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    const shown = previewIds(host)
    click(button(host, 'Ajouter à ma semaine'))
    expect([1, 2, 4, 5].map(nameOn)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B'])
    expect(S().routines.slice(1).flatMap(r => r.ex.map(e => e.id))).toEqual(shown)
    expect(S().routines[0]).toEqual(mine)
    expect(S().workouts).toEqual(history)
    expect(S().equipProfiles).toEqual([home])
    expect(S().activeEquipId).toBe('home')
    expect(S().equipFilterOn).toBe(false)
    expect(S().routines.slice(1).every(r => r.ex.every(e => e.weight === 0))).toBe(true)
  })

  it('previews the existing custom sets and reps that the loader will preserve when reusing a routine', () => {
    const customized = {
      id: 'custom-full-body', name: 'Full Body A', emoji: 'star',
      ex: [
        { id: '0043', sets: 5, reps: 12, weight: 62.5 },
        { id: '0025', sets: 4, reps: 6, weight: 40 },
        { id: '2330', sets: 3, reps: 10, weight: 25 },
        { id: '0586', sets: 3, reps: 12, weight: 20 },
        { id: '0334', sets: 2, reps: 12, weight: 5 },
        { id: '0031', sets: 2, reps: 12, weight: 8 },
      ],
    }
    useStore.setState(s => ({ S: { ...s.S, routines: [mine, structuredClone(customized)] } }))
    const before = structuredClone(S())
    const host = mount(<FrayFitPrograms close={() => {}} />)
    const session = [...host.querySelectorAll('.ff-program-session')].find(el => el.querySelector('h4').textContent === 'Full Body A')
    expect(session.querySelector('[data-exercise-id="0043"]').textContent).toContain('5 séries × 12 rép.')
    expect(session.querySelector('[data-exercise-id="0025"]').textContent).toContain('4 séries × 6 rép.')
    expect(session.textContent).toContain('Tes réglages conservés')
    expect(S()).toEqual(before)

    click(button(host, 'Ajouter à ma semaine'))
    expect(S().week[1]).toEqual(['custom-full-body'])
    expect(S().routines.find(r => r.id === 'custom-full-body')).toEqual(customized)
    expect(S().routines.filter(r => r.name === 'Full Body A')).toHaveLength(1)
    expect(S().workouts).toEqual(history)
  })

  it('requires explicit confirmation and identifies the exact occupied weekdays before applying', () => {
    useStore.setState(s => ({ S: { ...s.S, week: { 1: ['mine'], 3: ['mine'], 5: ['deleted'] } } }))
    const before = structuredClone(S())
    openFrayFitPrograms()
    const host = renderTop()
    pick(host, 'upper-lower')
    click(button(host, 'Ajouter à ma semaine'))
    expect(S()).toEqual(before)
    expect(useUI.getState().sheets).toHaveLength(2)
    const confirm = renderTop()
    const taken = confirm.querySelector('[data-occupied-days]')
    expect(taken.textContent).toContain('Lundi : Ma séance')
    expect(taken.textContent).not.toContain('Mercredi')
    expect(taken.textContent).not.toContain('Vendredi')
    expect(confirm.textContent).toContain('Lundi, Mardi, Jeudi et Vendredi')
    expect(confirm.textContent).toContain('Tes routines et ton historique restent conservés.')
    click(button(confirm, 'Réaffecter et ajouter'))
    expect([1, 2, 4, 5].map(nameOn)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B'])
    expect(S().week[3]).toEqual(['mine'])
    expect(S().routines[0]).toEqual(mine)
    expect(S().workouts).toEqual(history)
    expect(useUI.getState().sheets).toHaveLength(0)
  })

  it('keeps the existing week and selected preview when reassignment is cancelled', () => {
    useStore.setState(s => ({ S: { ...s.S, week: { 1: ['mine'] } } }))
    const before = structuredClone(S())
    openFrayFitPrograms()
    const host = renderTop()
    pick(host, '5x5')
    click(button(host, 'Ajouter à ma semaine'))
    click(button(renderTop(), 'Garder ma semaine'))
    expect(S()).toEqual(before)
    expect(useUI.getState().sheets).toHaveLength(1)
    expect(host.querySelector('[data-program-id="5x5"]').getAttribute('aria-pressed')).toBe('true')
  })

  it('ignores stale weekday ids and starts on the active equipment profile only when its filter is enabled', () => {
    useStore.setState(s => ({ S: { ...s.S, equipFilterOn: true, week: { 1: ['deleted'], 6: ['mine'] } } }))
    const host = mount(<FrayFitPrograms close={() => {}} />)
    expect(host.querySelector('select').value).toBe('home')
    pick(host, '5x5')
    click(button(host, 'Ajouter à ma semaine'))
    expect(useUI.getState().sheets).toHaveLength(0)
    expect(nameOn(1)).toBe('5×5 A')
    expect(S().week[6]).toEqual(['mine'])
  })

  it('disables adding and explains when the equipment-fitted preview has no sessions', () => {
    vi.spyOn(starter, 'buildStarterPlan').mockReturnValue({ routines: [], schedule: [], fit: { swapped: 0, dropped: 18 } })
    const before = structuredClone(S())
    const host = mount(<FrayFitPrograms close={() => {}} />)
    expect(button(host, 'Ajouter à ma semaine').disabled).toBe(true)
    expect(host.textContent).toContain('Aucune séance disponible avec ce matériel')
    click(button(host, 'Ajouter à ma semaine'))
    expect(S()).toEqual(before)
  })
})
