import type { Footer, FooterRow } from '../../api/types/portal-config-footer/index.ts'
import type { FooterElement, FooterImagesItem, Color } from '../../api/types/footer-elements/index.ts'
import type { ImageRef } from '../../api/types/image-ref/index.ts'

type LinkItem = Record<string, any>
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
      blocks.push({ type: 'links', align: 'center', display: legacy.linksMode === 'columns' ? 'columns' : 'inline', items: legacy.links as any, mb: 0 })
    }
  }
  return blocks
}

export const migrateLegacyFooter = (legacy: LegacyFooter, whiteLabel: boolean): Footer => {
  const left = columnBlocks(legacy, 'left', whiteLabel)
  const main = columnBlocks(legacy, 'main', whiteLabel)

  const columns: FooterRow['columns'] = left.length
    ? [{ width: '1/3', blocks: left }, { width: '2/3', blocks: main }]
    : [{ width: 'auto', blocks: main }]
  const rows: FooterRow[] = [{ columns }]

  if (legacy.importantLinks?.length) {
    const divider: FooterElement = { type: 'divider', align: 'left', opacity: 0.10, thickness: 1, mb: 2 }
    rows.push({
      columns: [{
        width: 'auto',
        blocks: [
          divider,
          { type: 'buttons', align: 'center', variant: 'text', items: legacy.importantLinks as any, mb: 2 },
          { ...divider }
        ]
      }]
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

  return JSON.parse(JSON.stringify(result))
}
