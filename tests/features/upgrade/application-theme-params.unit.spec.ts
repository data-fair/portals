import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { migrateApplicationThemeParams } from '../../../upgrade/2.37.1/application-theme-params.ts'

test.describe('application theme params migration', () => {
  test('moves colors to _t_ filters and drops _s_ filters in nested blocks', () => {
    const config = {
      elements: [
        { type: 'application', application: { id: 'a' }, colors: { primary: '#FF0000', secondary: '#00ff00' } },
        {
          type: 'tabs',
          tabs: [{
            children: [{
              type: 'card',
              children: [{
                type: 'application',
                staticFilters: [{ key: '_c_commune_eq', value: '1' }, { key: '_s_commune', value: '1' }, { key: '_t_primary', value: '#111111' }],
                colors: { primary: '#222222', secondary: 'red' }
              }]
            }]
          }]
        },
        { type: 'application', colors: {} },
        { type: 'text', staticFilters: [{ key: '_s_x', value: '1' }], colors: { primary: '#000000' } }
      ]
    }
    assert.equal(migrateApplicationThemeParams(config), true)
    assert.deepEqual(config, {
      elements: [
        { type: 'application', application: { id: 'a' }, staticFilters: [{ key: '_t_primary', value: '#FF0000' }, { key: '_t_secondary', value: '#00ff00' }] },
        {
          type: 'tabs',
          tabs: [{
            children: [{
              type: 'card',
              children: [{
                type: 'application',
                staticFilters: [{ key: '_c_commune_eq', value: '1' }, { key: '_t_primary', value: '#111111' }]
              }]
            }]
          }]
        },
        { type: 'application' },
        { type: 'text', staticFilters: [{ key: '_s_x', value: '1' }], colors: { primary: '#000000' } }
      ]
    })
    assert.equal(migrateApplicationThemeParams(config), false)
    assert.equal(migrateApplicationThemeParams(undefined), false)
  })
})
