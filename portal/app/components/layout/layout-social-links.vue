<template>
  <v-btn
    v-for="[key, platform] in filteredSocialPlatforms"
    :key="key"
    :title="platform.title"
    :href="platform.url(links[key] as string)"
    target="_blank"
    rel="noopener noreferrer"
    density="comfortable"
    variant="text"
    icon
  >
    <icon-bluesky v-if="key === 'bluesky'" />
    <icon-x v-else-if="key === 'x'" />
    <v-icon v-else :icon="platform.icon" />
  </v-btn>
</template>

<script setup lang="ts">
import type { SocialLinks } from '#api/types/portal'
import { mdiFacebook, mdiInstagram, mdiLinkedin, mdiVimeo, mdiYoutube } from '@mdi/js'

const props = defineProps<{
  links: SocialLinks
}>()

const filteredSocialPlatforms = computed(() => {
  return Object.entries(socialPlatforms).filter(([key]) => props.links[key])
})

const socialPlatforms: Record<
  keyof SocialLinks,
  {
    url: (handle: string) => string
    title: string
    icon?: string
  }
> = {
  bluesky: {
    url: (handle) => `https://bsky.app/profile/${handle}`,
    title: 'Ouvrir le profil Bluesky'
  },
  x: {
    url: (handle) => `https://x.com/${handle}`,
    title: 'Ouvrir le profil X'
  },
  facebook: {
    url: (handle) => `https://facebook.com/${handle}`,
    title: 'Ouvrir le profil Facebook',
    icon: mdiFacebook,
  },
  linkedin: {
    url: (handle) => `https://linkedin.com/company/${handle}`,
    title: 'Ouvrir le profil LinkedIn',
    icon: mdiLinkedin,
  },
  instagram: {
    url: (handle) => `https://instagram.com/${handle}`,
    title: 'Ouvrir le profil Instagram',
    icon: mdiInstagram,
  },
  youtube: {
    url: (handle) => `https://youtube.com/${handle}`,
    title: 'Ouvrir le profil YouTube',
    icon: mdiYoutube,
  },
  vimeo: {
    url: (handle) => `https://vimeo.com/${handle}`,
    title: 'Ouvrir le profil Vimeo',
    icon: mdiVimeo
  }
}
</script>
