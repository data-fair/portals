<template>
  <v-row>
    <v-col :style="$vuetify.breakpoint.lgAndUp ? 'padding-right:256px;' : ''">
      <v-container v-scroll="onScroll">
        <section-title text="Éditer les uses de contenu" />
        <v-row v-if="uses">
          <v-col
            v-for="(use, i) in uses.results"
            :key="i"
            md="4"
            sm="6"
            cols="12"
          >
            <v-card outlined>
              <v-card-title>
                <h3
                  class="title grey--text text--darken-2 font-weight-bold"
                  style="height:40px;line-height: 1.1;"
                >
                  {{ use.title }}
                </h3>
              </v-card-title>

              <v-row style="min-height:25px;">
                <v-col class="py-0">
                  <v-chip
                    v-for="topic of use.topics"
                    :key="topic.id"
                    small
                    outlined
                    :color="topic.color || 'default'"
                    class="ml-2"
                    style="font-weight: bold"
                  >
                    {{ topic.title }}
                  </v-chip>
                </v-col>
              </v-row>
              <v-subheader>Mis à jour le {{ use.updated.date | date('LL') }} par {{ use.updated.name }}</v-subheader>
              <v-card-actions class="py-0">
                <v-spacer />
                <v-btn
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
                  text
                  nuxt
                  title="éditer"
                  :to="{ name: 'manager-portals-portalId-uses-id-edit', params: { id: use.id } }"
                >
                  <v-icon color="primary">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <remove-confirm
                  :label="use.title"
                  @removed="removeUse(use.id)"
                />
              </v-card-actions>
            </v-card>
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
        <create-use-menu @created="createUse" />
      </v-list>
    </layout-navigation-right>
  </v-row>
</template>

<script>
import RemoveConfirm from '~/components/remove-confirm.vue'
import { mapState } from 'vuex'

export default {
  components: { RemoveConfirm },
  data: () => ({
    pagination: 1,
    uses: null,
    loading: false
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
      const params = { size: 12, use: this.pagination }
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
      try {
        const response = await this.$axios.$post(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, use)
        this.$router.push({ name: 'manager-portals-portalId-uses-id-edit', params: { id: response.id, portalId: this.portal._id } })
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
      console.log(this.portal.link)
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'uses/' + use.id
      return url.href
    }
  }
}
</script>
