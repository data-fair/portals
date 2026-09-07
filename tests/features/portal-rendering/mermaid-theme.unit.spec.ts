import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { mermaidThemeVariables } from '../../../portal/app/utils/mermaid.ts'

const colors = {
  background: '#FAFAFA',
  'on-background': '#424242',
  surface: '#FFFFFF',
  'on-surface': '#424242',
  primary: '#1E88E5',
  'on-primary': '#FFFFFF'
}

test.describe('mermaid theme variables', () => {
  test('maps the portal colors mermaid derives its palette from', () => {
    assert.deepEqual(mermaidThemeVariables(colors, false), {
      darkMode: false,
      background: '#FAFAFA',
      primaryColor: '#1E88E5',
      primaryTextColor: '#FFFFFF',
      lineColor: '#424242',
      textColor: '#424242',
      fontFamily: 'inherit'
    })
  })

  test('forwards darkMode so mermaid derives its shades in the right direction', () => {
    assert.equal(mermaidThemeVariables(colors, true).darkMode, true)
    assert.equal(mermaidThemeVariables(colors, false).darkMode, false)
  })
})
