import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { showApplicationsUpdatedAt } from '../../../upgrade/2.36.0/application-card-updated-at.ts'

test.describe('application card updated at migration', () => {
  test('turns the date on for the portal application card only', () => {
    const config = {
      applications: { card: { showSummary: true } },
      datasets: { card: {}, page: { applications: { card: {} } } }
    }
    assert.equal(showApplicationsUpdatedAt(config), true)
    assert.deepEqual(config, {
      applications: { card: { showSummary: true, showUpdatedAt: true } },
      datasets: { card: {}, page: { applications: { card: {} } } }
    })
    assert.equal(showApplicationsUpdatedAt(config), false)
  })

  test('creates a missing card and keeps an explicit choice', () => {
    const empty: any = {}
    assert.equal(showApplicationsUpdatedAt(empty), true)
    assert.deepEqual(empty, { applications: { card: { showUpdatedAt: true } } })

    const off = { applications: { card: { showUpdatedAt: false } } }
    assert.equal(showApplicationsUpdatedAt(off), false)
    assert.equal(showApplicationsUpdatedAt(undefined), false)
  })
})
