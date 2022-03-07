import Vue from 'vue'
import tinycolor from 'tinycolor2'

const readableColor = (color) => {
  const c = tinycolor(color)
  const darkness = 1 - c.getLuminance()
  if (darkness > 0.7) return color
  return c.darken((0.7 - darkness) * 100).toString()
}

Vue.prototype.$color = tinycolor
Vue.prototype.$readableColor = readableColor
