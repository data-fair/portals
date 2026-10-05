import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

// The wizard's cards move it to the next step when clicked, but were plain text to
// assistive technology: a judged simulation's person was told « not a button or a link »
// each time it clicked one.
test.describe('page creation wizard', () => {
  test.beforeEach(clean)

  test('its choice cards are buttons', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await page.getByRole('button', { name: /Page libre/ }).click({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: /Aucun groupe/ })).toBeVisible()
  })

  // Judged runs: an events catalogue went through a « Choisir une source » step whose only
  // card was « Page blanche – Commencer avec une page vide », and both the person and the
  // assistant concluded they had made an empty free page, then chose the wrong menu item.
  test('skips the choice of a source when a blank page is the only one', async ({ page, goToWithAuth }) => {
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await page.getByRole('button', { name: /Catalogue d'événements/ }).click({ timeout: 30_000 })
    await expect(page.getByLabel('Titre')).toBeVisible()
    await expect(page.getByRole('button', { name: /Page blanche/ })).toHaveCount(0)
  })

  test('offers the choice of a source when there is one besides a blank page', async ({ page, goToWithAuth }) => {
    await user1.post('/api/pages', { type: 'event-catalog', config: { title: 'Agenda existant', elements: [] } })
    await goToWithAuth('/portals-manager/pages/new', 'test_admin')
    await page.getByRole('button', { name: /Catalogue d'événements/ }).click({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: /Page blanche/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Dupliquer/ })).toBeVisible()
  })
})
