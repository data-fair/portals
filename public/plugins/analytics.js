import Vue from 'vue'
import VueMultianalytics from '@koumoul/vue-multianalytics/src'
const debug = require('debug')('analytics')
debug.log = console.log.bind(console)

export default ({ store, env, app }) => {
  if (!store.state.config) return
  const analytics = store.state.config.analytics
  if (!analytics || analytics.type === 'none') {
    Vue.prototype.$ma = {
      trackEvent(params) {
        debug('no analytics - track event', params)
      },
      trackView(params) {
        debug('no analytics - track view', params)
      },
    }
    return
  }
  try {
    Vue.use(VueMultianalytics, {
      modules: { [analytics.type]: analytics.params },
      routing: { vueRouter: app.router, preferredProperty: 'path' },
    })
  } catch (err) {
    console.error(err)
  }
}
