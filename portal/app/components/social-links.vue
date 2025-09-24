<template>
  <v-btn
    v-for="[key, platform] in filteredSocialPlatforms"
    :key="key"
    :title="t('openAccount', { account: key })"
    :href="platform.url(links[key] as string)"
    target="_blank"
    rel="noopener noreferrer"
    density="comfortable"
    variant="text"
    icon
  >
    <component :is="platform.component" v-if="platform.component" />
    <v-icon v-else :icon="platform.icon" />
  </v-btn>
</template>

<script setup lang="ts">
import type { SocialLinks } from '#api/types/portal'
import { mdiFacebook, mdiInstagram, mdiLinkedin, mdiVimeo, mdiYoutube } from '@mdi/js'

const props = defineProps<{
  links: SocialLinks
}>()

const { t } = useI18n()

const filteredSocialPlatforms = computed(() => {
  return Object.entries(socialPlatforms).filter(([key]) => props.links[key])
})

const socialPlatforms: Record<
  keyof SocialLinks,
  {
    url: (handle: string) => string
    icon?: string
    component?: ReturnType<typeof resolveComponent>
  }
> = {
  bluesky: {
    url: (handle) => `https://bsky.app/profile/${handle}`,
    component: resolveComponent('IconBluesky')
  },
  x: {
    url: (handle) => `https://x.com/${handle}`,
    component: resolveComponent('IconX')
  },
  facebook: {
    url: (handle) => `https://facebook.com/${handle}`,
    icon: mdiFacebook,
  },
  linkedin: {
    url: (handle) => `https://linkedin.com/company/${handle}`,
    icon: mdiLinkedin,
  },
  instagram: {
    url: (handle) => `https://instagram.com/${handle}`,
    icon: mdiInstagram,
  },
  youtube: {
    url: (handle) => `https://youtube.com/${handle}`,
    icon: mdiYoutube,
  },
  vimeo: {
    url: (handle) => `https://vimeo.com/${handle}`,
    icon: mdiVimeo
  }
}
</script>

<i18n lang="yaml">
  en:
    openAccount: Open @.capitalize:{'account'} profile
    account: '{account}'
  fr:
    openAccount: Ouvrir le profil @.capitalize:{'account'}
    account: '{account}'
</i18n>
