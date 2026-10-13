import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { showApplicationsUpdatedAt } from '../../../upgrade/2.36.0/application-card-updated-at.ts'

test.describe('application card updated at migration', () => {
  test('turns the date on for application cards only', () => {
    const portalConfig = {
      applications: { card: { showSummary: true } },
      datasets: { card: {} },
      datasetPage: { applications: { card: {} }, relatedDatasets: { card: {} } }
    }
    assert.equal(showApplicationsUpdatedAt(portalConfig), true)
    assert.deepEqual(portalConfig, {
      applications: { card: { showSummary: true, showUpdatedAt: true } },
      datasets: { card: {} },
      datasetPage: { applications: { card: { showUpdatedAt: true } }, relatedDatasets: { card: {} } }
    })

    const pageConfig = {
      elements: [
        { type: 'datasets-catalog', cardConfig: {} },
        { type: 'two-columns', children: [{ type: 'applications-list', cardConfig: { showUpdatedAt: false } }] },
        { type: 'applications-catalog', cardConfig: {} }
      ]
    }
    assert.equal(showApplicationsUpdatedAt(pageConfig), true)
    assert.deepEqual(pageConfig.elements[0].cardConfig, {})
    assert.deepEqual(pageConfig.elements[1].children![0].cardConfig, { showUpdatedAt: false })
    assert.deepEqual(pageConfig.elements[2].cardConfig, { showUpdatedAt: true })
    assert.equal(showApplicationsUpdatedAt(pageConfig), false)
  })
})
