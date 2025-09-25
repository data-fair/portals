<template>
  <share-network
    v-for="platform in filteredSocialPlatforms"
    v-slot="{ share }"
    :key="platform.key"
    :title="title"
    :network="platform.key"
    :url="url.href"
  >
    <v-btn
      :title="t('shareOn', { account: platform.key })"
      density="comfortable"
      variant="text"
      icon
      @click="share"
    >
      <component :is="platform.component" v-if="platform.component" />
      <v-icon v-else :icon="platform.icon" />
    </v-btn>
  </share-network>
</template>

<script setup lang="ts">
import { ShareNetwork } from 'vue3-social-sharing'
import { mdiFacebook, mdiLinkedin, mdiMessageProcessing, mdiReddit, mdiWhatsapp } from '@mdi/js'
import { useDisplay } from 'vuetify'

defineProps<{ title: string }>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const display = useDisplay()
const url = useRequestURL()

/**
 * Show only the social platforms that are configured in the portal settings
 * and filter out mobile-only platforms when not on a small screen.
 */
const filteredSocialPlatforms = computed(() =>
  socialPlatforms.filter(
    p =>
      portalConfig.value.socialShares.includes(p.key) &&
      (!p.mobileOnly || display.smAndDown.value)
  )
)

const socialPlatforms = [
  { key: 'bluesky' as const, component: resolveComponent('IconBluesky') },
  { key: 'x' as const, component: resolveComponent('IconX') },
  { key: 'facebook' as const, icon: mdiFacebook },
  { key: 'linkedin' as const, icon: mdiLinkedin },
  { key: 'reddit' as const, icon: mdiReddit },
  { key: 'sms' as const, icon: mdiMessageProcessing, mobileOnly: true },
  { key: 'whatsapp' as const, icon: mdiWhatsapp, mobileOnly: true },
]
</script>

<i18n lang="yaml">
  en:
    shareOn: Share on @.capitalize:{'account'}
    account: '{account}'
  fr:
    shareOn: Partager sur @.capitalize:{'account'}
    account: '{account}'
</i18n>
