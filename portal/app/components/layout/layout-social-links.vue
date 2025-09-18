<template>
  <v-btn
    v-for="[key, platform] in filteredSocialPlatforms"
    :key="key"
    :title="t('openAccount', { account: platform.title })"
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
    title: string
    icon?: string
    component?: ReturnType<typeof resolveComponent>
  }
> = {
  bluesky: {
    url: (handle) => `https://bsky.app/profile/${handle}`,
    title: 'Bluesky',
    component: resolveComponent('IconBluesky')
  },
  x: {
    url: (handle) => `https://x.com/${handle}`,
    title: 'X',
    component: resolveComponent('IconX')
  },
  facebook: {
    url: (handle) => `https://facebook.com/${handle}`,
    title: 'Facebook',
    icon: mdiFacebook,
  },
  linkedin: {
    url: (handle) => `https://linkedin.com/company/${handle}`,
    title: 'LinkedIn',
    icon: mdiLinkedin,
  },
  instagram: {
    url: (handle) => `https://instagram.com/${handle}`,
    title: 'Instagram',
    icon: mdiInstagram,
  },
  youtube: {
    url: (handle) => `https://youtube.com/${handle}`,
    title: 'YouTube',
    icon: mdiYoutube,
  },
  vimeo: {
    url: (handle) => `https://vimeo.com/${handle}`,
    title: 'Vimeo',
    icon: mdiVimeo
  }
}
</script>

<!-- TODO check that bluesky icon is correctly shown -->

<i18n lang="yaml">
  en:
    openAccount: 'Open {account} profile'

  fr:
    openAccount: 'Ouvrir le profil {account}'

</i18n>
