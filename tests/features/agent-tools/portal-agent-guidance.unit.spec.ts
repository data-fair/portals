import { test, expect } from '@playwright/test'
import { serializeDetail, EVENT_DETAIL_MAX_CHARS } from '@data-fair/lib-vue-agents/host-events.js'
import { portalAgentGuidance } from '../../../portal/app/composables/agent/portal-agent-guidance.ts'

// Agents libs 0.7 ignore a host-supplied system prompt: the portal publishes these texts as
// keyed host state, told to the model on every turn (portal/app/composables/agent/use-portal-agent-host.ts).
test.describe('portal agent guidance', () => {
  const guidance = portalAgentGuidance({ title: 'Portail test' }, 'Owner', 'https://portal.test')
  const all = Object.values(guidance).join('\n')

  test('every key is delivered whole: under the host event detail cap', () => {
    for (const [key, text] of Object.entries(guidance)) {
      expect(text.length, key).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
      expect(serializeDetail(text), key).toBe(text)
    }
  })

  test('names the portal, its owner and its origin', () => {
    expect(guidance.portal).toContain('« Portail test »')
    expect(guidance.portal).toContain('« Owner »')
    expect(guidance.portal).toContain('https://portal.test')
    expect(portalAgentGuidance({}).portal).toBe('Public Data Fair data portal. The person is a visitor of this portal.')
  })

  test('forbids invented data', () => {
    expect(guidance['portal-data']).toContain('never invent or estimate data')
  })

  test('asks to act on the screen and to read it before describing it', () => {
    expect(guidance['portal-screen']).toContain('navigate')
    expect(guidance['portal-screen']).toContain('get_current_location')
    expect(guidance['portal-screen']).toContain('pageFilters_get')
  })

  test('says how to check what a dataset table on screen shows', () => {
    // a judged run opened a filtered table, then said « je ne vois pas les lignes du tableau »
    // and left the check to the person: the table shows the rows of the page's filters, which
    // the data tools can query
    expect(all).toContain('the table shows exactly those rows')
    expect(all).toContain('query-dataset-data')
  })

  test('asks for absolute markdown links', () => {
    expect(guidance['portal-links']).toContain('absolute URL')
    expect(guidance['portal-links']).toContain('Never write a relative path')
  })
})
