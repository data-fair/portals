import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { ApplicationsCatalogElement, Page, PageConfig } from '../../api/types/page/index.ts'
import type { Portal } from '../../api/types/portal/index.ts'
import { randomUUID } from 'node:crypto'

export default {
  description: 'Create applications pages from portal configs',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    const pages = db.collection<Page>('pages')

    for await (const portal of portals.find({})) {
      debug(`Processing portal ${portal._id} - ${portal.title}`)

      // Check if a applications page already exists for this portal
      const existingPage = await pages.findOne({
        type: 'applications',
        portals: portal._id
      })

      if (existingPage) {
        debug(`Applications page already exists for portal ${portal._id}, skipping`)
        continue
      }

      const now = new Date().toISOString()

      // Create page config from portal config or draftConfig
      const createPageConfig = (portalConfig: any): PageConfig | null => {
        if (!portalConfig) return null

        // Get applications list configuration (fallback to empty object if not present)
        const applicationsList = portalConfig.applications?.list || {}

        // Build filter items array
        const filterItems: NonNullable<ApplicationsCatalogElement['filters']>['items'] = ['search']
        if (applicationsList.filtersList && applicationsList.filtersList.includes('base-application')) filterItems.push('base-application')
        filterItems.push('sort')

        // Construct default sort with direction
        const defaultOrderBySort = { title: '1', createdAt: '-1', updatedAt: '-1' } as const
        let defaultSort = applicationsList.defaultSort || 'createdAt'
        if (!(defaultSort in defaultOrderBySort)) defaultSort = 'createdAt'
        if (!defaultSort.includes(':')) {
          const key = defaultSort as keyof typeof defaultOrderBySort
          defaultSort = `${defaultSort}:${defaultOrderBySort[key]}`
        }

        const advancedFilters = []
        if (applicationsList.filtersList && applicationsList.filtersList.includes('topics')) {
          advancedFilters.push({
            type: 'topics',
            centered: false,
            mb: 0,
            ...applicationsList.topicsFilters
          })
        }

        return {
          title: 'Catalogue de visualisations',
          description: 'Explorez nos visualisations : cartes interactives, graphiques et tableaux pour analyser et comprendre les données.',
          elements: [
            {
              type: 'applications-catalog',
              mb: 4,
              defaultSort,
              columns: applicationsList.columns || 2,
              applicationsCountPosition: 'top',
              showSortBesideCount: false,
              showAdvancedFilters: applicationsList.filtersList && applicationsList.filtersList.includes('topics'),
              filters: {
                position: applicationsList.filtersLocation || 'top',
                items: filterItems
              },
              advancedFilters,
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
        type: 'applications',
        owner: portal.owner,
        // @ts-ignore renamed by createdAt in later versions
        created: {
          id: portal.owner.id,
          name: portal.owner.name + ' (Administration)',
          date: now
        },
        // @ts-ignore renamed by createdAt in later versions
        updated: {
          id: portal.owner.id,
          name: portal.owner.name + ' (Administration)',
          date: now
        },
        config,
        draftConfig,
        portals: [portal._id],
        requestedPortals: [],
        configUpdatedAt: now
      }

      // Insert the page
      await pages.insertOne(page)
      debug(`Created applications page ${page._id} for portal ${portal._id}`)

      // Clean up old applications.list configuration that has been migrated to the new page
      // @ts-expect-error applications.list existed in previous version but has been removed
      delete portal.config?.applications?.list
      // @ts-expect-error applications.list existed in previous version but has been removed
      delete portal.draftConfig?.applications?.list
    }
  }
} as UpgradeScript
