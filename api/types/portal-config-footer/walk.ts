import type { Footer } from './index.ts'
import type { FooterElement, FooterLinksElement, FooterButtonsElement } from '../footer-elements/index.ts'
import type { ImageRef } from '../image-ref/index.ts'

export const forEachFooterBlock = (footer: Footer | undefined, cb: (block: FooterElement) => void) => {
  for (const row of footer?.rows ?? []) {
    for (const column of row.columns) {
      for (const block of column.blocks) cb(block)
    }
  }
}

export const hasKoumoulMention = (footer: Footer | undefined) => {
  if (!footer || footer.copyright) return true
  let found = false
  forEachFooterBlock(footer, (block) => {
    if (block.type === 'images' && block.items.some(item => item.source === 'koumoul')) found = true
  })
  return found
}

export const footerImageRefs = (footer: Footer | undefined) => {
  const refs: (ImageRef | undefined)[] = [footer?.background.image]
  for (const row of footer?.rows ?? []) refs.push(row.background?.image)
  forEachFooterBlock(footer, (block) => {
    if (block.type !== 'images') return
    for (const item of block.items) refs.push(item.image, item.imageDark)
  })
  return refs.filter((ref): ref is ImageRef => !!ref)
}

export const footerLinkItems = (footer: Footer | undefined) => {
  const links: FooterLinksElement['items'] = []
  const buttons: FooterButtonsElement['items'] = []
  forEachFooterBlock(footer, (block) => {
    if (block.type === 'links') links.push(...block.items)
    if (block.type === 'buttons') buttons.push(...block.items)
  })
  return { links, buttons }
}
