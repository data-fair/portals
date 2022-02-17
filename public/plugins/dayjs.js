import Vue from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
// import 'dayjs/locale/en'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

Vue.prototype.$dayjs = dayjs

Vue.filter('date', (value, format = 'LLL') => {
  if (!value) return
  return dayjs(value).format(format)
})

Vue.filter('fromNow', (value) => {
  if (!value) return
  return dayjs(value).fromNow()
})

export default async ({ app }) => {
  // dayjs.locale(app.i18n.locale)
  dayjs.locale('fr')
  /* app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    dayjs.locale(newLocale)
  } */
}
