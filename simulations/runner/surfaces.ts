/**
 * Where a case happens and what the person can see there. The turn loop is the same on
 * both surfaces (lib-agents-sim's runSimulation); only reaching the page and what the
 * person can see differ.
 *
 * backoffice — the data-fair back-office shell (data-fair image) embeds the manager
 *   UI (this repo's dev server) in a d-frame; the chat drawer belongs to the shell
 *   and the tools are registered by the manager UI inside the frame. That is the
 *   production topology, iframe changes included.
 * portal — the public Nuxt portal renders its own chat drawer, for a visitor signed in with no
 *   organization (an anonymous visitor's conversation is never reviewable, so not exportable).
 */
import { request, type Page } from '@playwright/test'
import type { PerceptionRoot, SimulationCase, ParsedExport } from '@data-fair/lib-agents-sim'
import type { SeedIds } from './fixtures.ts'
import { OWNER, OWNER_ADMIN_EMAIL, ROOT } from './settings.ts'

/**
 * `host`, not `surface`: lib-agents-sim (0.12) names `surface` what a case is dispatched as
 * (in-page chat, autonomous agent, unattended); every case here is an in-page chat.
 */
export type SimCase = SimulationCase & {
  host: 'backoffice' | 'portal',
  /** What must have happened for the run to have tested its case (as the autonomous-agent cases): an invalid run is never judged. */
  premise?: { description: string, holds: (exports: ParsedExport[]) => boolean }
}

export type Surface = {
  goto: (ids: SeedIds) => Promise<void>
  perceptionRoots: PerceptionRoot[]
}

export function resolveRoute (route: string, ids: SeedIds) {
  return route.replaceAll('{portalId}', ids.portalId).replaceAll('{pageId}', ids.pageId)
}

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

/**
 * The portal cases' visitor: signed in, with no organization. Since agents #80 an anonymous visitor's
 * conversation is never reviewable, so it could not be exported and the run was invalid.
 */
export const PORTAL_VISITOR = { id: 'test_alone', email: 'test_alone@test.com' } as const

/**
 * The visitor signed in on the portal's own domain, through simple-directory's API as the e2e fixtures
 * do (tests/fixtures/login.ts): through the login form, the portal's single-use token callback was
 * opened twice and refused (error=invalidToken). The keepalive is held off so that no page load rotates
 * the exchange token.
 */
async function portalVisitorLogin (page: Page, portal: string) {
  const ctx = await request.newContext()
  try {
    const res = await ctx.post(`${portal}/simple-directory/api/auth/password`, {
      params: { redirect: `${portal}/` },
      data: { email: PORTAL_VISITOR.email, password: 'passwd' }
    })
    if (!res.ok()) throw new Error(`portal visitor login failed: ${res.status()} ${await res.text()}`)
    const callback = await ctx.get(await res.text(), { maxRedirects: 0 })
    if (callback.status() !== 302) throw new Error(`portal visitor login callback failed: ${callback.headers().location}`)
    await page.context().addCookies((await ctx.storageState()).cookies)
  } finally {
    await ctx.dispose()
  }
  await page.context().addInitScript(() => {
    window.localStorage.setItem('sd-keepalive', String(Date.now() + 365 * 86400_000))
  })
}

/** simple-directory keeps the active organization from the login's `org` parameter. */
async function login (page: Page, target: string) {
  await page.goto(`${ROOT}/simple-directory/login?redirect=${encodeURIComponent(target)}&org=${OWNER.id}`)
  await page.getByLabel('Adresse mail').fill(OWNER_ADMIN_EMAIL)
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill('passwd')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(url => url.toString().startsWith(target), { timeout: 30_000 })
}

export function createSurface (simCase: SimCase, page: Page): Surface {
  if (simCase.host === 'backoffice') {
    return {
      goto: ids => login(page, `${ROOT}${resolveRoute(simCase.route, ids)}`),
      // One root that sees through its iframes: the shell, the manager form inside its
      // d-frame, the page editor's preview nested in the manager, and the chat. Separate
      // roots per frame missed the nested preview. The manager forms are long, hence
      // the cap.
      perceptionRoots: [
        { label: 'page', root: page, frames: true, cap: 16000 }
      ]
    }
  }
  return {
    goto: async ids => {
      await portalVisitorLogin(page, portalUrl(ids.portalId))
      await page.goto(portalUrl(ids.portalId) + resolveRoute(simCase.route, ids), { waitUntil: 'domcontentloaded' })
    },
    // The portal embeds data-fair's own views (table, map, …) in an iframe: a root
    // that stopped at it had a person on a table page showing exactly the 8 rows asked
    // for report "un cadre vide". This one sees through it, and through the chat frame.
    perceptionRoots: [
      { label: 'page', root: page, frames: true, cap: 12000 }
    ]
  }
}
