import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// n paragraphs of markdown: the API renders a text block's _html from its content when the
// page is created, so a long page needs long content, not ready-made html
const markdown = (n: number) => Array.from({ length: n }, (_, i) =>
  `Paragraphe ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
).join('\n\n')
const text = (uuid: string, n: number) => ({ uuid, type: 'text', content: markdown(n) })

test.describe('content page table of contents', () => {
  test.beforeEach(clean)

  test('lists anchored titles, links them, and exposes copiable anchors', async ({ page, goToPortal }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    const portal = (await user1.post('/api/portals', {
      config: { title: 'TOC Portal', menu: { children: [] }, agentChat: { active: false } }
    })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Documentation',
        elements: [
          { uuid: 't1', type: 'title', content: 'Introduction', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true } },
          text('x1', 6),
          { uuid: 't2', type: 'title', content: 'Paramètres avancés', titleSize: 'h3', titleTag: 'h3', anchor: { enabled: true, inToc: true } },
          text('x2', 6),
          { uuid: 't3', type: 'title', content: 'Section sans ancre', titleSize: 'h3', titleTag: 'h3' },
          text('x3', 6),
          {
            uuid: 'c1',
            type: 'two-columns',
            disposition: 'equal',
            gutter: 'default',
            children: [{ uuid: 't4', type: 'title', content: 'Titre dans une colonne', titleSize: 'h4', titleTag: 'h4', anchor: { enabled: true, inToc: true } }],
            children2: [text('x4', 2)]
          },
          { uuid: 't5', type: 'title', content: 'Conclusion', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true, label: 'Fin' } },
          text('x5', 6)
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToPortal(portal._id, `/pages/${createdPage.config.genericMetadata.slug}`)

    // the table of contents renders as a navigation landmark (Vuetify navigation-drawer => <nav>)
    const toc = page.getByRole('navigation', { name: 'Sommaire' })
    await expect(toc.getByText('Sommaire')).toBeVisible({ timeout: 15_000 })

    // only anchored titles are listed (including the one nested in two-columns), with the label override
    await expect(toc.getByText('Introduction')).toBeVisible()
    await expect(toc.getByText('Paramètres avancés')).toBeVisible()
    await expect(toc.getByText('Titre dans une colonne')).toBeVisible()
    await expect(toc.getByText('Fin')).toBeVisible()
    await expect(toc.getByText('Section sans ancre')).toHaveCount(0)

    // anchored headings expose a slugified id; the non-anchored one does not
    await expect(page.locator('h3#parametres-avances')).toBeVisible()
    await expect(page.locator('main h3', { hasText: 'Section sans ancre' })).not.toHaveAttribute('id')

    // the copy button carries a native title for accessibility (RGAA)
    await expect(page.locator('#introduction button.page-anchor-btn'))
      .toHaveAttribute('title', 'Copier le lien vers cette section')

    // clicking a TOC entry writes the anchor to the URL (re-click until the page is hydrated)
    await expect.poll(async () => {
      await toc.locator('.v-list-item', { hasText: 'Paramètres avancés' }).click()
      return page.evaluate(() => location.hash)
    }, { timeout: 15_000 }).toBe('#parametres-avances')
  })

  // The header and navigation bar are a single app bar (header + extension), not two
  // stacked app bars: Vuetify only offsets stacked app bars after mount, so two of them
  // overlap during SSR. The table of contents must also stay below the navigation bar
  // when the header hides on scroll, even though Vuetify collapses --v-layout-top to 0.
  test('keeps the table of contents below the navigation bar when the header hides on scroll', async ({ page, goToPortal }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'TOC Portal',
        menu: { children: [] },
        agentChat: { active: false },
        header: { show: true, showTitle: true, logoPrimaryType: 'hidden', keepOnScroll: false },
        navBar: { keepOnScroll: true }
      }
    })).data
    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Documentation',
        elements: [
          { uuid: 't1', type: 'title', content: 'Introduction', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true } },
          text('x1', 30),
          { uuid: 't2', type: 'title', content: 'Conclusion', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true } },
          text('x2', 30)
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await goToPortal(portal._id, `/pages/${createdPage.config.genericMetadata.slug}`)

    const toc = page.getByRole('navigation', { name: 'Sommaire' })
    await expect(toc.getByText('Sommaire')).toBeVisible({ timeout: 15_000 })

    // A single app bar with an extension, never two stacked app bars (which overlap at SSR).
    expect(await page.locator('.v-app-bar').count()).toBe(1)
    await expect(page.locator('.v-app-bar .v-toolbar__extension')).toBeVisible()

    // Once the header has hidden on scroll, the table of contents must stay below the
    // still-visible navigation bar, not slip underneath it.
    await expect.poll(async () => {
      await page.evaluate(() => window.scrollTo(0, 600))
      return page.evaluate(() => {
        const ext = document.querySelector('.v-toolbar__extension')
        const nav = document.querySelector('nav[aria-label="Sommaire"]')
        if (!ext || !nav) return null
        return Math.round(nav.getBoundingClientRect().top - ext.getBoundingClientRect().bottom)
      })
    }, { timeout: 15_000 }).toBeGreaterThanOrEqual(0)
    // the navigation bar itself stays on screen: Vuetify 4 slides a hidden app bar out whole
    await expect.poll(() => page.evaluate(() =>
      Math.round(document.querySelector('.v-toolbar__extension')?.getBoundingClientRect().bottom ?? 0)
    )).toBe(64)

    // Scrolling back up re-reveals the whole header: Vuetify's `hide` behaviour reacts to the
    // scroll direction, so a continuous upward gesture keeps the header shown even while still
    // past the threshold. The table of contents must follow the revealed header down to the full
    // bar height instead of staying pinned high and slipping underneath it.
    await page.mouse.move(720, 450)
    for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 60) // scroll well past the header so it hides
    await expect.poll(async () => {
      await page.mouse.wheel(0, -40) // keep scrolling up so the header stays revealed
      return page.evaluate(() => {
        const bar = document.querySelector('.v-app-bar')
        const nav = document.querySelector('nav[aria-label="Sommaire"]')
        if (!bar || !nav) return null
        if (window.scrollY <= 170) return null // only assert inside the bug window: still past the threshold
        if (Math.round(bar.getBoundingClientRect().bottom) < 190) return null // and with the header actually revealed
        return Math.round(nav.getBoundingClientRect().top)
      })
    }, { timeout: 15_000 }).toBeGreaterThanOrEqual(190)
  })

  // The app bar keeps its full height below its scroll threshold and shows it again while
  // scrolling up; once hidden, it keeps the navigation bar or slides away whole, depending on the
  // portal. A title reached through its anchor must stop just below whatever the bar shows then:
  // never underneath it, and not a whole header lower either.
  const barBehaviours = [
    { name: 'header and navigation bar hide', header: { keepOnScroll: false }, navBar: { keepOnScroll: false } },
    { name: 'navigation bar stays', header: { keepOnScroll: false }, navBar: { keepOnScroll: true } },
    { name: 'header stays', header: { keepOnScroll: true }, navBar: { keepOnScroll: true } }
  ]
  const thermometer = 'M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z'
  for (const behaviour of barBehaviours) {
    test(`stops anchored titles just below the app bar when the ${behaviour.name}`, async ({ page, goToPortal }) => {
      await page.setViewportSize({ width: 1440, height: 900 })

      const portal = (await user1.post('/api/portals', {
        config: {
          title: 'TOC Portal',
          menu: { children: [] },
          agentChat: { active: false },
          header: { show: true, showTitle: true, logoPrimaryType: 'hidden', ...behaviour.header },
          navBar: behaviour.navBar
        }
      })).data
      const createdPage = (await user1.post('/api/pages', {
        type: 'generic',
        config: {
          title: 'Documentation',
          elements: [
            { uuid: 't1', type: 'title', content: 'Introduction', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true } },
            text('x1', 30),
            {
              uuid: 't2',
              type: 'title',
              content: 'Paramètres avancés des sols agricoles et des zones humides du littoral entre 1990 et 2050',
              titleSize: 'h4',
              titleTag: 'h2',
              line: { position: 'left', color: 'primary' },
              icon: { mdi: { name: 'thermometer', svgPath: thermometer, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${thermometer}"/></svg>` }, color: 'primary' },
              anchor: { enabled: true, inToc: true, label: 'Paramètres avancés' }
            },
            text('x2', 30),
            { uuid: 't3', type: 'title', content: 'Conclusion', titleSize: 'h2', titleTag: 'h2', anchor: { enabled: true, inToc: true } },
            text('x3', 30)
          ]
        },
        portals: [portal._id],
        owner: portal.owner
      })).data
      const longId = 'parametres-avances-des-sols-agricoles-et-des-zones-humides-du-littoral-entre-1990-et-2050'

      // gap between the visible part of the app bar and the title, once the scroll and the bar have settled
      const titleGap = (id: string) => page.evaluate(async (id) => {
        const bar = document.querySelector('.v-app-bar')
        const title = document.getElementById(id)
        if (!bar || !title) return null
        let previous = ''
        for (;;) {
          const current = `${window.scrollY} ${bar.getBoundingClientRect().bottom}`
          if (current === previous) break
          previous = current
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        return Math.round(title.getBoundingClientRect().top - Math.max(0, bar.getBoundingClientRect().bottom))
      }, id)
      const gapRange = (gap: number | null) => gap !== null && gap >= 0 && gap <= 48

      // arriving on the first title, which sits right under the header, below the scroll threshold
      await goToPortal(portal._id, `/pages/${createdPage.config.genericMetadata.slug}#introduction`)
      const toc = page.getByRole('navigation', { name: 'Sommaire' })
      await expect(toc.getByText('Sommaire')).toBeVisible({ timeout: 15_000 })
      await expect.poll(async () => gapRange(await titleGap('introduction')), { timeout: 15_000 }).toBe(true)

      // scrolling down to the last title (re-click until the page is hydrated)
      await expect.poll(async () => {
        await toc.locator('.v-list-item', { hasText: 'Conclusion' }).click()
        return gapRange(await titleGap('conclusion'))
      }, { timeout: 15_000 }).toBe(true)

      // scrolling back up to a title: the header comes back
      await toc.locator('.v-list-item', { hasText: 'Paramètres avancés' }).click()
      await expect.poll(async () => gapRange(await titleGap(longId)), { timeout: 15_000 }).toBe(true)

      // the long title wraps beside its icon, with the copy button on the same row, not on a line of its own
      const layout = await page.evaluate((id) => {
        const title = document.getElementById(id)!.getBoundingClientRect()
        const link = document.querySelector(`#${id} .v-icon`)!.parentElement!.getBoundingClientRect()
        const button = document.querySelector(`#${id} .page-anchor-btn`)!.getBoundingClientRect()
        return { titleHeight: title.height, linkHeight: link.height, buttonRight: button.left >= link.right - 1, buttonInside: button.top >= title.top && button.bottom <= title.bottom }
      }, longId)
      expect(layout.linkHeight).toBeGreaterThan(60) // two lines
      expect(layout.titleHeight).toBeLessThanOrEqual(layout.linkHeight + 1)
      expect(layout.buttonRight).toBe(true)
      expect(layout.buttonInside).toBe(true)
    })
  }
})
