// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { DEF, useStore } from './store/useStore.js'
import { useUI } from './store/useUI.js'

vi.mock('./lib/sound.js', () => ({ setPlayOnSilent: vi.fn(), setVibrate: vi.fn(), setAlarmBuzzer: vi.fn() }))
vi.mock('./lib/api.js', async importOriginal => ({ ...await importOriginal(), api: vi.fn(() => Promise.resolve({})), beacon: vi.fn() }))
globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root, original
beforeEach(() => {
  original = useStore.getState()
  localStorage.setItem('gym_guest', '1')
  window.location.hash = '#/home'
  window.scrollTo = vi.fn()
  useStore.setState({ S: structuredClone(DEF), user: null, ready: true, boot: vi.fn(), config: {} })
  useUI.setState({ sheets: [], work: null, timer: null })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount()); host.remove()
  useStore.setState(original); localStorage.clear()
})

it('routes the main home to FrayFit and retains the original dashboard at its detailed route', async () => {
  await act(async () => root.render(<App />))
  expect(host.querySelector('.frayfit-home h1').textContent).toBe('Ton entraînement, à ton rythme.')
  expect(host.querySelector('#app').classList.contains('frayfit-shell')).toBe(true)
  expect(host.querySelector('#tabbar')).toBeTruthy()
  await act(async () => host.querySelector('a[href="#/home/details"]').click())
  expect(window.location.hash).toBe('#/home/details')
  expect(host.querySelector('.frayfit-home')).toBeNull()
  expect(host.querySelector('.today-row')).toBeTruthy()
  expect(host.querySelector('.frayfit-sidebar a[aria-current="page"]').getAttribute('href')).toBe('#/home')
})

it('offers a desktop start route and hides its sidebar while the active workout owns the screen', async () => {
  await act(async () => root.render(<App />))
  const start = [...host.querySelectorAll('.frayfit-home button')].find(button => button.textContent === 'Nouvelle séance')
  await act(async () => start.click())
  expect(window.location.hash).toBe('#/workout')
  expect(host.querySelector('.frayfit-sidebar')).toBeTruthy()
  await act(async () => useStore.setState({ S: { ...useStore.getState().S, active: { id: 'live', name: 'Test', start: Date.now(), entries: [], cur: 0 } } }))
  expect(host.querySelector('.frayfit-sidebar')).toBeNull()
  expect(host.querySelector('#tabbar')).toBeNull()
})
