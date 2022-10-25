<template>
  <v-row>
    <v-col :style="$vuetify.breakpoint.lgAndUp ? 'padding-right:256px;' : ''">
      <v-container v-scroll="onScroll">
        <client-only>
          <v-iframe :src="notifSubscribeUrl" />
        </client-only>
        <section-title text="Gérer les réutilisations" />
        <v-switch
          v-model="published"
          label="réutilisations publiées"
          @change="refresh()"
        />
        <v-row v-if="uses">
          <v-col
            v-for="(use, i) in uses.results"
            :key="i"
            md="4"
            sm="6"
            cols="12"
          >
            <use-card :use="use">
              <template #actions>
                <v-btn
                  :disabled="!use.published"
                  icon
                  text
                  nuxt
                  title="ouvrir dans le portail"
                  target="_blank"
                  :href="useLink(use)"
                >
                  <v-icon color="primary">
                    mdi-open-in-new
                  </v-icon>
                </v-btn>
                <v-btn
                  icon
                  title="éditer"
                  :to="`/manager/portals/${portal._id}/uses/${use._id}/edit`"
                >
                  <v-icon color="primary">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <remove-confirm
                  @removed="deleteUse(use)"
                />
              </template>
            </use-card>
          </v-col>
        </v-row>
        <v-row
          class="pt-5 pb-0"
          align="center"
        >
          <v-col class="text-center pa-0">
            <v-progress-circular
              v-if="loading"
              :size="40"
              :width="5"
              :color="'primary'"
              indeterminate
            />
            <div
              v-else
              style="height: 40px;"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="uses && uses.results.length < uses.count && !loading"
          class="pt-5 pb-0"
          align="center"
        >
          <v-col class="text-center pa-0">
            <v-btn
              text
              @click="refresh(true)"
            >
              voir plus
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
    <layout-navigation-right v-if="$vuetify.breakpoint.lgAndUp">
      <v-list
        dense
        class="list-actions mr-2"
      >
        <use-create-menu @created="createUse" />
      </v-list>
    </layout-navigation-right>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'

export default {
  components: { VIframe },
  layout: 'manager',
  data: () => ({
    page: 1,
    uses: null,
    loading: false,
    published: false
  }),
  computed: {
    ...mapState(['portal']),
    ...mapGetters(['dataFairUrl', 'notifyUrl']),
    notifSubscribeUrl () {
      const keysParam = [`portals:use-submitted:${this.portal._id}`]
      const titlesParam = [`Un contributeur demande de publier une réutilisation sur ${this.portal.title || this.portal._id}`]
      const urlTemplate = [`${this.dataFairUrl}/extra/portals?p=.%2F${this.portal._id}%2Fuses%2F{id}%2Fedit`]
      return `${this.notifyUrl}/embed/subscribe?key=${encodeURIComponent(keysParam)}&title=${encodeURIComponent(titlesParam)}&url-template=${encodeURIComponent(urlTemplate)}&register=false`
    }
  },
  mounted: async function () {
    this.$store.dispatch('setBreadcrumbs', [{
      text: 'portails',
      to: '/manager/portals',
      disabled: false
    }, {
      text: this.portal.title,
      to: `/manager/portals/${this.portal._id}`
    }, {
      text: 'uses'
    }])
    this.refresh()
  },
  methods: {
    async refresh (append) {
      this.loading = true
      if (append) this.page += 1
      else this.page = 1
      const params = { size: 2, page: this.page, published: this.published }
      const uses = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, { params })
      if (append) uses.results.forEach(r => this.uses.results.push(r))
      else this.uses = uses
      this.loading = false

      // if the page is too large for the user to trigger a scroll we append results immediately
      if (process.client) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.continueFetch()
      }
    },
    continueFetch () {
      const html = document.getElementsByTagName('html')
      if (html[0].clientHeight >= (html[0].scrollHeight - 300) && this.uses.results.length < this.uses.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.uses || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.uses.results.length < this.uses.count) {
        this.refresh(true)
      }
    },
    async createUse (use) {
      use.owner = this.portal.owner
      try {
        const response = await this.$axios.$post(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, use)
        await this.$axios.$post(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${response._id}/_submit`)
        this.$router.push({ name: 'manager-portals-portalId-uses-id-edit', params: { id: response._id, portalId: this.portal._id } })
      } catch (error) {
        console.error(error)
      }
    },
    async removeUse (id) {
      try {
        await this.$axios.$delete(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses/${id}`)
        this.refresh()
      } catch (error) {
        console.error(error)
      }
    },
    useLink (use) {
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'uses/' + use.slug
      return url.href
    }
  }
}
</script>
