import { expect, it } from 'vitest'
import { frayfitLanguage } from './frayfit-language.js'

it('starts FrayFit in French before and after loading instance settings', () => {
  const fresh = { lang: 'en', langAuto: true }
  expect(frayfitLanguage(fresh, null)).toBe('fr')
  expect(frayfitLanguage(fresh, {})).toBe('fr')
  expect(frayfitLanguage(fresh, { default_lang: 'pt-BR' })).toBe('pt-BR')
  expect(fresh).toEqual({ lang: 'en', langAuto: true })
})

it('preserves explicit and legacy profile language preferences', () => {
  for (const lang of ['en', 'ar', 'fr']) {
    expect(frayfitLanguage({ lang }, null)).toBe(lang)
    expect(frayfitLanguage({ lang, langAuto: false }, {})).toBe(lang)
  }
})
