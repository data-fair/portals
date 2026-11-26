import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

export default {
  description: 'Remove the button options of the AI assistant, its button now follows the scroll to top button',
  async exec (db, debug) {
    const result = await db.collection('portals').updateMany(
      { $or: [{ 'config.agentChat.btnProps': { $exists: true } }, { 'draftConfig.agentChat.btnProps': { $exists: true } }] },
      { $unset: { 'config.agentChat.btnProps': '', 'draftConfig.agentChat.btnProps': '' } }
    )
    debug(`removed agentChat.btnProps in ${result.modifiedCount} portals`)
  }
} as UpgradeScript
