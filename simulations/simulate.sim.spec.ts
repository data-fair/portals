/**
 * One judged scenario per case, run by lib-agents-sim's runSimulation: the test fails
 * only when the run itself is invalid. Whether the product served the person is the
 * judge's call, from the transcript.
 */
import { test } from '@playwright/test'
import { runSimulation, parseConversationExport, REVIEW_CONSENT_COOKIE, REVIEW_CONSENT_YES } from '@data-fair/lib-agents-sim'
import { cases } from './cases/index.ts'
import { selectOwnCases } from './cases/select.ts'
import { seedAll } from './runner/fixtures.ts'
import { ROOT, OWNER_ADMIN_ID, seedSettings, eraseConversations, fetchConversationExports } from './runner/settings.ts'
import { createSurface, PORTAL_VISITOR } from './runner/surfaces.ts'

for (const simCase of selectOwnCases(cases)) {
  test(`simulation: ${simCase.name}`, async ({ page }) => {
    const surface = createSurface(simCase, page)
    await runSimulation(page, simCase, {
      agentsUrl: `${ROOT}/agents`,
      locale: 'fr',
      setup: async ({ assistantModel, toolsModel }) => {
        const ids = await seedAll()
        await seedSettings(assistantModel, toolsModel)
        await eraseConversations(simCase.host === 'portal' ? PORTAL_VISITOR.id : OWNER_ADMIN_ID)
        // Same cookie as the e2e fixtures, on the parent domain so it reaches both the
        // back-office host and the portal subdomain: the portal's own language choice.
        // The review consent too: the portal's chat loads /agents from the portal's subdomain, where
        // runSimulation's consent cookie (set on agentsUrl's origin) is not sent
        await page.context().addCookies([
          { name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' },
          { name: REVIEW_CONSENT_COOKIE, value: REVIEW_CONSENT_YES, domain: `.${process.env.DEV_HOST}`, path: '/' }
        ])
        await surface.goto(ids)
      },
      perceptionRoots: surface.perceptionRoots,
      fetchExports: fetchConversationExports,
      // a run that never reached the situation its case is about tested nothing: invalid, not judged
      afterRun: async ({ exports, error }) => {
        if (error || !simCase.premise) return {}
        return simCase.premise.holds(exports.map(parseConversationExport)) ? {} : { error: `premise not met: ${simCase.premise.description}` }
      }
    })
  })
}
