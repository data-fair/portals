<template>
  <v-row>
    <v-col :style="$vuetify.breakpoint.lgAndUp ? 'padding-right:256px;' : ''">
      <v-container v-scroll="onScroll">
        <section-title text="Gérer les réutilisations" />
        <v-switch
          v-model="published"
          label="publié"
          @change="refresh(true)"
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
                  :disabled="!!editItem"
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
import RemoveConfirm from '~/components/remove-confirm.vue'
import { mapState } from 'vuex'

export default {
  components: { RemoveConfirm },
  layout: 'manager',
  data: () => ({
    pagination: 1,
    uses: null,
    loading: false,
    published: false
  }),
  computed: {
    ...mapState(['portal'])
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
    this.refresh(true)
  },
  methods: {
    async refresh (reset) {
      this.loading = true
      if (reset) this.pagination = 1
      const params = { size: 12, page: this.pagination, published: this.published }
      const uses = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, { params })
      if (reset) this.uses = uses
      else uses.results.forEach(r => this.uses.results.push(r))
      this.loading = false
    },
    onScroll (e) {
      if (!this.uses) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 140 && this.uses.results.length < this.uses.count) {
        this.pagination += 1
        this.refresh()
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
        this.refresh(true)
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
