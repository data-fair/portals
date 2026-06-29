import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const html = (n: number) => Array.from({ length: n }, (_, i) =>
  `<p>Paragraphe ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`
).join('')
const text = (uuid: string, n: number) => ({ uuid, type: 'text', content: 'lorem', _html: html(n) })

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
})
