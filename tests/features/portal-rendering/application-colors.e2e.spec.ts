// The `_t_*` static filters of an application block reach the frame, mirrored as
// `primary`/`secondary` for legacy apps. Without them, no `_t_*` is sent, so the application
// keeps the hashed, immutable theme stylesheet.
import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

const application = { id: 'no-such-app', slug: 'no-such-app', title: 'Missing app' }

test.describe('application block colors', () => {
  test.beforeEach(clean)

  test('only a block with _t_* static filters sends them', async ({ page, goToPortal }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'App Colors Portal', menu: { children: [] } }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [
          { uuid: 'app1', type: 'application', application },
          { uuid: 'app2', type: 'application', application, staticFilters: [{ key: '_t_primary', value: '#FF0000' }, { key: '_t_secondary', value: '00ff00' }] }
        ]
      },
      portals: [portal._id],
      owner: portal.owner
    })

    await goToPortal(portal._id)
    const frames = page.locator('d-frame')
    await expect(frames).toHaveCount(2, { timeout: 15_000 })
    const srcOf = async (i: number) => new URL(await frames.nth(i).getAttribute('src') ?? '', 'http://localhost').searchParams

    const plain = await srcOf(0)
    expect(plain.get('primary')).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect([...plain.keys()].filter(k => k.startsWith('_t_'))).toEqual([])

    const overridden = await srcOf(1)
    expect(overridden.get('primary')).toBe('#FF0000')
    expect(overridden.get('secondary')).toBe('#00ff00')
    expect(overridden.get('_t_primary')).toBe('#FF0000')
    expect(overridden.get('_t_secondary')).toBe('00ff00')
  })
})
