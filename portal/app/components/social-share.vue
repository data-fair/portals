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
import type { SocialShares } from '#api/types/portal'
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
  portalConfig.value.socialShares
    .map(key => {
      const platform = socialPlatforms[key]
      if (!platform) return null
      if (platform.mobileOnly && !display.smAndDown.value) return null
      return { key, ...platform }
    })
    .filter(p => p !== null)
)

const socialPlatforms: Record<
  SocialShares[number],
  {
    mobileOnly?: boolean
    icon?: string
    component?: ReturnType<typeof resolveComponent>
  }
> = {
  bluesky: { component: resolveComponent('IconBluesky') },
  x: { component: resolveComponent('IconX') },
  facebook: { icon: mdiFacebook },
  linkedin: { icon: mdiLinkedin },
  reddit: { icon: mdiReddit },
  sms: { icon: mdiMessageProcessing, mobileOnly: true },
  whatsapp: { icon: mdiWhatsapp, mobileOnly: true }
}
</script>

<i18n lang="yaml">
  en:
    shareOn: Share on @.capitalize:{'account'}
    account: '{account}'
  fr:
    shareOn: Partager sur @.capitalize:{'account'}
    account: '{account}'
</i18n>
