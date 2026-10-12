import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { migrateCardOwnerDisplay } from '../../../upgrade/2.35.0/card-owner-display.ts'

test.describe('card owner display migration', () => {
  test('converts nested cards and leaves page metadata untouched', () => {
    const config = {
      datasets: { card: { showDepartment: false, showSummary: true } },
      applications: { card: { showDepartment: true } },
      datasetPage: { metadata: { showDepartment: true }, card: {} },
      elements: [{ type: 'datasets-catalog', cardConfig: { showDepartment: true } }]
    }
    assert.equal(migrateCardOwnerDisplay(config), true)
    assert.deepEqual(config, {
      datasets: { card: { ownerDisplay: 'none', showSummary: true } },
      applications: { card: { ownerDisplay: 'avatar' } },
      datasetPage: { metadata: { showDepartment: true }, card: {} },
      elements: [{ type: 'datasets-catalog', cardConfig: { ownerDisplay: 'avatar' } }]
    })
    assert.equal(migrateCardOwnerDisplay(config), false)
  })
})
