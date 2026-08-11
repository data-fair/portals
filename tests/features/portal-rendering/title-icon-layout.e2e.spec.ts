import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const createHomePage = async (portal: any, elements: any[]) => {
  const config = { title: 'Home', elements }
  const page = (await user1.post('/api/pages', { type: 'home', config, portals: [portal._id], owner: portal.owner })).data
  await user1.patch(`/api/pages/${page._id}`, { draftConfig: config })
  await user1.post(`/api/pages/${page._id}/draft`)
  return page
}

const svgPath = 'M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H5.2L4 17.2V4H20V16M17 11H15V9H17M13 11H11V9H13M9 11H7V9H9'
const icon = {
  mdi: {
    name: 'message-processing-outline',
    svgPath,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${svgPath}" /></svg>`
  }
}

// long enough to wrap on any viewport, which is the whole point: the bug only shows
// from the second line on
const content = 'Vous utilisez nos données ? Partagez-nous vos réutilisations pour que nous puissions les mettre en avant sur ce portail et en faire profiter les autres réutilisateurs.'

const titleElement = (extra: Record<string, any> = {}) => ({
  type: 'title',
  content,
  titleSize: 'h4',
  titleTag: 'h2',
  line: { position: 'none' },
  icon,
  ...extra
})

/**
 * Reads where the icon sits relative to the title text.
 *
 * Range client rects give one rect per rendered line, so `textLines` exposes the
 * wrapped lines individually — which is what tells an icon laid out beside the text
 * apart from an icon flowing inside it.
 */
const readLayout = (page: any, needle: string) => page.evaluate((needle: string) => {
  const row = [...document.querySelectorAll('h2')].find(el => el.textContent?.includes(needle))
  if (!row) throw new Error('title not found')
  const iconEl = row.querySelector('.v-icon')
  if (!iconEl) throw new Error('icon not found')

  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
  let textNode: Node | null = null
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.includes(needle.slice(0, 20))) { textNode = walker.currentNode; break }
  }
  if (!textNode) throw new Error('text node not found')

  const range = document.createRange()
  range.selectNodeContents(textNode)
  const rowRect = row.getBoundingClientRect()
  const iconRect = iconEl.getBoundingClientRect()

  return {
    row: { top: rowRect.top, bottom: rowRect.bottom, left: rowRect.left },
    icon: { top: iconRect.top, bottom: iconRect.bottom, left: iconRect.left, right: iconRect.right },
    textLines: [...range.getClientRects()].map(r => ({ top: r.top, bottom: r.bottom, left: r.left })),
    iconInsideLink: !!iconEl.closest('a')
  }
}, needle)

test.describe('title icon layout', () => {
  test.beforeEach(clean)

  test('the icon sits beside the title text, not inside its flow', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Title Icon Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [titleElement()])

    await goToPortal(portal._id)
    await expect(page.getByRole('heading', { name: /Vous utilisez nos données/ })).toBeVisible({ timeout: 10_000 })

    const layout = await readLayout(page, content)

    // the assertion is meaningless unless the title really wraps
    expect(layout.textLines.length).toBeGreaterThan(1)

    // every line starts to the right of the icon: the text keeps its own column and
    // no line flows back underneath the icon
    for (const line of layout.textLines) {
      expect(line.left).toBeGreaterThanOrEqual(layout.icon.right - 1)
    }

    // the icon is centred on the whole title, not stuck to the first line
    const iconCentre = (layout.icon.top + layout.icon.bottom) / 2
    const rowCentre = (layout.row.top + layout.row.bottom) / 2
    expect(Math.abs(iconCentre - rowCentre)).toBeLessThanOrEqual(2)
  })

  test('a linked title keeps the icon inside the link, and beside the text', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Title Icon Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [titleElement({
      link: { type: 'external', href: 'https://example.com', title: 'Exemple' }
    })])

    await goToPortal(portal._id)
    await expect(page.getByRole('heading', { name: /Vous utilisez nos données/ })).toBeVisible({ timeout: 10_000 })

    const layout = await readLayout(page, content)

    // the icon is part of the click target, which is why it was moved into the link
    expect(layout.iconInsideLink).toBe(true)

    expect(layout.textLines.length).toBeGreaterThan(1)
    for (const line of layout.textLines) {
      expect(line.left).toBeGreaterThanOrEqual(layout.icon.right - 1)
    }
    const iconCentre = (layout.icon.top + layout.icon.bottom) / 2
    const rowCentre = (layout.row.top + layout.row.bottom) / 2
    expect(Math.abs(iconCentre - rowCentre)).toBeLessThanOrEqual(2)
  })
})
