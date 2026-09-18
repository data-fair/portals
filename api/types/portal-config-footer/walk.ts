import type { Footer, FooterRow } from './index.ts'
import type { FooterElement, FooterLinksElement, FooterButtonsElement } from '../footer-elements/index.ts'
import type { ImageRef } from '../image-ref/index.ts'

/** The block lists of the columns a row displays, left to right. */
export const footerRowColumns = (row: FooterRow): FooterElement[][] => {
  const columns = [row.blocks]
  if (row.columns >= 2) columns.push(row.blocks2 ?? [])
  if (row.columns >= 3) columns.push(row.blocks3 ?? [])
  return columns
}

export const forEachFooterBlock = (footer: Footer | undefined, cb: (block: FooterElement) => void) => {
  for (const row of footer?.rows ?? []) {
    for (const blocks of footerRowColumns(row)) {
      for (const block of blocks) cb(block)
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

// also walks the columns a row no longer displays so their images are kept and duplicated
export const footerImageRefs = (footer: Footer | undefined) => {
  const refs: (ImageRef | undefined)[] = [footer?.background.image]
  for (const row of footer?.rows ?? []) {
    refs.push(row.background?.image)
    for (const block of [...row.blocks, ...row.blocks2 ?? [], ...row.blocks3 ?? []]) {
      if (block.type !== 'images') continue
      for (const item of block.items) refs.push(item.image, item.imageDark)
    }
  }
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
