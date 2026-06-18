import type { Font } from '#types/font/index.js'
import type { AccountKeys } from '@data-fair/lib-express'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import resolvePath from 'resolve-path'
import mongo from '#mongo'
import { type FontAsset } from '#types/font-asset/index.js'

const standardFonts = JSON.parse(await readFile(resolve(import.meta.dirname, '../../assets/fonts.json'), 'utf-8'))

const unicodeRanges = {
  cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
  'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
  greek: 'U+0370-03FF',
  'greek-ext': 'U+1F00-1FFF',
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
  vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'
}

const fontFormatFromUrl = (url: string) => {
  if (url.endsWith('.otf')) return 'opentype'
  if (url.endsWith('.ttf')) return 'truetype'
  return 'woff2'
}

export const makeFontCss = (font: Font) => {
  let css = ''
  for (const variant of font.variants) {
    const fontUrl = variant.woff2Url
    const format = fontFormatFromUrl(fontUrl)
    css += `
/* ${variant.subset} */
@font-face {
  font-family: ${font.name};
  font-style: ${variant.style};
  font-weight: ${variant.weightRange};
  font-display: swap;
  src: url(${fontUrl}) format('${format}');
  unicode-range: ${unicodeRanges[variant.subset]};
}
`
  }
  return css
}

export const getFontNames = async (owner: AccountKeys) => {
  const fonts = (await mongo.fontAssets.aggregate([
    { $match: { 'owner.type': owner.type, 'owner.id': owner.id } },
    { $group: { _id: '$name' } }
  ]).toArray()).map(r => r._id).sort()

  return fonts.concat(standardFonts)
}

const getFont = async (owner: AccountKeys, familyName: string, managerUrl = false): Promise<Font> => {
  if (standardFonts.includes(familyName)) {
    const key = familyName.toLowerCase().replace(/\s/g, '')
    return JSON.parse(await readFile(resolvePath(resolve(import.meta.dirname, '../../assets/fonts'), key + '.json'), 'utf-8'))
  }
  const assets = (await mongo.fontAssets.find({ 'owner.type': owner.type, 'owner.id': owner.id, name: familyName })
    .project({ _id: 1, subset: 1, weightRange: 1, style: 1, 'file.name': 1 }).toArray()) as any[] as Pick<FontAsset, '_id' | 'subset' | 'weightRange' | 'style' | 'file'>[]
  return {
    name: familyName,
    variants: assets.map(asset => {
      const encodedName = encodeURIComponent(asset.file.name)
      return { ...asset, woff2Url: managerUrl ? `/portals-manager/api/font-assets/${asset._id}/data/${encodedName}` : `/portal/api/font-assets/${asset._id}/${encodedName}` }
    })
  }
}

export const getFontFamilyCss = async (owner: AccountKeys, familyName: string, managerUrl = false) => {
  return makeFontCss(await getFont(owner, familyName, managerUrl))
}

// Pick the normal-latin face to preload for the weight this family renders most
// (400 as body text, 700 as titles). A weightRange is a single weight ("400") or a
// span — a full variable face ("300 700") or one slice of a multi-file family (EDF
// ships "400 600" → Regular, "700 900" → Bold). A span covering both 400 and 700
// makes body and heading resolve to the same file, deduped to one preload.
const pickPreloadUrl = (font: Font, weight: string): string | undefined => {
  const target = Number(weight)
  const normalLatin = font.variants.filter(v => v.style === 'normal' && v.subset === 'latin')
  const match = normalLatin.find(v => {
    const [lo, hi] = v.weightRange.split(' ').map(Number)
    return hi === undefined ? lo === target : target >= lo && target <= hi
  })
  return (match ?? normalLatin[0] ?? font.variants.find(v => v.style === 'normal'))?.woff2Url
}

// Build both the @font-face CSS and the preload URL of a family from a single
// DB/file read — getSDSites needs both, so this avoids fetching the font twice.
export const getFontFamilyAssets = async (owner: AccountKeys, familyName: string, preloadWeight = '400'): Promise<{ css: string, preloadUrl?: string }> => {
  const font = await getFont(owner, familyName)
  return { css: makeFontCss(font), preloadUrl: pickPreloadUrl(font, preloadWeight) }
}
