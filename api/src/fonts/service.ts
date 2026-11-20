import type { Font } from '#types/font/index.js'
import type { AccountKeys } from '@data-fair/lib-express'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import resolvePath from 'resolve-path'
import mongo from '#mongo'
import { type FontAsset } from '#types/font-asset/index.js'
import { makeFontCss } from './operations.ts'

const standardFonts = JSON.parse(await readFile(resolve(import.meta.dirname, '../../assets/fonts.json'), 'utf-8'))

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
