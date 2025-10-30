import { writeFileSync, readFileSync, createWriteStream, mkdirSync } from 'node:fs'
// import { promisify } from 'node:util'
// import { gzip as gzipCallback } from 'node:zlib'
import { get as httpGet } from 'node:https'
import { pipeline } from 'node:stream/promises'
import { basename } from 'node:path'

// const gzip = promisify(gzipCallback)

const googleFonts = JSON.parse(readFileSync('google-fonts-complete/google-fonts.json', 'utf8'))

const fonts = []

const makeFontFace = (name, subset, unicodeRange, fontStyle, fontWeight, woff2Url) => `
/* ${subset} */
@font-face {
  font-family: ${name};
  font-style: ${fontStyle};
  font-weight: ${fontWeight};
  font-display: swap;
  src: url(${woff2Url}) format('woff2');
  unicode-range: ${unicodeRange};
}
`

const entries = Object.entries(googleFonts)
console.log('initial entries: ' + entries.length)

const fontStyles = new Set()
const categories = new Set()

for (const [name, info] of entries) {
  // TODO: restrict to some categories
  if (!info.subsets.includes('latin')) {
    console.log('font without latin unicode range', name)
    continue
  }
  if (!info.variants.normal) {
    console.log('font without normal variant', name)
    continue
  }
  const weights = Object.keys(info.variants.normal)
  const minWeight = weights[0]
  const maxWeight = weights[weights.length - 1]
  if (minWeight > '400' || maxWeight < '400') {
    console.log('font without regular weight', name)
    continue
  }
  if (['icon'].includes(info.category)) {
    console.log(`font of rejected category ${info.category}`, name)
    continue
  }
  if (name.split(' ').includes('Icons')) {
    console.log('font contains word "Icons"', name)
    continue
  }
  if (name.split(' ').includes('Symbols')) {
    console.log('font contains word "Symbols"', name)
    continue
  }

  // uncomment to run in dev env with a choice of test fonts
  /*
  if (!['Montserrat', 'Noto Sans', 'Nunito', 'Pacifico', 'Roboto'].includes(name)) {
    continue
  }
  */

  categories.add(info.category)

  console.log('prepare font ' + name)
  const key = name.toLowerCase().replace(/\s/g, '')

  mkdirSync(`api/assets/fonts/${key}`)

  fonts.push(name)

  let fontFaces = ''
  const urls = new Set()
  for (const subset of info.subsets.filter(s => s.startsWith('latin'))) {
    for (const fontStyle of Object.keys(info.variants)) {
      fontStyles.add(fontStyle)
      const weights = Object.keys(info.variants[fontStyle]).filter(w => w >= '300' && w <= '700')
      let rangeStart = null
      for (let i = 0; i < weights.length; i++) {
        const weight = weights[i]
        if (rangeStart === null) rangeStart = weight
        const nextWeight = weights[i + 1]
        const url = info.variants[fontStyle][weight].url.woff2.trim()
        urls.add(url)
        const nextUrl = nextWeight && info.variants[fontStyle][nextWeight].url.woff2.trim()
        if (url !== nextUrl) {
          let weightRange = rangeStart
          if (rangeStart !== weight) weightRange += ' ' + weight
          rangeStart = null
          const fileName = basename(new URL(url).pathname)
          const localUrl = `/portals-manager/api/assets/fonts/${encodeURIComponent(key)}/${fileName}`
          fontFaces += makeFontFace(name, subset, info.unicodeRange[subset], fontStyle, weightRange, localUrl)
        }
      }
    }
  }

  // writeFileSync(`api/assets/fonts/${name}.css.gz`, await gzip(fontFaces))
  writeFileSync(`api/assets/fonts/${key}.css`, fontFaces)

  for (const url of [...urls]) {
    const fileName = basename(new URL(url).pathname)
    const res = await new Promise(resolve => httpGet(url, resolve))
    await pipeline(res, createWriteStream(`api/assets/fonts/${key}/${fileName}`))
  }
}

writeFileSync('api/assets/fonts.json', JSON.stringify(fonts, null, 2))

console.log('processed fonts: ' + fonts.length)
// console.log('fontStyles', fontStyles)
// console.log('categories', categories)

/*
Some examples:

AR One Sans, same woff 2 file for multiple weights (represented as a weight range), 2 unicode ranges of interest (latin, latin-ext), not italic version
https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&display=swap

Nunito

2 weights with different woff 2 files, italic variant
https://fonts.googleapis.com/css?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap

*/
