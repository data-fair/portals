import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { DatasetsCatalogElement, Page, PageConfig } from '../../api/types/page/index.ts'
import type { Portal } from '../../api/types/portal/index.ts'
import { randomUUID } from 'node:crypto'

export default {
  description: 'Create datasets pages from portal configs',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    const pages = db.collection<Page>('pages')

    for await (const portal of portals.find({})) {
      debug(`Processing portal ${portal._id} - ${portal.title}`)

      // Check if a datasets page already exists for this portal
      const existingPage = await pages.findOne({
        type: 'datasets',
        portals: portal._id
      })

      if (existingPage) {
        debug(`Datasets page already exists for portal ${portal._id}, skipping`)
        continue
      }

      const now = new Date().toISOString()

      // Create page config from portal config or draftConfig
      const createPageConfig = (portalConfig: any): PageConfig | null => {
        if (!portalConfig) return null

        // Get datasets list configuration (fallback to empty object if not present)
        const datasetsList = portalConfig.datasets?.list || {}

        // Build filter items array
        const filterItems: NonNullable<DatasetsCatalogElement['filters']>['items'] = ['search']
        if (datasetsList.filtersList && datasetsList.filtersList.includes('concepts')) filterItems.push('concepts')
        filterItems.push('sort')

        // Construct default sort with direction
        const defaultOrderBySort = { title: '1', createdAt: '-1', dataUpdatedAt: '-1' } as const
        let defaultSort = datasetsList.defaultSort || 'createdAt'
        if (!(defaultSort in defaultOrderBySort)) defaultSort = 'createdAt'
        if (!defaultSort.includes(':')) {
          const key = defaultSort as keyof typeof defaultOrderBySort
          defaultSort = `${defaultSort}:${defaultOrderBySort[key]}`
        }

        const advancedFilters = []
        if (datasetsList.filtersList && datasetsList.filtersList.includes('topics')) {
          advancedFilters.push({
            type: 'topics',
            centered: false,
            mb: 0,
            ...datasetsList.topicsFilters
          })
        }

        return {
          title: 'Catalogue de données',
          description: 'Explorez nos jeux de données. Trouvez des données par thèmes, concepts, et plus encore.',
          elements: [
            {
              type: 'datasets-catalog',
              mb: 4,
              defaultSort,
              columns: datasetsList.columns || 2,
              datasetsCountPosition: 'top',
              showApiButton: true,
              showSortBesideCount: false,
              showAdvancedFilters: datasetsList.filtersList && datasetsList.filtersList.includes('topics'),
              filters: {
                position: datasetsList.filtersLocation || 'top',
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
        title: `Catalogue de données - ${portal.title}`,
        type: 'datasets',
        owner: portal.owner,
        created: {
          id: portal.owner.id,
          name: portal.owner.name + ' (Administration)',
          date: now
        },
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
      debug(`Created datasets page ${page._id} for portal ${portal._id}`)

      // Clean up old datasets.list configuration that has been migrated to the new page
      // @ts-expect-error datasets.list existed in previous version but has been removed
      delete portal.config?.datasets?.list
      // @ts-expect-error datasets.list existed in previous version but has been removed
      delete portal.draftConfig?.datasets?.list
    }
  }
} as UpgradeScript
