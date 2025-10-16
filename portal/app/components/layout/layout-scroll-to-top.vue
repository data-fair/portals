<!-- inspired by https://github.com/vuetifyjs/vuetify/blob/8bb752b210d25fbebcea12cd073d2ce4986f5e12/packages/docs/src/layouts/default/FabToTop.vue -->

<template>
  <v-fab-transition>
    <v-btn
      v-show="showButton"
      v-scroll="onScroll"
      :title="t('scrollToTop')"
      :icon="mdiChevronUp"
      position="fixed"
      location="bottom right"
      color="primary"
      class="ma-4"
      size="large"
      @click="scrollToTop"
    />
  </v-fab-transition>
</template>

<script setup lang="ts">
import { mdiChevronUp } from '@mdi/js'
import { useGoTo } from 'vuetify'

const route = useRoute()
const router = useRouter()
const goTo = useGoTo()
const { t } = useI18n()

const showButton = ref(false)
const scrollThreshold = 200

const scrollToTop = () => {
  if (route.hash) router.push({ hash: '' })
  goTo(0)
}

const onScroll = () => {
  const top = (window.pageYOffset || document.documentElement.scrollTop || 0)
  showButton.value = top > scrollThreshold
}
</script>

<i18n lang="yaml">
  en:
    scrollToTop: 'Scroll to top'

  fr:
    scrollToTop: 'Remonter au début de la page'
</i18n>
