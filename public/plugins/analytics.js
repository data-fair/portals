import Vue from 'vue'
import VueMultianalytics from '@koumoul/vue-multianalytics/src'

export default ({ store, env, app }) => {
  const analytics = store.state.config.analytics
  if (!(analytics && analytics.active)) return
  try {
    Vue.use(VueMultianalytics, { modules: { [analytics.type]: analytics.params }, routing: { vueRouter: app.router, preferredProperty: 'path' } })
  } catch (err) {
    console.error(err)
  }
}
