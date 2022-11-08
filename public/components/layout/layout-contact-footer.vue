<template>
  <v-footer
    :class="'pa-0 mt-5 ' + (contactFooterColorDark ? 'area--dark' : 'area--light')"
    height="auto"
  >
    <v-card
      :color="contactFooterColor"
      tile
      width="100%"
    >
      <v-container>
        <v-row
          class="mx-0 my-2"
          justify="center"
          align="center"
          :class="{'pa-0': true, 'white--text': contactFooterColorDark}"
        >
          <v-col>
            <template v-if="config.contactPhone">
              <p class="title mb-2">
                <v-icon
                  style="margin-top:-2px"
                  :color="contactFooterColorDark ? 'white' : 'default'"
                >
                  mdi-phone
                </v-icon>&nbsp;<a :href="'tel:' + config.contactPhone">{{ config.contactPhoneLabel }} {{ config.contactPhone }}</a>
              </p>
            </template>
            <template v-if="config.contactWebsite">
              <p class="title mb-2">
                <v-icon
                  style="margin-top:-2px"
                  :color="contactFooterColorDark ? 'white' : 'default'"
                >
                  mdi-web
                </v-icon>&nbsp;<a :href="config.contactWebsite">{{ config.contactWebsiteLabel || config.contactWebsite }}</a>
              </p>
            </template>
            <template v-if="config.contactEmail">
              <p class="title mb-2">
                <v-icon :color="contactFooterColorDark ? 'white' : 'default'">
                  mdi-email-outline
                </v-icon>&nbsp;<nuxt-link to="/contact">
                  contactez-nous
                </nuxt-link>
              </p>
            </template>
          </v-col>
          <v-col>
            <div v-html="config.contactInfos" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-footer>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  computed: {
    ...mapState(['config']),
    ...mapGetters(['contactFooterColor', 'contactFooterColorDark'])
  }
}
</script>

<style>

</style>
