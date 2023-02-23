<template>
  <v-row>
    <v-col :style="$vuetify.breakpoint.lgAndUp ? 'padding-right:256px;' : ''">
      <v-container v-scroll="onScroll">
        <section-title
          text="Éditer les pages de contenu"
          tag="h1"
        />
        <v-row>
          <v-col
            cols="12"
            md="6"
            lg="4"
          >
            <v-select
              v-model="filters.template"
              label="Modèle de page"
              outlined
              dense
              :items="pageSchema.properties.template.oneOf"
              item-text="title"
              item-value="const"
              clearable
              hide-details
              :menu-props="{offsetY: true}"
              @change="refresh()"
            />
          </v-col>
        </v-row>
        <v-row v-if="pages">
          <v-col
            v-for="(page, i) in pages.results"
            :key="i"
            md="4"
            sm="6"
            cols="12"
          >
            <v-card outlined>
              <v-card-title>
                <h3
                  class="title grey--text text--darken-3 font-weight-bold"
                  style="height:40px;line-height: 1.1;"
                >
                  {{ page.title }}
                </h3>
              </v-card-title>
              <v-row
                class="pl-7"
                style="height:35px;"
              >
                <span class="text-caption">

                  {{ templateNames[page.template] }}

                </span>
              </v-row>
              <v-row style="min-height:25px;">
                <v-col class="py-0">
                  <v-chip
                    v-for="topic of page.topics"
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
              <v-subheader>Mis à jour le {{ page.updated.date | date('LL') }} par {{ page.updated.name }}</v-subheader>
              <v-card-actions class="py-0">
                <v-icon
                  :color="page.public ? 'primary' : 'accent'"
                  :small="small"
                  :title="page.public ? 'Public' : 'Privé'"
                >
                  {{ page.public ? 'mdi-lock-open' : 'mdi-lock' }}
                </v-icon>
                <v-spacer />
                <v-btn
                  icon
                  text
                  nuxt
                  title="ouvrir dans le portail"
                  target="_blank"
                  :href="pageLink(page)"
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
                  :to="{ name: 'manager-portals-portalId-pages-id-edit', params: { id: page.id } }"
                >
                  <v-icon color="primary">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <remove-confirm
                  :label="page.title"
                  @removed="removePage(page.id)"
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
        <v-row
          v-if="pages && pages.results.length < pages.count && !loading"
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
    <layout-navigation-right v-if="$vuetify.breakpoint.mdAndUp">
      <v-list
        dense
        class="list-actions mr-2"
      >
        <create-page-menu @created="createPage" />
      </v-list>
    </layout-navigation-right>
  </v-row>
</template>

<script>
import CreatePageMenu from '~/components/create-page-menu.vue'
import RemoveConfirm from '~/components/remove-confirm.vue'
import { mapState } from 'vuex'
const pageSchema = require('~/../contract/page.json')

export default {
  components: { CreatePageMenu, RemoveConfirm },
  data: () => ({
    pagination: 1,
    pages: null,
    loading: false,
    pageSchema,
    filters: {
      template: null
    }
  }),
  computed: {
    ...mapState(['portal']),
    templateNames () {
      return this.pageSchema.properties.template.oneOf.reduce((a, item) => { a[item.const] = item.title; return a }, {})
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
      text: 'pages'
    }])
    this.refresh()
  },
  methods: {
    async refresh (append) {
      this.loading = true
      if (append) this.pagination += 1
      else this.pagination = 1
      const params = { size: 12, page: this.pagination, sort: 'created.date:-1' }
      if (this.filters.template) params.template = this.filters.template
      const pages = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages`, { params })
      if (append) pages.results.forEach(r => this.pages.results.push(r))
      else this.pages = pages
      this.loading = false

      // if the page is too large for the user to trigger a scroll we append results immediately
      if (process.client) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.continueFetch()
      }
    },
    continueFetch () {
      const html = document.getElementsByTagName('html')
      if (html[0].clientHeight >= (html[0].scrollHeight - 300) && this.pages.results.length < this.pages.count) {
        this.refresh(true)
      }
    },
    onScroll (e) {
      if (!this.pages || this.loading) return
      const se = e.target.scrollingElement
      if (se.clientHeight + se.scrollTop > se.scrollHeight - 300 && this.pages.results.length < this.pages.count) {
        this.pagination += 1
        this.refresh(true)
      }
    },
    async createPage (page) {
      try {
        const response = await this.$axios.$post(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages`, page)
        this.$router.push({ name: 'manager-portals-portalId-pages-id-edit', params: { id: response.id, portalId: this.portal._id } })
      } catch (error) {
        console.error(error)
      }
    },
    async removePage (id) {
      try {
        await this.$axios.$delete(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${id}`)
        this.refresh()
      } catch (error) {
        console.error(error)
      }
    },
    pageLink (page) {
      const url = new URL(this.portal.link)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      url.pathname += 'pages/' + page.id
      return url.href
    }
  }
}
</script>
