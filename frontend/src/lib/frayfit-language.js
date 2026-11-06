import { effectiveLang } from './default-lang.js'

// The personal edition starts in French. Existing explicit or legacy choices still win;
// this only supplies the instance fallback, without writing to the synced profile.
export function frayfitLanguage(S, config) {
  return effectiveLang(S, { ...config, default_lang: config?.default_lang || 'fr' })
}
