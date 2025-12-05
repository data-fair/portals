import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal, ApplicationPage } from '../../api/types/portal/index.ts'

type ApplicationPageConfigOld = ApplicationPage & {
  metadataLocation?: 'top' | 'right'
  attachmentsLocation?: 'action' | 'full'
  actionsStyle?: 'icon' | 'full' | 'text'
  showDepartment?: boolean
}

export default {
  description: 'Migrate application page configuration to new metadata structure',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')

    for await (const portal of portals.find({})) {
      const migrateConfig = (config?: ApplicationPageConfigOld) => {
        if (!config) return false

        // Check if migration is needed (old structure exists)
        if (config.metadataLocation || config.attachmentsLocation || config.actionsStyle || config.showDepartment !== undefined) {
          debug(`Migrating config for portal ${portal._id} - ${portal.title}`)

          if (!config.metadata) config.metadata = {}

          if (config.metadataLocation) {
            config.metadata.location = config.metadataLocation
            delete config.metadataLocation
          }
          if (config.actionsStyle) {
            config.metadata.actionsStyle = config.actionsStyle
            delete config.actionsStyle
          }
          if (config.showDepartment !== undefined) {
            config.metadata.showDepartment = config.showDepartment
            delete config.showDepartment
          }
          if (config.attachmentsLocation) delete config.attachmentsLocation
          return true
        }
        return false
      }

      let configUpdated = false
      let draftConfigUpdated = false

      if (portal.config?.applications?.page) {
        configUpdated = migrateConfig(portal.config.applications.page)
      }
      if (portal.draftConfig?.applications?.page) {
        draftConfigUpdated = migrateConfig(portal.draftConfig.applications.page)
      }

      // Update portal if any changes were made
      if (configUpdated || draftConfigUpdated) {
        await portals.updateOne(
          { _id: portal._id },
          { $set: { config: portal.config, draftConfig: portal.draftConfig } }
        )
        debug(`Updated portal ${portal._id}`)
      }
    }
  }
} as UpgradeScript
