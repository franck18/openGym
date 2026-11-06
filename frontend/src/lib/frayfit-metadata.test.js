import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it } from 'vitest'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const html = read('../../index.html')

it('publishes consistent FrayFit PWA identity without changing its installation scope', () => {
  const manifest = JSON.parse(read('../../public/manifest.json'))
  expect(html).toContain('<title>FrayFit</title>')
  expect(html).toContain('content="FrayFit"')
  expect(manifest.name).toBe('FrayFit')
  expect(manifest.short_name).toBe('FrayFit')
  expect(manifest.start_url).toBe('./')
  expect(manifest.scope).toBe('./')
  expect(manifest.icons.some(icon => icon.src === 'frayfit-icon.svg')).toBe(true)
})

it('boots in French for new installations and preserves existing language and RTL preferences', () => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  for (const [saved, language, expected, direction] of [
    [{}, 'en-US', 'fr', 'ltr'], [{ lang: 'en', langAuto: true }, 'en-US', 'fr', 'ltr'], [{ lang: 'en' }, 'fr-FR', 'en', 'ltr'], [{ lang: 'ar' }, 'fr-FR', 'ar', 'rtl'],
  ]) {
    const document = { documentElement: {} }
    vm.runInNewContext(script, {
      document, navigator: { language }, localStorage: { getItem: key => { expect(key).toBe('gym_state_v1'); return JSON.stringify(saved) } },
      window: { addEventListener() {} }, setTimeout() {},
    })
    expect(document.documentElement).toEqual({ lang: expected, dir: direction })
  }
})

it('separates AGPL software source from exercise-media permissions in public credits', () => {
  const credits = read('../../public/frayfit-credits.html')
  expect(credits).toContain('Duarte Santos')
  expect(credits).toContain('https://github.com/franck18/openGym/tree/codex/frayfit-personal')
  expect(credits).toContain('AGPL')
  expect(credits).toContain('Aliaksandr Makatserchyk')
  expect(credits).toContain('180')
  expect(credits).toContain('NOTICE.md')
})
