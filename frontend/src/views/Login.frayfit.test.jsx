// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Login from './Login.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  demo: false, webauthn: true, config: { allow_guest: true },
  setUser: vi.fn(), adoptProfile: vi.fn(), setGuest: vi.fn(),
  passkeyLogin: vi.fn(), device: vi.fn(), lost: vi.fn(), password: vi.fn(), sheet: vi.fn(),
}))
vi.mock('../store/useStore.js', () => {
  const snapshot = () => mocks
  const useStore = selector => selector ? selector(snapshot()) : snapshot()
  useStore.getState = snapshot
  return { useStore, hasData: () => false }
})
vi.mock('../store/useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn(), openSheet: mocks.sheet }) } }))
vi.mock('../lib/api.js', () => ({
  webauthnOK: () => mocks.webauthn, passkeyLogin: mocks.passkeyLogin,
  passkeyRegister: vi.fn(), passkeyError: e => e.message, bio: () => 'fingerprint',
}))
vi.mock('../lib/demo.js', () => ({ get DEMO() { return mocks.demo }, REPO: 'https://example.invalid/upstream' }))
vi.mock('../lib/i18n.js', () => ({ t: (text, value) => text.replace('{0}', value) }))
vi.mock('../sheets.jsx', () => ({ askAddDeviceData: vi.fn() }))
vi.mock('../components/PasswordAuth.jsx', () => ({ passwordOn: c => !!c?.password_login, PasswordRegisterForm: () => null, openPasswordSignIn: mocks.password }))
vi.mock('../components/Passkeys.jsx', () => ({ openDeviceLinkRedeem: mocks.device }))
vi.mock('../components/LostAccess.jsx', () => ({ openLostAccess: mocks.lost }))

let root, host
function mount() {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => root.render(<Login />))
  return host
}
function click(text) {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent === text)
  expect(button, text).toBeTruthy()
  return act(async () => { button.click() })
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.demo = false; mocks.webauthn = true; mocks.config = { allow_guest: true }
  mocks.passkeyLogin.mockResolvedValue({ id: 'existing', name: 'Franck' })
})
afterEach(() => { act(() => root?.unmount()); host?.remove() })

it('identifies the personal fork and makes credits and corresponding source reachable', () => {
  mount()
  expect(host.querySelector('h1').textContent).toContain('Votre entraînement')
  expect(host.textContent).toContain('FrayFit, version personnelle de Franck Raymond, basée sur OpenGym par Duarte Santos')
  expect(host.querySelector('a[href="./frayfit-credits.html"]').textContent).toBe('À propos et crédits')
  expect(host.querySelector('a[href="https://github.com/franck18/openGym/tree/codex/frayfit-personal"]').textContent).toContain('Code source')
})

it('preserves existing passkey adoption, registration, device-link, recovery and guest actions', async () => {
  mount()
  await click('Sign in with passkey')
  expect(mocks.setUser).toHaveBeenCalledWith({ id: 'existing', name: 'Franck' }, { adopt: true })
  expect(mocks.adoptProfile).toHaveBeenCalledOnce()
  await click('Create new profile'); expect(mocks.sheet).toHaveBeenCalledOnce()
  await click('Use a code from your other device'); expect(mocks.device).toHaveBeenCalledOnce()
  await click('Lost access?'); expect(mocks.lost).toHaveBeenCalledOnce()
  await click('Continue without account'); expect(mocks.setGuest).toHaveBeenCalledWith(true)
})

it('keeps password-only account requirements without offering guest or device-link', async () => {
  mocks.webauthn = false; mocks.config = { allow_guest: false, password_login: true }
  mount()
  expect(host.textContent).not.toContain('Continue without account')
  expect(host.textContent).not.toContain('Use a code from your other device')
  await click('Sign in with password'); expect(mocks.password).toHaveBeenCalledOnce()
})

it('keeps the local-only demo entrance and exposes fork credits there too', async () => {
  mocks.demo = true
  mount()
  expect(host.textContent).not.toContain('Sign in with passkey')
  expect(host.querySelector('a[href="./frayfit-credits.html"]')).toBeTruthy()
  await click('Start the demo'); expect(mocks.setGuest).toHaveBeenCalledWith(true)
})
