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

const box = (extra: Record<string, any> = {}) => ({
  type: 'card',
  title: 'Une boite',
  actions: [],
  children: [{ type: 'text', content: 'Texte dans la boite' }],
  ...extra
})

const tabs = (extra: Record<string, any> = {}) => ({
  type: 'tabs',
  align: 'start',
  tabs: [{ title: 'Un onglet', children: [{ type: 'text', content: 'Texte dans un onglet' }] }],
  ...extra
})

const panels = (extra: Record<string, any> = {}) => ({
  type: 'expansion-panels',
  openFirst: true,
  panels: [{ title: 'Un panneau', children: [{ type: 'text', content: 'Texte dans un panneau' }] }],
  ...extra
})

// The containers shrink their content to 0.875rem (Vuetify's v-card-text does it on its
// own, the accordion is aligned on it), the option restores the portal size
const fontSizes = (page: any, needle: string) => page.evaluate(
  (needle: string) => [...document.querySelectorAll('p')].filter(p => p.textContent?.includes(needle)).map(p => getComputedStyle(p).fontSize),
  needle
)

test.describe('container text size', () => {
  test.beforeEach(clean)

  test('the text is reduced by default and follows the portal when asked to', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Text Size Portal', menu: { children: [] } }
    })).data
    await createHomePage(portal, [
      box(), box({ keepTextSize: true }),
      tabs(), tabs({ keepTextSize: true }),
      panels(), panels({ keepTextSize: true })
    ])

    await goToPortal(portal._id)
    await expect(page.getByText('Texte dans la boite')).toHaveCount(2)
    await expect(page.getByText('Texte dans un onglet')).toHaveCount(2)
    await expect(page.getByText('Texte dans un panneau')).toHaveCount(2)

    expect(await fontSizes(page, 'Texte dans la boite')).toEqual(['14px', '16px'])
    expect(await fontSizes(page, 'Texte dans un onglet')).toEqual(['14px', '16px'])
    expect(await fontSizes(page, 'Texte dans un panneau')).toEqual(['14px', '16px'])
  })
})
