<template>
  <!-- <layout-footer-contact v-if="portalConfig.footer.showContactInformations" /> -->
  <v-footer
    :color="portalConfig.footer.color"
    :style="portalConfig.footer.backgroundImage ? {
      backgroundImage: `url(${getImageSrc(portalConfig.footer.backgroundImage, false)})`,
      backgroundPosition: `bottom ${portalConfig.footer.backgroundImageLocation}`,
      backgroundRepeat: portalConfig.footer.backgroundImageLocation === 'repeat' ? 'repeat' : 'no-repeat'
    } : {}"
    :class="[
      'pa-0 d-flex justify-center flex-wrap flex-grow-0',
      portalConfig.footer.color === 'background' ? 'border-t' : undefined
    ]"
  >
    <v-container>
      <!-- Main content with optional left column -->
      <v-row>
        <!-- Left column (1/3) -->
        <v-col
          v-if="hasLeftColumn"
          cols="12"
          md="4"
        >
          <!-- Logo in left column -->
          <div
            v-if="logo && portalConfig.footer.logoPosition === 'left'"
            :class="getAlignmentClass(portalConfig.footer.logoAlignment)"
            class="mb-4"
          >
            <layout-header-logo
              :logo="logo"
              :link="portalConfig.footer.logoPrimaryLink"
              :class="getLogoJustifyClass(portalConfig.footer.logoAlignment)"
            />
          </div>

          <!-- Slogan in left column -->
          <div
            v-if="portalConfig.footer.slogan && portalConfig.footer.sloganPosition === 'left'"
            class="mb-4"
            :class="[
              getAlignmentClass(portalConfig.footer.sloganAlignment),
              portalConfig.footer.sloganColor ? `text-${portalConfig.footer.sloganColor}` : ''
            ]"
          >
            {{ portalConfig.footer.slogan }}
          </div>

          <!-- Social links in left column -->
          <div
            v-if="showSocialLinks && portalConfig.footer.socialPosition === 'left'"
            class="w-100 text-center text-caption"
          >
            <div>{{ t('socialMedia') }}</div>
            <social-links :links="portalConfig.socialLinks" />
          </div>
        </v-col>

        <!-- Main column (2/3 or full width) -->
        <v-col
          cols="12"
          :md="hasLeftColumn ? 8 : 12"
        >
          <!-- Logo in main column -->
          <div
            v-if="logo && portalConfig.footer.logoPosition === 'main'"
            :class="getAlignmentClass(portalConfig.footer.logoAlignment)"
            class="mb-4"
          >
            <layout-header-logo
              :logo="logo"
              :link="portalConfig.footer.logoPrimaryLink"
              :class="getLogoJustifyClass(portalConfig.footer.logoAlignment)"
            />
          </div>

          <!-- Slogan in main column -->
          <div
            v-if="portalConfig.footer.slogan && portalConfig.footer.sloganPosition === 'main'"
            class="mb-4"
            :class="[
              getAlignmentClass(portalConfig.footer.sloganAlignment),
              portalConfig.footer.sloganColor ? `text-${portalConfig.footer.sloganColor}` : ''
            ]"
          >
            {{ portalConfig.footer.slogan }}
          </div>

          <!-- Social links in main column -->
          <div
            v-if="showSocialLinks && portalConfig.footer.socialPosition === 'main'"
            class="mb-4 text-caption"
            :class="getAlignmentClass('center')"
          >
            <div>{{ t('socialMedia') }}</div>
            <social-links :links="portalConfig.socialLinks" />
          </div>

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
                :title="extraLogo.label + ' - ' + t('newWindow')"
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
                :title="t('koumoulWebsite') + ' - ' + t('newWindow')"
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
              <NuxtLink
                :to="resolveLink(link)"
                :target="link.type === 'external' && link.target ? '_blank' : undefined"
                :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
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
              <NuxtLink
                :to="resolveLink(link)"
                :target="link.type === 'external' && link.target ? '_blank' : undefined"
                :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
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
                :title="link.title + ' - ' + t('newWindow')"
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
            :title="t('koumoulWebsite') + ' - ' + t('newWindow')"
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

const showSocialLinks = computed(() => {
  return portalConfig.value.footer.socialPosition !== 'none' &&
    Object.keys(portalConfig.value.socialLinks).length > 0
})

const hasLeftColumn = computed(() => {
  const footer = portalConfig.value.footer
  return (logo.value && footer.logoPosition === 'left') ||
    (footer.slogan && footer.sloganPosition === 'left') ||
    (showSocialLinks.value && footer.socialPosition === 'left')
})

const getAlignmentClass = (alignment?: string) => {
  switch (alignment) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    case 'left': return 'text-left'
    default: return 'text-left'
  }
}

const getLogoJustifyClass = (alignment?: string) => {
  switch (alignment) {
    case 'center': return 'justify-center'
    case 'right': return 'justify-end'
    case 'left': return 'justify-start'
    default: return 'justify-start'
  }
}

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

</script>

<i18n lang="yaml">
  en:
    koumoulWebsite: 'Koumoul website'
    newWindow: 'New window'
    socialMedia: 'Find us on social media'
  fr:
    koumoulWebsite: 'Site web Koumoul'
    newWindow: 'Nouvelle fenêtre'
    socialMedia: 'Retrouvez-nous sur les réseaux sociaux'
</i18n>
