<template>
  <v-footer
    :color="portalConfig.footer.color"
    class="pa-0 d-flex justify-center flex-wrap"
  >
    <v-container>
      <!-- Logo and/or Social Links -->
      <v-row
        v-if="logo || portalConfig.footer.social"
        align="center"
      >
        <v-col
          v-if="logo"
          class="text-center"
          :cols="portalConfig.footer.showSocial ? 6 : 12"
        >
          <layout-header-logo :logo="logo" />
        </v-col>
        <v-col
          v-if="portalConfig.footer.showSocial"
          class="text-center text-caption"
          :cols="logo ? 6 : 12"
        >
          <div>
            Retrouvez-nous sur les réseaux sociaux
          </div>
          <layout-social-links
            :links="portalConfig.socialLinks"
          />
        </v-col>
      </v-row>

      <!-- Extra logos -->
      <v-row
        v-if="portalConfig.footer.extraLogos.length"
        justify="center"
      >
        <v-col
          v-for="(extraLogo, index) in portalConfig.footer.extraLogos"
          :key="index"
          cols="auto"
        >
          <a
            v-if="extraLogo.link"
            :href="extraLogo.link"
            :title="extraLogo.label"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="getImageSrc(extraLogo.logo, false)"
              :alt="extraLogo.label"
              style="height:40px;"
            >
          </a>
          <img
            v-else
            :src="getImageSrc(extraLogo.logo, false)"
            :alt="extraLogo.label"
            style="height:40px;"
          >
        </v-col>
      </v-row>

      <!-- Links in single line -->
      <v-row
        v-if="portalConfig.footer.links.length && portalConfig.footer.linksMode === 'lines'"
        class="my-2"
        justify="center"
      >
        <v-col
          v-for="(link, key) in portalConfig.footer.links" :key="key"
          cols="auto"
          class="text-center"
        >
          <NuxtLink
            v-if="link.type !== 'external'"
            :to="resolveHref(link)"
          >
            {{ resolveTitle(link) }}
          </NuxtLink>
          <a
            v-else
            :href="resolveHref(link)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ resolveTitle(link) }}
          </a>
        </v-col>
      </v-row>

      <!-- Links in columns -->
      <v-row
        v-if="portalConfig.footer.links.length && portalConfig.footer.linksMode === 'columns'"
        class="my-2"
      >
        <v-col
          v-for="(link, key) in portalConfig.footer.links" :key="key"
          cols="10"
          sm="4"
          offset="2"
          offset-sm="2"
          class="pa-0"
        >
          <NuxtLink
            v-if="link.type !== 'external'"
            :to="resolveHref(link)"
          >
            {{ resolveTitle(link) }}
          </NuxtLink>
          <a
            v-else
            :href="resolveHref(link)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ resolveTitle(link) }}
          </a>
        </v-col>
      </v-row>

      <!-- Important Links-->
      <template v-if="portalConfig.footer.importantLinks.length">
        <v-divider />
          <v-row>
            <v-col cols="12" class="text-center">
              <template v-for="(link, index) in portalConfig.footer.importantLinks" :key="index">
                <v-btn
                  v-if="link.type !== 'external'"
                  :to="resolveHref(link)"
                  variant="text"
                >
                  {{ resolveTitle(link) }}
                </v-btn>

                <v-btn
                  v-else
                  :href="resolveHref(link)"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                >
                  {{ resolveTitle(link) }}
                </v-btn>
              </template>
            </v-col>
          </v-row>
        <v-divider />
      </template>
    </v-container>

    <!-- Copyright -->
    <template v-if="portalConfig.footer.copyright === 'text'">
      <v-divider />
      <div class="text-center my-2">
        <span>&copy;{{ new Date().getFullYear() }} — </span><strong><a href="https://koumoul.com">Koumoul</a></strong>
      </div>
    </template>
  </v-footer>
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'
import type { PortalConfig, Footer } from '#api/types/portal'

const { portalConfig } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const resolveHref = (link: Footer['links'][number]) => {
  switch (link.type) {
    case 'external': return link.href
    case 'custom': return link.pageRef ? `/page/${link.pageRef._id}` : undefined
    case 'datasets': return '/datasets'
    case 'applications': return '/applications'
    case 'contact': return '/contact'
    case 'sitemap': return '/sitemap'
    case 'privacy-policy': return '/privacy-policy'
    default: return undefined
  }
}

const resolveTitle = (link: Footer['links'][number]) => {
  switch (link.type) {
    case 'sitemap': return 'Plan du site'
    case 'privacy-policy': return 'Politique de confidentialité'
    default: return link.title
  }
}

const logo = computed(() => {
  const { footer, header, logo: defaultLogo } = portalConfig

  switch (footer.logoPrimaryType) {
    case 'default': return defaultLogo
    case 'header':
      if (header.logoPrimaryType === 'local' && header.logoPrimary) return header.logoPrimary
      if (header.logoPrimaryType === 'default') return defaultLogo
      return undefined
    case 'local': return footer.logoPrimary
    default: return undefined
  }
})

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>
