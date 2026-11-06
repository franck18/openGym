import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const media = join(root, 'catalogue/media')
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])

it('ships every licensed media file once at the same URL, in layers below registry upload limits', () => {
  const copies = [...readFileSync(join(root, 'web/Dockerfile'), 'utf8').matchAll(/^COPY (catalogue\/media\/\S*) (\/usr\/share\/nginx\/html\/exercise-media\/\S*)$/gm)]
  const destinations = [], sizes = []
  expect(copies.length).toBeGreaterThan(0)
  for (const [, source, target] of copies) {
    const absolute = join(root, source)
    const isDir = source.endsWith('/')
    const files = isDir ? walk(absolute) : source.includes('*')
      ? readdirSync(dirname(absolute)).filter(n => new RegExp('^' + basename(source).replaceAll('.', '\\.').replaceAll('*', '.*') + '$').test(n)).map(n => join(dirname(absolute), n))
      : [absolute]
    expect(files.length).toBeGreaterThan(0)
    sizes.push(files.reduce((n, p) => n + statSync(p).size, 0))
    for (const path of files) {
      const expected = relative(media, path).replaceAll('\\', '/')
      const destination = target.replace('/usr/share/nginx/html/exercise-media/', '') + (isDir ? relative(absolute, path).replaceAll('\\', '/') : basename(path))
      expect(destination).toBe(expected)
      destinations.push(destination)
    }
  }
  expect(destinations.sort()).toEqual(walk(media).map(p => relative(media, p).replaceAll('\\', '/')).sort())
  expect(Math.max(...sizes)).toBeLessThan(50 * 1024 * 1024)
})
