<template>
  <v-container>
    <v-row
      v-if="config.footerSocial || config.footerLogo"
      class="mx-0 my-2 text-center"
      justify="center"
      align="center"
    >
      <layout-header-logo v-if="config.footerLogo" float="none" />
      <v-col
        v-if="config.footerSocial && (config.twitter || config.facebook || config.linkedin || config.youtube || config.instagram)"
        :class="{'pa-0': true, 'white--text': footerColorDark}"
      >
        <client-only>
          <h5 v-if="!config.footerLogo || windowWidth>600">
            Retrouvez-nous sur les réseaux sociaux
          </h5>
        </client-only>
        <social-links />
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
    <v-row v-if="config.footerLinksMode === 'columns' || !config.footerLinksMode" class="mx-0 my-2">
      <v-col
        v-for="link in config.footerLinks"
        :key="link.title"
        cols="10"
        sm="4"
        offset="2"
        offset-sm="2"
        class="pa-0"
      >
        <template v-if="link.type === 'internal'">
          <nuxt-link v-if="link.page" :to="{name: 'pages-id', params: {id: link.page.id}}">
            {{ link.page.title }}
          </nuxt-link>
        </template>
        <a v-else :href="link.href">{{ link.title }}</a>
      </v-col>
    </v-row>
    <v-row v-if="config.footerLinksMode === 'lines'" class="ma-0 text-center">
      <v-col class="py-0">
        <template
          v-for="(link, i) in config.footerLinks"
        >
          <nuxt-link
            v-if="link.type === 'internal' && link.page"
            :key="`internal-${i}`"
            :to="{name: 'pages-id', params: {id: link.page.id}}"
            class="mx-3"
          >
            {{ link.page.title }}
          </nuxt-link>
          <a
            v-if="link.type !== 'internal'"
            :key="`external-${i}`"
            :href="link.href"
            class="mx-3"
          >{{ link.title }}</a>
        </template>
      </v-col>
    </v-row>
    <v-row v-if="config.footerImportantLinks && config.footerImportantLinks.length" class="ma-0 text-center">
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
      ...mapState(['config', 'env']),
      ...mapGetters(['footerColorDark']),
      extraLogos() {
        const logos = [...this.config.footerExtraLogos || []]
        const copyright = { ...process.env.copyright }
        if (this.footerColorDark) {
          copyright.src = copyright.src.dark
        } else {
          copyright.src = copyright.src.light
        }
        if (this.config.footerCopyrightAsLogo) logos.push(copyright)
        return logos
      },
    },
  }
</script>

<style>

</style>
