/**
 * One judged scenario per case, run by lib-agents-sim's runSimulation: the test fails
 * only when the run itself is invalid. Whether the product served the person is the
 * judge's call, from the transcript.
 */
import { test } from '@playwright/test'
import { runSimulation, selectCases, simCaseNames } from '@data-fair/lib-agents-sim'
import { cases } from './cases/index.ts'
import { seedAll } from './runner/fixtures.ts'
import { ROOT, seedSettings } from './runner/settings.ts'
import { createSurface } from './runner/surfaces.ts'

for (const simCase of selectCases(cases, simCaseNames())) {
  test(`simulation: ${simCase.name}`, async ({ page }) => {
    const surface = createSurface(simCase, page)
    await runSimulation(page, simCase, {
      agentsUrl: `${ROOT}/agents`,
      locale: 'fr',
      setup: async ({ assistantModel, toolsModel }) => {
        const ids = await seedAll()
        await seedSettings(assistantModel, toolsModel)
        // Same cookie as the e2e fixtures, on the parent domain so it reaches both the
        // back-office host and the portal subdomain: the portal's own language choice.
        await page.context().addCookies([{ name: 'i18n_lang', value: 'fr', domain: `.${process.env.DEV_HOST}`, path: '/' }])
        await surface.goto(ids)
      },
      perceptionRoots: surface.perceptionRoots
    })
  })
}
