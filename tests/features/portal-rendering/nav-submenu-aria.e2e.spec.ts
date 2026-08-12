import { test, expect } from '../../fixtures/portal.ts'
import { axiosAuth, clean } from '../../support/axios.ts'
import type { Locator, Page } from '@playwright/test'

const user1 = await axiosAuth('test_admin@test.com')

/**
 * Header submenu accessibility (RGAA 7.1 and 9.3).
 *
 * The submenu is a disclosure widget, not an ARIA menu:
 * - the trigger exposes aria-expanded + aria-controls, never aria-haspopup or
 *   aria-owns (the latter would pull the popup into the trigger's name);
 * - `eager` mounts the popup so aria-controls resolves while closed;
 * - the popup is a real <ul>/<li> list of links, and keyboard flow works
 *   (focus enters on open, Escape closes and returns focus to the trigger).
 */
const portalWithSubmenu = async () => {
  const portal = (await user1.post('/api/portals', {
    config: {
      title: 'Nav Submenu Portal',
      menu: {
        children: [
          {
            type: 'submenu',
            title: 'Territoire',
            children: [
              { type: 'standard', subtype: 'datasets' },
              { type: 'standard', subtype: 'contact' }
            ]
          },
          // a plain link alongside the submenu: this one renders as <a>
          { type: 'standard', subtype: 'reuses' }
        ]
      }
    }
  })).data
  await user1.post('/api/pages', {
    type: 'home',
    config: { title: 'Home', elements: [] },
    portals: [portal._id],
    owner: portal.owner
  })
  return portal
}

const openSubmenu = async (trigger: Locator) => {
  // a click landing before hydration does nothing: retry until the menu opens
  await expect.poll(async () => {
    if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click()
    return trigger.getAttribute('aria-expanded')
  }, { timeout: 15_000 }).toBe('true')
}

const isFocusInDrawer = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('#nav-drawer'))

test.describe('header submenu accessibility', () => {
  test.beforeEach(clean)

  test('the submenu trigger is a disclosure, not a menu', async ({ page, goToPortal }) => {
    const portal = await portalWithSubmenu()
    await goToPortal(portal._id)

    const trigger = page.locator('.nav-tabs .v-tab', { hasText: 'Territoire' })
    await expect(trigger).toBeVisible({ timeout: 10_000 })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-controls', /nav-submenu-/)
    // disclosure pattern: no menu/owns semantics
    await expect(trigger).not.toHaveAttribute('aria-haspopup', /.*/)
    await expect(trigger).not.toHaveAttribute('aria-owns', /.*/)
  })

  test('the header tabs are valid HTML (RGAA 8.2)', async ({ page, goToPortal }) => {
    const portal = await portalWithSubmenu()
    await goToPortal(portal._id)

    const tabs = page.locator('.nav-tabs .v-tab')
    await expect(tabs).toHaveCount(2)
    // VBtn wraps the slot in a <span>, so the patched slider must be phrasing content
    expect(await page.locator('.nav-tabs .v-tab__slider').first().evaluate((el) => el.tagName)).toBe('SPAN')
    // `value` mirrors the tabs' v-model but is not a valid attribute on <a>
    expect(await page.locator('.nav-tabs a.v-tab').first().evaluate((el) => el.hasAttribute('value'))).toBe(false)
  })

  test('the closed trigger only references ids that exist', async ({ page, goToPortal }) => {
    const portal = await portalWithSubmenu()
    await goToPortal(portal._id)

    const trigger = page.locator('.nav-tabs .v-tab', { hasText: 'Territoire' })
    await expect(trigger).toBeVisible({ timeout: 10_000 })
    // `eager` mounts the popup client-side, so poll until hydration has run
    await expect.poll(() => trigger.evaluate((el) => {
      const id = el.getAttribute('aria-controls') ?? ''
      return id && !document.getElementById(id) ? id : ''
    }), { timeout: 30_000 }).toBe('')
  })

  test('the open submenu is a real list of links', async ({ page, goToPortal }) => {
    const portal = await portalWithSubmenu()
    await goToPortal(portal._id)

    const trigger = page.locator('.nav-tabs .v-tab', { hasText: 'Territoire' })
    await expect(trigger).toBeVisible({ timeout: 10_000 })
    await openSubmenu(trigger)

    const list = page.locator(`#${await trigger.getAttribute('aria-controls')}`)
    await expect(list).toBeVisible()
    const shape = await list.evaluate((el) => ({
      tag: el.tagName,
      onlyLiChildren: [...el.children].every((c) => c.tagName === 'LI'),
      links: el.querySelectorAll('li > a').length
    }))
    expect(shape.tag).toBe('UL')
    expect(shape.onlyLiChildren).toBe(true)
    expect(shape.links).toBe(2)
  })

  test('keyboard: focus enters the submenu, Escape returns it to the trigger', async ({ page, goToPortal }) => {
    const portal = await portalWithSubmenu()
    await goToPortal(portal._id)

    const trigger = page.locator('.nav-tabs .v-tab', { hasText: 'Territoire' })
    await expect(trigger).toBeVisible({ timeout: 10_000 })
    await openSubmenu(trigger)

    const listId = await trigger.getAttribute('aria-controls')
    // focus must actually land on the first item, not merely be requested
    await expect.poll(
      () => page.evaluate((id) => document.activeElement?.closest(`#${id} .v-list-item`) !== null, listId),
      { timeout: 5_000 }
    ).toBe(true)

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })
})

/**
 * Mobile drawer accessibility (RGAA 9.3, 10.7): the drawer links form a real
 * <ul>/<li> list, group boundaries carry a single divider (never doubled), and
 * keyboard users can leave — Escape closes and gives the focus back to the burger,
 * tabbing out closes too rather than parking the focus behind the scrim.
 */
test.describe('mobile drawer accessibility', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test.beforeEach(clean)

  const portalWithGroups = async () => {
    const portal = (await user1.post('/api/portals', {
      config: {
        title: 'Nav Drawer Portal',
        menu: {
          children: [
            { type: 'submenu', title: 'Territoire', children: [{ type: 'standard', subtype: 'datasets' }] },
            { type: 'submenu', title: 'Thèmes', children: [{ type: 'standard', subtype: 'contact' }] }
          ]
        }
      }
    })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: { title: 'Home', elements: [] },
      portals: [portal._id],
      owner: portal.owner
    })
    return portal
  }

  const openDrawer = async (burger: Locator) => {
    await expect(burger).toBeVisible({ timeout: 10_000 })
    // a click landing before hydration does nothing: retry until the drawer opens
    await expect.poll(async () => {
      if (await burger.getAttribute('aria-expanded') !== 'true') await burger.click()
      return burger.getAttribute('aria-expanded')
    }, { timeout: 15_000 }).toBe('true')
  }

  test('the drawer is a real list with a single divider between groups', async ({ page, goToPortal }) => {
    const portal = await portalWithGroups()
    await goToPortal(portal._id)

    await openDrawer(page.locator('[aria-controls="nav-drawer"]'))

    const list = page.locator('#nav-drawer .v-list')
    await expect(list).toBeVisible()
    const shape = await list.evaluate((el) => {
      const kids = [...el.children]
      const isDivider = (li: Element) => !!li.querySelector('.v-divider')
      let doubled = false
      for (let i = 1; i < kids.length; i++) if (isDivider(kids[i]) && isDivider(kids[i - 1])) doubled = true
      return {
        tag: el.tagName,
        onlyLiChildren: kids.every((c) => c.tagName === 'LI'),
        links: el.querySelectorAll('li > a').length,
        dividers: kids.filter(isDivider).length,
        dividerRoles: kids.filter(isDivider).map((li) => li.querySelector('.v-divider')!.getAttribute('role')),
        doubled,
        listTabindex: el.getAttribute('tabindex'),
        itemTabindexes: [...el.querySelectorAll('.v-list-item')].map((i) => i.getAttribute('tabindex'))
      }
    })
    expect(shape.tag).toBe('UL')
    expect(shape.onlyLiChildren).toBe(true)
    expect(shape.links).toBe(2)
    // one boundary between the two groups → exactly one divider, never doubled
    expect(shape.dividers).toBe(1)
    expect(shape.doubled).toBe(false)
    // hr already implies separator: the patched VDivider must not repeat it
    expect(shape.dividerRoles).toEqual([null])
    // the wrapper is skipped, the links carry the tab order
    expect(shape.listTabindex).toBe('-1')
    expect(shape.itemTabindexes).toEqual(['0', '0'])
  })

  test('Tab walks the drawer links instead of leaving after the first', async ({ page, goToPortal }) => {
    const portal = await portalWithGroups()
    await goToPortal(portal._id)

    await openDrawer(page.locator('[aria-controls="nav-drawer"]'))

    const links = page.locator('#nav-drawer .v-list li > a')
    await expect(links).toHaveCount(2)
    await links.first().focus()
    await page.keyboard.press('Tab')
    await expect(links.nth(1)).toBeFocused()
  })

  test('Escape closes the drawer and returns focus to the burger', async ({ page, goToPortal }) => {
    const portal = await portalWithGroups()
    await goToPortal(portal._id)

    const burger = page.locator('[aria-controls="nav-drawer"]')
    await openDrawer(burger)
    // Escape is only meaningful once the focus has actually landed inside
    await expect.poll(() => isFocusInDrawer(page), { timeout: 5_000 }).toBe(true)

    await page.keyboard.press('Escape')
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await expect(burger).toBeFocused()
  })

  test('tabbing past the last link closes the drawer instead of hiding the focus', async ({ page, goToPortal }) => {
    const portal = await portalWithGroups()
    await goToPortal(portal._id)

    const burger = page.locator('[aria-controls="nav-drawer"]')
    await openDrawer(burger)

    const links = page.locator('#nav-drawer .v-list li > a')
    await expect(links).toHaveCount(2)
    await links.last().focus()
    await page.keyboard.press('Tab')

    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    expect(await isFocusInDrawer(page)).toBe(false)
  })
})

/**
 * Menu page element accessibility (RGAA 12.8): its popup is a list of links, so
 * each link must be its own tab stop. Left to itself VList keeps items at
 * tabindex="-2", and Tab leaves the menu right after the first one.
 */
test.describe('menu page element accessibility', () => {
  test.beforeEach(clean)

  const portalWithMenuElement = async () => {
    const portal = (await user1.post('/api/portals', { config: { title: 'Menu Element Portal' } })).data
    await user1.post('/api/pages', {
      type: 'home',
      config: {
        title: 'Home',
        elements: [{
          type: 'menu',
          label: 'Territoires',
          links: [
            { type: 'standard', subtype: 'datasets' },
            { type: 'standard', subtype: 'contact' }
          ]
        }]
      },
      portals: [portal._id],
      owner: portal.owner
    })
    return portal
  }

  test('every link of the popup is a tab stop', async ({ page, goToPortal }) => {
    const portal = await portalWithMenuElement()
    await goToPortal(portal._id)

    const trigger = page.getByRole('button', { name: 'Territoires' })
    await expect(trigger).toBeVisible({ timeout: 10_000 })
    await expect(trigger).not.toHaveAttribute('aria-haspopup', /.*/)
    await openSubmenu(trigger)

    const list = page.locator(`#${await trigger.getAttribute('aria-controls')} .v-list`)
    await expect(list).toBeVisible()
    const shape = await list.evaluate((el) => ({
      tag: el.tagName,
      onlyLiChildren: [...el.children].every((c) => c.tagName === 'LI'),
      listTabindex: el.getAttribute('tabindex'),
      itemTabindexes: [...el.querySelectorAll('.v-list-item')].map((i) => i.getAttribute('tabindex'))
    }))
    expect(shape.tag).toBe('UL')
    expect(shape.onlyLiChildren).toBe(true)
    // the wrapper is skipped, the links carry the tab order
    expect(shape.listTabindex).toBe('-1')
    expect(shape.itemTabindexes).toEqual(['0', '0'])

    const links = list.locator('li > a')
    await links.first().focus()
    await page.keyboard.press('Tab')
    await expect(links.nth(1)).toBeFocused()
  })
})
