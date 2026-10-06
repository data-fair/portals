import { test, expect } from '@playwright/test'
import { agentGuide } from '../../../api/types/portal-config/agent-guide.js'

test.describe('the portal configuration guide of the form tools', () => {
  test('says when the main colour shows in the header', () => {
    // a judged run set « Couleur principale » and the header stayed grey: the header takes
    // its own colour, else the navigation bar's, and both were set to something else
    for (const lang of ['en', 'fr'] as const) {
      expect(agentGuide[lang], lang).toContain('header.color')
      expect(agentGuide[lang], lang).toContain('navBar.color')
    }
  })
})
