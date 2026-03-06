import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'

export default {
  description: 'Replace navBar color references in portal headers',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')

    const result = await portals.updateMany(
      {},
      [
        {
          $set: {
            'config.header.color': {
              $cond: [
                { $eq: ['$config.header.color', 'navBar'] },
                '$config.navBar.color',
                '$config.header.color'
              ]
            },
            'config.headerHome.color': {
              $cond: [
                { $eq: ['$config.headerHome.color', 'navBar'] },
                '$config.navBarHome.color',
                '$config.headerHome.color'
              ]
            },
            'draftConfig.header.color': {
              $cond: [
                { $eq: ['$draftConfig.header.color', 'navBar'] },
                '$draftConfig.navBar.color',
                '$draftConfig.header.color'
              ]
            },
            'draftConfig.headerHome.color': {
              $cond: [
                { $eq: ['$draftConfig.headerHome.color', 'navBar'] },
                '$draftConfig.navBarHome.color',
                '$draftConfig.headerHome.color'
              ]
            }
          }
        }
      ]
    )

    debug(`Updated ${result.modifiedCount} portals for header colors`)
  }
} as UpgradeScript
