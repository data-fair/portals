<template>
  <v-container>
    <v-row
      v-if="config.footerSocial || config.footerLogo"
      class="mx-0 my-2 text-center"
      justify="center"
      align="center"
    >
      <layout-header-logo
        v-if="config.footerLogo"
        float="none"
      />
      <v-col
        v-if="config.footerSocial && hasSocialLinks"
        :class="{'pa-0': true, 'white--text': footerColorDark}"
      >
        <client-only>
          <span
            v-if="!config.footerLogo || windowWidth>600"
            class="text-caption"
            style="display:block;"
          >
            Retrouvez-nous sur les réseaux sociaux
          </span>
        </client-only>
        <social-links
          :dark="footerColorDark"
          :color="footerColorDark ? footerColor : 'primary'"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="extraLogos.length"
      align-content="space-between"
      class="mx-0 my-2 text-center"
    >
      <v-col
        v-for="(extraLogo, i) in extraLogos"
        :key="i"
        class="pa-0"
      >
        <a
          :title="extraLogo.title"
          :href="extraLogo.href"
          class="px-2"
        >
          <img
            :src="extraLogo.src"
            :alt="extraLogo.title"
            contain
            style="height:40px;"
          >
        </a>
      </v-col>
    </v-row>
    <v-row
      v-if="config.footerLinksMode === 'columns' || !config.footerLinksMode"
      class="mx-0 my-2"
    >
      <v-col
        v-for="link in footerLinks"
        :key="link.title"
        cols="10"
        sm="4"
        offset="2"
        offset-sm="2"
        class="pa-0"
      >
        <template v-if="link.type === 'internal'">
          <nuxt-link
            v-if="link.page"
            :to="{name: 'pages-id', params: {id: link.page.id}}"
          >
            {{ link.page.title }}
          </nuxt-link>
        </template>
        <nuxt-link
          v-else-if="link.type === 'standard'"
          :to="link.to"
        >
          {{ link.title }}
        </nuxt-link>
        <a
          v-else
          :href="link.href"
        >{{ link.title }}</a>
      </v-col>
    </v-row>
    <v-row
      v-if="config.footerLinksMode === 'lines'"
      class="ma-0 text-center"
    >
      <v-col class="py-0">
        <template
          v-for="(link, i) in footerLinks"
        >
          <template v-if="link.type === 'internal'">
            <nuxt-link
              v-if="link.page"
              :key="`internal-${i}`"
              :to="{name: 'pages-id', params: {id: link.page.id}}"
              class="mx-3"
            >
              {{ link.page.title }}
            </nuxt-link>
          </template>
          <nuxt-link
            v-else-if="link.type === 'standard'"
            :key="`standard-${i}`"
            :to="link.to"
            class="mx-3"
          >
            {{ link.title }}
          </nuxt-link>
          <a
            v-else
            :key="`external-${i}`"
            :href="link.href"
            class="mx-3"
          >{{ link.title }}</a>
        </template>
      </v-col>
    </v-row>
    <v-row
      v-if="config.footerImportantLinks && config.footerImportantLinks.length"
      class="ma-0 text-center"
    >
      <v-col>
        <v-divider :dark="footerColorDark" />
        <template
          v-for="(link, i) in config.footerImportantLinks"
        >
          <v-btn
            v-if="link.type === 'internal' && link.page"
            :key="`impInternal-${i}`"
            text
            nuxt
            :to="{name: 'pages-id', params: {id: link.page.id}}"
            :dark="footerColorDark"
          >
            {{ link.page.title }}
          </v-btn>
          <v-btn
            v-else
            :key="`impExternal-${i}`"
            text
            :href="link.href"
            :dark="footerColorDark"
          >
            {{ link.title }}
          </v-btn>
        </template>
        <v-divider :dark="footerColorDark" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapState(['config']),
    ...mapGetters(['footerColor', 'footerColorDark', 'hasSocialLinks', 'whiteLabel']),
    extraLogos () {
      const logos = [...this.config.footerExtraLogos || []].filter(l => !!l.title && !!l.src)
      const copyright = { ...process.env.copyright }
      if (this.footerColorDark) {
        copyright.src = copyright.src.dark
      } else {
        copyright.src = copyright.src.light
      }
      if (this.config.footerCopyrightAsLogo && !this.whiteLabel) logos.push(copyright)
      return logos
    },
    footerLinks () {
      const links = [...this.config.footerLinks || []]
      if (this.config.footerPrivacyPolicy) links.push({ type: 'standard', title: 'Politique de confidentialité', to: '/privacy-policy' })
      if (this.config.footerSitemap) links.push({ type: 'standard', title: 'Plan du site', to: '/sitemap' })
      return links
    }
  }
}
</script>

<style>

</style>
