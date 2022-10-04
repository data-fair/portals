import Vue from 'vue'
import tinycolor from 'tinycolor2'

const readableColorCache = {}

// default background is #FAFAFA the light grey background
const readableColor = (color, background = '#FAFAFA') => {
  const cacheKey = JSON.stringify(color, background)
  if (readableColorCache[cacheKey]) return readableColorCache[cacheKey]
  const c = tinycolor(color)
  const dark = tinycolor(background).getLuminance() < 0.5
  while (!tinycolor.isReadable(c, background, { lebel: 'AA', size: 'small' })) {
    if (dark) {
      c.brighten(2)
    } else {
      c.darken(2)
    }
  }
  readableColorCache[cacheKey] = c.toString()
  return readableColorCache[cacheKey]
}

Vue.prototype.$color = tinycolor
Vue.prototype.$readableColor = readableColor
