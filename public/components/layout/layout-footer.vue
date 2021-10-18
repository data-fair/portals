<template>
  <v-container>
    <v-row v-if="config.footerSocial && !config.footerLogo" class="ma-0 text-center">
      <social-links-col :dark="footerColorDark" />
    </v-row>
    <v-row
      v-if="config.footerLogo || extraLogos.length"
      class="ma-0 text-center"
      justify="center"
    >
      <v-col
        xl="12"
        md="8"
      >
        <v-row
          v-if="config.footerLogo"
          justify="center"
          class="mx-0 my-2"
        >
          <layout-header-logo float="none" />
          <social-links-col v-if="config.footerSocial" :dark="footerColorDark" />
        </v-row>
        <v-row
          v-if="extraLogos.length"
          justify="center"
          class="mx-0 my-2"
        >
          <a
            v-for="(extraLogo, i) in extraLogos"
            :key="i"
            :title="extraLogo.title"
            :href="extraLogo.href"
          >
            <img
              :src="extraLogo.src"
              :alt="extraLogo.title"
              contain
              style="height:40px; float:left;"
            >
          </a>
        </v-row>
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
          <nuxt-link
            v-if="link.page"
            :to="{name: 'pages-id', params: {id: link.page.id}}"
            style="text-decoration: none;"
          >
            {{ link.page.title }}
          </nuxt-link>
        </template>
        <a
          v-else
          :href="link.href"
          style="text-decoration: none;"
        >{{ link.title }}</a>
      </v-col>
    </v-row>
    <v-row v-if="config.footerLinksMode === 'lines'" class="ma-0 text-center">
      <v-col class="pb-0">
        <template
          v-for="(link, i) in config.footerLinks"
        >
          <nuxt-link
            v-if="link.type === 'internal' && link.page"
            :key="`internal-${i}`"
            :to="{name: 'pages-id', params: {id: link.page.id}}"
            class="mx-3"
            style="text-decoration: none;"
          >
            {{ link.page.title }}
          </nuxt-link>
          <a
            v-if="link.type !== 'internal'"
            :key="`external-${i}`"
            :href="link.href"
            class="mx-3"
            style="text-decoration: none;"
          >{{ link.title }}</a>
        </template>
      </v-col>
    </v-row>
    <v-row v-if="config.footerImportantLinks && config.footerImportantLinks.length" class="ma-0 text-center">
      <v-col>
        <v-divider :dark="footerColorDark" />
        <v-btn
          v-for="(link, i) in config.footerImportantLinks"
          :key="i"
          text
          :nuxt="link.type === 'internal'"
          :href="link.type !== 'internal' && link.href"
          :dark="footerColorDark"
          v-text="link.title"
        />
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
        if (this.config.footerCopyrightAsLogo) logos.push(process.env.copyright)
        return logos
      },
    },
  }
</script>

<style>

</style>
