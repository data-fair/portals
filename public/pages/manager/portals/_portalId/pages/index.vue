<template>
  <v-container v-scroll="onScroll" fluid>
    <v-breadcrumbs :items="breadcrumbItems" large />
    <section-title text="Gestion des pages de contenu" />
    <create-page-menu @created="createPage" />
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
            <h3 class="title grey--text text--darken-2 font-weight-bold" style="height:40px;line-height: 1.1;">
              {{ page.title }}
            </h3>
          </v-card-title>

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
          <v-subheader>Mis à jour le {{ page.updated.date | moment("DD/MM/YYYY") }} par {{ page.updated.name }}</v-subheader>
          <v-card-actions class="py-0">
            <v-spacer />
            <!-- <table-preview :page="page" :color="'primary'" /> -->
            <v-btn
              icon
              text
              :to="{ name: 'manager-portals-portalId-pages-id-edit', params: { id: page.id } }"
            >
              <v-icon color="primary">
                mdi-pencil
              </v-icon>
            </v-btn>
            <remove-confirm :label="page.title" @removed="removePage(page.id)" />
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
        <div v-else style="height: 40px;" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer.contentWindow'
  import CreatePageMenu from '~/components/create-page-menu.vue'
  import RemoveConfirm from '~/components/remove-confirm.vue'
  import { mapState } from 'vuex'

  export default {
    components: { CreatePageMenu, RemoveConfirm },
    data: () => ({
      page: 1,
      pages: null,
      loading: false,
    }),
    computed: {
      ...mapState(['portal']),
      breadcrumbItems() {
        return [
          { text: 'Mes portails', to: { name: 'manager-portals' }, disabled: false, exact: true },
          { text: this.portal.title, to: { name: 'manager-portals-portalId', params: { portalId: this.portal._id } }, disabled: false, exact: true },
          { text: 'Pages', disabled: true },
        ]
      },
    },
    mounted: async function () {
      this.refresh(true)
    },
    methods: {
      async refresh(reset) {
        this.loading = true
        if (reset) this.page = 1
        const params = { size: 12, page: this.page }
        const pages = await this.$axios.$get(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages`, { params })
        if (reset) this.pages = pages
        else pages.results.forEach(r => this.pages.results.push(r))
        this.loading = false
      },
      onScroll(e) {
        if (!this.pages) return
        const se = e.target.scrollingElement
        if (se.clientHeight + se.scrollTop > se.scrollHeight - 140 && this.pages.results.length < this.pages.count) {
          this.page += 1
          this.refresh()
        }
      },
      async createPage (page) {
        try {
          const response = await this.$axios.$post(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages`, page)
          this.$router.push({ name: 'manager-portals-portalId-pages-id-edit', params: { id: response.id, portalId: this.portal._id } })
        } catch (error) {
          console.error(error)
        }
      },
      async removePage (id) {
        try {
          await this.$axios.$delete(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/${id}`)
          this.refresh(true)
        } catch (error) {
          console.error(error)
        }
      },
    },
  }
</script>
