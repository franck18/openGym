import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const source = () => readFileSync(new URL('../../public/frayfit-repair.js', import.meta.url), 'utf8')
const page = () => readFileSync(new URL('../../public/frayfit-repair.html', import.meta.url), 'utf8')

function recovery({ base = '/gym/', fail = false } = {}) {
  const registrations = [
    { scope: 'https://gym.test' + base, active: { scriptURL: 'https://gym.test' + base + 'sw.js' }, unregister: vi.fn(async () => { if (fail) throw new Error('unavailable'); return true }) },
    { scope: 'https://gym.test/another/', active: { scriptURL: 'https://gym.test/another/sw.js' }, unregister: vi.fn(async () => true) },
    { scope: 'https://gym.test' + base, active: { scriptURL: 'https://gym.test' + base + 'unrelated-worker.js' }, unregister: vi.fn(async () => true) },
  ]
  const names = ['opengym-rt-old', 'opengym-rt-current', 'opengym-media-v1', 'opengym-device', 'other-app-cache']
  const button = { disabled: false, addEventListener: (event, fn) => { button.click = fn } }
  const status = { textContent: '' }
  const env = {
    document: { getElementById: id => id === 'repair' ? button : status },
    navigator: { serviceWorker: { getRegistrations: vi.fn(async () => registrations) } },
    caches: { keys: vi.fn(async () => names), delete: vi.fn(async () => true) },
    location: { href: 'https://gym.test' + base + 'frayfit-repair.html', replace: vi.fn() },
    URL, Date,
  }
  for (const name of ['localStorage', 'sessionStorage', 'indexedDB']) Object.defineProperty(env, name, { get() { throw new Error('Profile storage must never be accessed') } })
  vm.runInNewContext(source(), env)
  return { env, registrations, button, status }
}

describe('standalone FrayFit startup repair', () => {
  it('loads without React or an inline script and explains that personal data stays', () => {
    expect(page()).toContain('src="frayfit-repair.js"')
    expect(page()).not.toMatch(/<script(?![^>]*\bsrc=)/)
    expect(page()).toContain('Vos données sont conservées')
    expect(page()).toContain('id="repair"')
  })

  it('waits for an explicit click before changing anything', () => {
    const { env, button } = recovery()
    expect(button.click).toBeTypeOf('function')
    expect(env.navigator.serviceWorker.getRegistrations).not.toHaveBeenCalled()
    expect(env.caches.keys).not.toHaveBeenCalled()
    expect(env.location.replace).not.toHaveBeenCalled()
  })

  it.each(['/', '/gym/'])('repairs only app shell files and the matching worker at %s, preserving every other cache and profile', async base => {
    const { env, registrations, button } = recovery({ base })
    await button.click()
    expect(registrations[0].unregister).toHaveBeenCalledOnce()
    expect(registrations[1].unregister).not.toHaveBeenCalled()
    expect(registrations[2].unregister).not.toHaveBeenCalled()
    expect(env.caches.delete.mock.calls.map(args => args[0])).toEqual(['opengym-rt-old', 'opengym-rt-current'])
    const destination = new URL(env.location.replace.mock.calls[0][0])
    expect(destination.origin + destination.pathname).toBe('https://gym.test' + base)
    expect(destination.searchParams.get('frayfit_reload')).toMatch(/^\d+$/)
    expect(button.disabled).toBe(true)
  })

  it('leaves caches intact and offers retry if the worker cannot be unregistered', async () => {
    const { env, button, status } = recovery({ fail: true })
    await button.click()
    expect(env.caches.delete).not.toHaveBeenCalled()
    expect(env.location.replace).not.toHaveBeenCalled()
    expect(button.disabled).toBe(false)
    expect(status.textContent).toContain('Réessayez')
  })
})
