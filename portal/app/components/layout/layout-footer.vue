<template>
  <!-- Breadcrumb above footer -->
  <layout-breadcrumbs v-if="portalConfig.breadcrumb.position === 'above-footer' || portalConfig.breadcrumb.position === 'both'" />

  <v-container
    v-if="portalConfig.footer.showContactInformations"
    :class="[`bg-${portalConfig.footer.color}`, 'pa-0']"
    fluid
  >
    <v-container>
      <v-row>
        <v-col cols="6">
          <p v-if="portalConfig.contactInformations.phone">
            <v-icon :icon="mdiPhone" />
            {{ portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone }}
          </p>
          <p v-if="portalConfig.contactInformations.website">
            <v-icon :icon="mdiWeb" />
            {{ portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website }}
          </p>
          <p v-if="portalConfig.contactInformations.email">
            <v-icon :icon="mdiEmail" />
            <NuxtLink to="/contact">{{ t('contactUs') }}</NuxtLink>
          </p>
        </v-col>
        <v-col cols="6">
          <!--eslint-disable-next-line vue/no-v-html -->
          <div v-html="portalConfig.contactInformations.infos" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>

  <v-footer
    :color="portalConfig.footer.color"
    :style="portalConfig.footer.backgroundImage ? {
      backgroundImage: `url(${getImageSrc(portalConfig.footer.backgroundImage, false)})`,
      backgroundPosition: `bottom ${portalConfig.footer.backgroundImageLocation}`,
      backgroundRepeat: portalConfig.footer.backgroundImageLocation === 'repeat' ? 'repeat' : 'no-repeat'
    } : {}"
    class="pa-0 d-flex justify-center flex-wrap flex-grow-0"
  >
    <v-container>
      <!-- Logo and/or Social Links -->
      <v-row
        v-if="logo || portalConfig.footer.showSocial"
        align="center"
        justify="center"
      >
        <v-col
          v-if="logo"
          class="text-center"
          :cols="portalConfig.footer.showSocial ? 6 : 12"
        >
          <layout-header-logo
            :logo="logo"
            class="justify-center"
          />
        </v-col>
        <v-col
          v-if="portalConfig.footer.showSocial && Object.keys(portalConfig.socialLinks).length"
          class="text-center text-caption"
          :cols="logo ? 6 : 12"
        >
          <div>{{ t('socialMedia') }}</div>
          <social-links :links="portalConfig.socialLinks" />
        </v-col>
      </v-row>

      <!-- Extra logos -->
      <v-row
        v-if="portalConfig.footer.extraLogos.length || portalConfig.footer.copyright === 'logo'"
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
            rel="noopener"
          >
            <img
              :alt="extraLogo.label"
              :src="getImageSrc(extraLogo.logo, false)"
              style="height:40px;"
            >
          </a>
          <img
            v-else
            :alt="extraLogo.label"
            :src="getImageSrc(extraLogo.logo, false)"
            style="height:40px;"
          >
        </v-col>
        <!-- Copyright Logo -->
        <v-col
          v-if="portalConfig.footer.copyright === 'logo'"
          cols="auto"
        >
          <a
            href="https://koumoul.com"
            title="Koumoul"
            target="_blank"
            rel="noopener"
          >
            <img
              alt="Koumoul Logo"
              src="https://koumoul.com/static/logo-title-right.png"
              style="height:40px;"
            >
          </a>
        </v-col>
      </v-row>

      <!-- Links in single line -->
      <v-row
        v-if="portalConfig.footer.links.length && portalConfig.footer.linksMode === 'lines'"
        class="my-2"
        justify="center"
      >
        <v-col
          v-for="(link, key) in portalConfig.footer.links"
          :key="key"
          cols="auto"
          class="text-center"
        >
          <a
            v-if="link.type === 'external'"
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="simple-link"
          >
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ link.title }}
          </a>
          <NuxtLink
            v-else
            :to="resolveLink(link)"
            class="simple-link"
          >
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ resolveLinkTitle(link, locale) }}
          </NuxtLink>
        </v-col>
      </v-row>

      <!-- Links in columns -->
      <v-row
        v-if="portalConfig.footer.links.length && portalConfig.footer.linksMode === 'columns'"
        class="my-2"
      >
        <v-col
          v-for="(link, key) in portalConfig.footer.links"
          :key="key"
          cols="10"
          sm="4"
          offset="2"
          offset-sm="2"
          class="pa-0"
        >
          <a
            v-if="link.type === 'external'"
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="simple-link"
          >
            <v-icon
              v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
              size="small"
              class="mr-1"
            />
            {{ link.title }}
          </a>
          <NuxtLink
            v-else
            :to="resolveLink(link)"
            class="simple-link"
          >
            <span class="d-flex align-center">
              <v-icon
                v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
                :icon="link.icon.mdi?.svgPath || link.icon.custom"
                :color="link.icon.color"
                size="small"
                class="mr-1"
              />
              {{ resolveLinkTitle(link, locale) }}
            </span>
          </NuxtLink>
        </v-col>
      </v-row>

      <!-- Important Links-->
      <template v-if="portalConfig.footer.importantLinks.length">
        <v-divider class="my-2" />
        <v-row>
          <v-col
            cols="12"
            class="text-center"
          >
            <template
              v-for="(link, index) in portalConfig.footer.importantLinks"
              :key="index"
            >
              <v-btn
                v-if="link.type === 'external'"
                :href="link.href"
                target="_blank"
                rel="noopener"
                variant="text"
              >
                <template #prepend>
                  <v-icon
                    v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
                    :icon="link.icon.mdi?.svgPath || link.icon.custom"
                    :color="link.icon.color"
                  />
                </template>
                {{ link.title }}
              </v-btn>
              <v-btn
                v-else
                :to="resolveLink(link)"
                variant="text"
              >
                <template #prepend>
                  <v-icon
                    v-if="link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
                    :icon="link.icon.mdi?.svgPath || link.icon.custom"
                    :color="link.icon.color"
                  />
                </template>
                {{ resolveLinkTitle(link, locale) }}
              </v-btn>
            </template>
          </v-col>
        </v-row>
        <v-divider class="my-2" />
      </template>
    </v-container>

    <!-- Copyright -->
    <template v-if="portalConfig.footer.copyright === 'text'">
      <v-divider />
      <div class="text-center my-2">
        <span>&copy;{{ new Date().getFullYear() }} — </span><strong><a
            href="https://koumoul.com"
            target="_blank"
            rel="noopener"
            class="simple-link"
          >Koumoul</a></strong>
      </div>
    </template>
  </v-footer>
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiEmail, mdiPhone, mdiWeb } from '@mdi/js'

const { t, locale } = useI18n()
const { portalConfig } = usePortalStore()
const { resolveLink, resolveLinkTitle } = useNavigationStore()

const logo = computed(() => {
  const { footer, header, logo: defaultLogo } = portalConfig.value

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

<i18n lang="yaml">
  en:
    contactUs: 'Contact Us'
    socialMedia: 'Find us on social media'

  fr:
    contactUs: 'Contactez-nous'
    socialMedia: 'Retrouvez-nous sur les réseaux sociaux'
</i18n>
