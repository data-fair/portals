/**
 * Where a case happens and how its chat is reached. The turn loop is the same on
 * both surfaces; only reaching the page, finding the chat and what the person can
 * see differ.
 *
 * backoffice — the data-fair back-office shell (data-fair image) embeds the manager
 *   UI (this repo's dev server) in a d-frame; the chat drawer belongs to the shell
 *   and the tools are registered by the manager UI inside the frame. That is the
 *   production topology, iframe changes included.
 * portal — the public Nuxt portal renders its own chat drawer, for an anonymous visitor.
 */
import type { FrameLocator, Locator, Page } from '@playwright/test'
import type { SimulationCase } from '@data-fair/lib-agents-sim'
import type { SeedIds } from './fixtures.ts'
import { OWNER, OWNER_ADMIN_EMAIL } from './settings.ts'

export type SimCase = SimulationCase & { surface: 'backoffice' | 'portal' }

export type Surface = {
  goto: () => Promise<void>
  chatFrame: FrameLocator
  ensureChatOpen: (composer: Locator) => Promise<void>
  perceptionRoots: Array<{ label: string, root: Page | FrameLocator, cap?: number }>
}

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
/** The agents chat frame, whose src is /agents/<type>/<id>/chat?… — not a bare 'iframe': both surfaces embed other frames. */
const CHAT_FRAME = 'iframe[src*="/agents/"][src*="/chat"]'

/** The d-frame in which the data-fair shell embeds the portals manager UI. */
const MANAGER_FRAME = 'iframe[src*="/portals-manager/"]'

export function resolveRoute (route: string, ids: SeedIds) {
  return route.replaceAll('{portalId}', ids.portalId).replaceAll('{pageId}', ids.pageId)
}

export function portalUrl (portalId: string) {
  return `http://${portalId}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
}

/** simple-directory keeps the active organization from the login's `org` parameter. */
async function login (page: Page, target: string) {
  await page.goto(`${ROOT}/simple-directory/login?redirect=${encodeURIComponent(target)}&org=${OWNER.id}`)
  await page.getByLabel('Adresse mail').fill(OWNER_ADMIN_EMAIL)
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill('passwd')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(url => url.toString().startsWith(target), { timeout: 30_000 })
}

export function createSurface (simCase: SimCase, page: Page, ids: SeedIds): Surface {
  const chatFrame = page.frameLocator(CHAT_FRAME)
  /**
   * The drawer does not survive a full navigation, and the persona may close it.
   * Reopening before every send keeps the run alive so the friction reaches the
   * transcript instead of killing it. Probe first: clicking unconditionally would
   * close a drawer that is already open.
   */
  const ensureChatOpen = async (composer: Locator) => {
    const open = await composer.waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false)
    if (open) return
    await page.locator('.df-agent-chat-toggle').first().click()
    await composer.waitFor({ state: 'visible', timeout: 30_000 })
  }
  const route = resolveRoute(simCase.route, ids)

  if (simCase.surface === 'backoffice') {
    return {
      goto: () => login(page, `${ROOT}${route}`),
      chatFrame,
      ensureChatOpen,
      // Three roots, not two: an aria snapshot and a role locator stop at an iframe
      // boundary, so the shell page alone would show the person the navigation and
      // the chat toggle but not the manager form they are working on. The manager
      // forms are long, hence the larger cap.
      perceptionRoots: [
        { label: 'page', root: page },
        { label: 'manager', root: page.frameLocator(MANAGER_FRAME), cap: 8000 },
        { label: 'chat panel', root: chatFrame }
      ]
    }
  }
  return {
    goto: async () => { await page.goto(portalUrl(ids.portalId) + route, { waitUntil: 'domcontentloaded' }) },
    chatFrame,
    ensureChatOpen,
    perceptionRoots: [{ label: 'page', root: page, cap: 6000 }, { label: 'chat panel', root: chatFrame }]
  }
}
