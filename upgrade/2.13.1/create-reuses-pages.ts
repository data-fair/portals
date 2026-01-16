import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Page, PageConfig } from '../../api/types/page/index.ts'
import type { Portal } from '../../api/types/portal/index.ts'
import { randomUUID } from 'node:crypto'

export default {
  description: 'Create reuses pages from portal configs',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    const pages = db.collection<Page>('pages')

    for await (const portal of portals.find({})) {
      debug(`Processing portal ${portal._id} - ${portal.title}`)

      // Check if a reuses page already exists for this portal
      const existingPage = await pages.findOne({
        type: 'reuses',
        portals: portal._id
      })

      if (existingPage) {
        debug(`reuses page already exists for portal ${portal._id}, skipping`)
        continue
      }

      const now = new Date().toISOString()

      // Create page config from portal config or draftConfig
      const createPageConfig = (portalConfig: any): PageConfig | null => {
        if (!portalConfig) return null

        // Get reuses list configuration (fallback to empty object if not present)
        const reusesList = portalConfig.reuses?.list || {}

        // Construct default sort with direction
        const defaultOrderBySort = { title: '1', createdAt: '-1', updatedAt: '-1' } as const
        let defaultSort = reusesList.defaultSort || 'createdAt'
        if (!(defaultSort in defaultOrderBySort)) defaultSort = 'createdAt'
        if (!defaultSort.includes(':')) {
          const key = defaultSort as keyof typeof defaultOrderBySort
          defaultSort = `${defaultSort}:${defaultOrderBySort[key]}`
        }

        return {
          title: 'Catalogue de réutilisations',
          description: 'Découvrez comment nos données sont exploitées par nos utilisateurs : parcourez les réutilisations, applications et projets innovants de la communauté.',
          elements: [
            {
              type: 'reuses-catalog',
              mb: 4,
              defaultSort,
              columns: reusesList.columns || 2,
              reusesCountPosition: 'top',
              showSortBesideCount: false,
              filters: {
                position: reusesList.filtersLocation || 'top',
                items: ['search', 'sort']
              },
              pagination: { position: 'none' }
            }
          ]
        }
      }

      const config = createPageConfig(portal.config)
      const draftConfig = createPageConfig(portal.draftConfig)

      if (!config || !draftConfig) {
        debug(`Could not create page config for portal ${portal._id}, because both config and draftConfig are missing or invalid. Skipping.`)
        continue
      }

      // Build page document
      const page: Page = {
        _id: randomUUID(),
        title: `Catalogue de visualisations - ${portal.title}`,
        type: 'reuses',
        owner: portal.owner,
        createdAt: now,
        updatedAt: now,
        config,
        draftConfig,
        portals: [portal._id],
        requestedPortals: [],
        configUpdatedAt: now
      }

      // Insert the page
      await pages.insertOne(page)
      debug(`Created reuses page ${page._id} for portal ${portal._id}`)

      // Clean up old reuses.list configuration that has been migrated to the new page
      // @ts-expect-error reuses.list existed in previous version but has been removed
      delete portal.config?.reuses?.list
      // @ts-expect-error reuses.list existed in previous version but has been removed
      delete portal.draftConfig?.reuses?.list
    }
  }
} as UpgradeScript
