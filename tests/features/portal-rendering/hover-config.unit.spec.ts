import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { resolveHoverConfig, hoverConfigClasses, hoverConfigStyle } from '../../../portal/app/utils/hover.ts'

test.describe('hover config resolution', () => {
  test('defaults to darken and primary when nothing is configured', () => {
    const resolved = resolveHoverConfig(undefined, undefined)
    assert.deepEqual(resolved, { effects: ['darken'], color: 'primary' })
    assert.deepEqual(hoverConfigClasses(resolved), ['pt-hover'])
    assert.equal(hoverConfigStyle(resolved), undefined)
  })

  test('block config wins over portal defaults, per field', () => {
    const resolved = resolveHoverConfig({ effects: ['background'] }, { effects: ['elevate'], color: 'secondary' })
    assert.deepEqual(resolved.effects, ['background'])
    assert.equal(resolved.color, 'secondary')
    assert.deepEqual(hoverConfigStyle(resolved), {
      '--pt-hover-color': 'var(--v-theme-secondary)',
      '--pt-hover-on-color': 'var(--v-theme-on-secondary)'
    })
  })

  test('portal defaults apply when block is not configured', () => {
    const resolved = resolveHoverConfig(undefined, { effects: ['elevate', 'titleUnderline'] })
    assert.deepEqual(hoverConfigClasses(resolved), ['pt-hover', 'pt-hover--no-darken', 'pt-hover--elevate', 'pt-hover--title-underline'])
  })

  test('explicitly emptied effects disable everything', () => {
    const resolved = resolveHoverConfig({ effects: [] }, { effects: ['elevate'] })
    assert.deepEqual(hoverConfigClasses(resolved), ['pt-hover', 'pt-hover--no-darken'])
  })

  test('color effects emit style vars, others do not', () => {
    assert.notEqual(hoverConfigStyle(resolveHoverConfig({ effects: ['border'] })), undefined)
    assert.notEqual(hoverConfigStyle(resolveHoverConfig({ effects: ['titleColor'] })), undefined)
    assert.equal(hoverConfigStyle(resolveHoverConfig({ effects: ['elevate', 'imageZoom', 'darken'] })), undefined)
  })

  test('darken keeps the native overlay (no modifier class)', () => {
    const resolved = resolveHoverConfig({ effects: ['darken', 'elevate'] })
    assert.deepEqual(hoverConfigClasses(resolved), ['pt-hover', 'pt-hover--elevate'])
  })
})
