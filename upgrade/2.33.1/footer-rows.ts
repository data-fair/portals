import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'
import type { Portal } from '../../api/types/portal/index.ts'
import type { Footer, FooterRow } from '../../api/types/portal-config-footer/index.ts'
import type { FooterElement, FooterImagesItem, LinkItem, Color } from '../../api/types/footer-elements/index.ts'
import type { ImageRef } from '../../api/types/image-ref/index.ts'

type Position = 'main' | 'left'
type Alignment = 'left' | 'center' | 'right'

/** Shape of the footer configuration before the rows migration. */
export type LegacyFooter = {
  color: string
  copyright: 'text' | 'logo'
  socialPosition?: 'none' | 'main' | 'left'
  showSocial?: boolean
  logoPrimaryType: 'default' | 'header' | 'local' | 'hidden'
  logoPrimary?: ImageRef
  logoPrimaryDark?: ImageRef
  logoPrimaryLink?: string
  logoPosition?: Position
  logoAlignment?: Alignment
  slogan?: string
  sloganColor?: string
  sloganPosition?: Position
  sloganAlignment?: Alignment
  text?: string
  text_html?: string
  textPosition?: Position
  backgroundImage?: ImageRef
  backgroundImageLocation?: 'left' | 'center' | 'right' | 'repeat'
  extraLogos?: { logo: ImageRef, label: string, link?: string }[]
  linksMode?: 'lines' | 'columns'
  links?: LinkItem[]
  importantLinks?: LinkItem[]
}

const logoItem = (legacy: LegacyFooter): FooterImagesItem | undefined => {
  const link = legacy.logoPrimaryLink || '/'
  switch (legacy.logoPrimaryType) {
    case 'default': return { source: 'global', link }
    case 'header': return { source: 'header', link }
    case 'local': return legacy.logoPrimary ? { source: 'upload', image: legacy.logoPrimary, imageDark: legacy.logoPrimaryDark, link } : undefined
    default: return undefined
  }
}

const columnBlocks = (legacy: LegacyFooter, position: Position, whiteLabel: boolean): FooterElement[] => {
  const blocks: FooterElement[] = []
  const socialPosition = legacy.socialPosition ?? (legacy.showSocial ? 'main' : 'none')

  const logo = logoItem(legacy)
  if (logo && (legacy.logoPosition ?? 'main') === position) {
    blocks.push({ type: 'images', align: legacy.logoAlignment ?? 'left', height: 80, items: [logo], mb: 4 })
  }
  if (legacy.slogan && (legacy.sloganPosition ?? 'main') === position) {
    blocks.push({ type: 'text', align: legacy.sloganAlignment ?? 'left', markdown: false, content: legacy.slogan, color: legacy.sloganColor as Color | undefined, mb: 4 })
  }
  if (legacy.text && (legacy.textPosition ?? 'main') === position) {
    blocks.push({ type: 'text', align: 'left', markdown: true, content: legacy.text, content_html: legacy.text_html, mb: 4 })
  }
  if (socialPosition === position) {
    blocks.push({ type: 'social', align: 'center', mb: position === 'main' ? 4 : 0 })
  }

  if (position === 'main') {
    const items: FooterImagesItem[] = (legacy.extraLogos ?? []).map(extra => ({ source: 'upload', image: extra.logo, label: extra.label, link: extra.link || undefined }))
    if (legacy.copyright === 'logo' && !whiteLabel) items.push({ source: 'koumoul' })
    if (items.length) blocks.push({ type: 'images', align: 'center', height: 40, items, mb: 0 })
    if (legacy.links?.length) {
      blocks.push({ type: 'links', align: 'center', display: legacy.linksMode === 'columns' ? 'columns' : 'inline', items: legacy.links as LinkItem[], mb: 0 })
    }
  }
  return blocks
}

export const migrateLegacyFooter = (legacy: LegacyFooter, whiteLabel: boolean): Footer => {
  const left = columnBlocks(legacy, 'left', whiteLabel)
  const main = columnBlocks(legacy, 'main', whiteLabel)

  // the legacy left column was a third of the row
  const rows: FooterRow[] = [left.length
    ? { columns: 2, disposition: 'right', blocks: left, blocks2: main }
    : { columns: 1, blocks: main }]

  if (legacy.importantLinks?.length) {
    const divider: FooterElement = { type: 'divider', align: 'left', opacity: 0.10, thickness: 1, mb: 2 }
    rows.push({
      columns: 1,
      blocks: [
        divider,
        { type: 'buttons', align: 'center', variant: 'text', items: legacy.importantLinks as LinkItem[], mb: 2 },
        { ...divider }
      ]
    })
  }

  const background: Footer['background'] = { color: legacy.color as Footer['background']['color'] }
  if (legacy.backgroundImage) {
    background.image = legacy.backgroundImage
    background.imageLocation = legacy.backgroundImageLocation ?? 'right'
  }

  const result: Footer = {
    copyright: whiteLabel ? true : legacy.copyright !== 'logo',
    background,
    rows
  }

  // strips the undefined values so the migrated footer is written to mongo without empty keys
  return JSON.parse(JSON.stringify(result))
}

export default {
  description: 'Convert the legacy footer options into rows, columns and blocks, keeping a backup of the old configuration',
  async exec (db, debug) {
    const portals = db.collection<Portal>('portals')
    let count = 0
    const cursor = portals.find({
      $or: [
        { 'config.footer': { $exists: true }, 'config.footer.rows': { $exists: false } },
        { 'draftConfig.footer': { $exists: true }, 'draftConfig.footer.rows': { $exists: false } }
      ]
    })
    for await (const portal of cursor) {
      const $set: Record<string, unknown> = {}
      const whiteLabel = !!portal.whiteLabel
      const config = portal.config as any
      const draftConfig = portal.draftConfig as any
      if (config?.footer && !config.footer.rows) {
        if (!portal.legacyFooter) $set.legacyFooter = config.footer
        $set['config.footer'] = migrateLegacyFooter(config.footer as LegacyFooter, whiteLabel)
      }
      if (draftConfig?.footer && !draftConfig.footer.rows) {
        if (!portal.legacyDraftFooter) $set.legacyDraftFooter = draftConfig.footer
        $set['draftConfig.footer'] = migrateLegacyFooter(draftConfig.footer as LegacyFooter, whiteLabel)
      }
      if (!Object.keys($set).length) continue
      await portals.updateOne({ _id: portal._id }, { $set })
      count++
      debug(`migrated footer of portal ${portal._id} (${portal.title})`)
    }
    debug(`migrated ${count} portals`)
  }
} as UpgradeScript
