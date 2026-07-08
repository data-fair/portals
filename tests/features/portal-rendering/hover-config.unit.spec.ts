import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import {
  resolveHoverConfig, hoverElevation, hoverBackground, hoverRootStyle,
  hoverTitleStyle, hoverUnderlineBarStyle, hoverImageStyle,
  resolveButtonHover, hoverButtonStyle, stripMotion
} from '../../../portal/app/utils/hover.ts'

test.describe('hover config resolution', () => {
  test('defaults to darken and primary when nothing is configured', () => {
    assert.deepEqual(resolveHoverConfig(undefined, undefined), { effects: ['darken'], color: 'primary' })
  })

  test('block config wins over portal defaults, per field', () => {
    const resolved = resolveHoverConfig({ effects: ['background'] }, { effects: ['elevate'], color: 'secondary' })
    assert.deepEqual(resolved.effects, ['background'])
    assert.equal(resolved.color, 'secondary')
  })

  test('explicitly emptied effects disable everything', () => {
    assert.deepEqual(resolveHoverConfig({ effects: [] }, { effects: ['elevate'] }).effects, [])
  })

  test('relevant effects filter keeps subset, falls back to darken when nothing relevant remains', () => {
    const subset = resolveHoverConfig({ effects: ['background', 'titleColor'] }, undefined, ['darken', 'background'])
    assert.deepEqual(subset.effects, ['background'])
    const fallback = resolveHoverConfig({ effects: ['titleColor'] }, undefined, ['darken', 'background'])
    assert.deepEqual(fallback.effects, ['darken'])
    const emptied = resolveHoverConfig({ effects: [] }, undefined, ['darken', 'background'])
    assert.deepEqual(emptied.effects, [])
  })
})

test.describe('hover props helpers', () => {
  test('elevation raises only when hovering with the elevate effect', () => {
    const resolved = resolveHoverConfig({ effects: ['elevate'] })
    assert.equal(hoverElevation(resolved, true, 1), 8)
    assert.equal(hoverElevation(resolved, false, 1), 1)
    assert.equal(hoverElevation(resolveHoverConfig({ effects: ['grow'] }), true, 1), 1)
  })

  test('background swaps color only when hovering with the background effect', () => {
    const resolved = resolveHoverConfig({ effects: ['background'], color: 'accent' })
    assert.equal(hoverBackground(resolved, true, 'surface'), 'accent')
    assert.equal(hoverBackground(resolved, false, 'surface'), 'surface')
  })

  test('root style suppresses native overlay when darken is not selected', () => {
    assert.equal(hoverRootStyle(resolveHoverConfig({ effects: ['elevate'] }), false)?.['--v-hover-opacity'], '0')
    assert.equal(hoverRootStyle(resolveHoverConfig(undefined), false), undefined)
  })

  test('grow effect scales the root with a transition', () => {
    const resolved = resolveHoverConfig({ effects: ['grow'] })
    assert.equal(hoverRootStyle(resolved, true)?.transform, 'scale(1.02)')
    assert.equal(hoverRootStyle(resolved, false)?.transform, 'scale(1)')
    assert.match(hoverRootStyle(resolved, true)?.transition ?? '', /transform/)
  })

  test('border effect reserves a transparent border and colors it on hover', () => {
    const resolved = resolveHoverConfig({ effects: ['border'], color: 'accent' })
    const rest = hoverRootStyle(resolved, false)
    assert.equal(rest?.border, '1px solid transparent')
    assert.equal(rest?.borderColor, undefined)
    const hovering = hoverRootStyle(resolved, true)
    assert.equal(hovering?.borderColor, 'rgb(var(--v-theme-accent))')
    assert.equal(hoverRootStyle(resolved, true, { hasBorder: true })?.border, undefined)
  })

  test('inline background option writes background and on-color inline', () => {
    const resolved = resolveHoverConfig({ effects: ['background'], color: 'accent' })
    const style = hoverRootStyle(resolved, true, { inlineBackground: true })
    assert.equal(style?.backgroundColor, 'rgb(var(--v-theme-accent))')
    assert.equal(style?.color, 'rgb(var(--v-theme-on-accent))')
  })

  test('title style colors the title on hover only with the titleColor effect', () => {
    const resolved = resolveHoverConfig({ effects: ['titleColor'], color: 'accent' })
    assert.equal(hoverTitleStyle(resolved, true)?.color, 'rgb(var(--v-theme-accent))')
    assert.equal(hoverTitleStyle(resolved, false)?.color, undefined)
    assert.equal(hoverTitleStyle(resolveHoverConfig(undefined), true), undefined)
  })

  test('underline bar grows from scaleX(0) to scaleX(1)', () => {
    const resolved = resolveHoverConfig({ effects: ['titleUnderline'], color: 'accent' })
    assert.equal(hoverUnderlineBarStyle(resolved, false).transform, 'scaleX(0)')
    assert.equal(hoverUnderlineBarStyle(resolved, true).transform, 'scaleX(1)')
    assert.equal(hoverUnderlineBarStyle(resolved, true).backgroundColor, 'rgb(var(--v-theme-accent))')
  })

  test('image style zooms only with the imageZoom effect', () => {
    assert.equal(hoverImageStyle(resolveHoverConfig({ effects: ['imageZoom'] }), true)?.transform, 'scale(1.05)')
    assert.equal(hoverImageStyle(resolveHoverConfig({ effects: ['elevate'] }), true), undefined)
  })

  test('stripMotion removes transitions when reduced motion is preferred', () => {
    assert.equal(stripMotion({ transition: 'transform .2s', transform: 'scale(1)' }, true).transition, undefined)
    assert.equal(stripMotion({ transition: 'transform .2s' }, false).transition, 'transform .2s')
    assert.equal(stripMotion(undefined, true), undefined)
  })
})

test.describe('button hover resolution', () => {
  test('defaults to color swap when a hover color is resolvable, native darken otherwise', () => {
    assert.deepEqual(resolveButtonHover({ hoverColor: 'accent' }), { effects: ['color'], color: 'accent' })
    assert.deepEqual(resolveButtonHover(undefined, 'secondary'), { effects: ['color'], color: 'secondary' })
    assert.deepEqual(resolveButtonHover(undefined, undefined), { effects: ['darken'], color: 'primary' })
  })

  test('button hoverColor wins over the portal fallback', () => {
    assert.equal(resolveButtonHover({ hoverColor: 'accent' }, 'secondary').color, 'accent')
  })

  test('explicit effects selection replaces the default behavior', () => {
    assert.deepEqual(resolveButtonHover({ hoverEffects: ['elevate', 'grow'] }, 'secondary').effects, ['elevate', 'grow'])
  })

  test('button style suppresses overlay without darken, grows and transitions per effect', () => {
    const style = hoverButtonStyle(resolveButtonHover({ hoverEffects: ['color', 'grow'], hoverColor: 'accent' }), true)
    assert.equal(style?.['--v-hover-opacity'], '0')
    assert.equal(style?.transform, 'scale(1.05)')
    assert.match(style?.transition ?? '', /background-color/)
    assert.equal(hoverButtonStyle(resolveButtonHover(undefined, undefined), true), undefined)
  })
})
