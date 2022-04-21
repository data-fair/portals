<template>
  <v-row>
    <v-col :style="$vuetify.breakpoint.mdAndUp ? 'padding-right:256px;' : ''">
      <v-container>
        <v-col>
          <v-row>
            <p>
              Pour publier un de vos portails sur une adresse publique veuillez <a href="https://koumoul.com/contact">nous contacter</a>.
            </p>
            <p>
              Cette adresse publique peut-être un sous domaine de koumoul.com (par exemple mon-portail.koumoul.com) ou bien un domaine complètement distinct.
              Dans le second cas vous devez être propriétaire du nom de domaine en question et en capacité de définir ses règles DNS.
            </p>
          </v-row>
          <v-row class="mt-6">
            <v-card
              v-if="portals && portals.length"
              min-width="500"
              tile
              outlined
            >
              <v-list class="py-0">
                <template v-for="portal in portals">
                  <v-list-item :key="portal._id">
                    <v-list-item-content>
                      <v-list-item-title>
                        <a
                          :href="portal.link"
                          target="_blank"
                        >{{ portal.title }}</a>
                      </v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <remove-confirm
                        :label="portal.title"
                        @removed="deletePortal(portal)"
                      />
                    </v-list-item-action>
                    <v-list-item-action>
                      <v-btn
                        :to="{name: 'manager-portals-portalId', params: {portalId: portal._id}}"
                        nuxt
                        icon
                        color="primary"
                      >
                        <v-icon>mdi-cog</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <!-- not really necessary and the icon is confusing
                      <v-list-item-action class="ml-0">
                      <v-btn
                        :to="{name: 'manager-portals-portalId-pages', params: {portalId: portal._id}}"
                        nuxt
                        icon
                        color="primary"
                      >
                        <v-icon>mdi-file-multiple</v-icon>
                      </v-btn>
                    </v-list-item-action>-->
                  </v-list-item>
                  <v-divider :key="portal._id + '-divider'" />
                </template>
              </v-list>
            </v-card>
          </v-row>
        </v-col>
      </v-container>
    </v-col>
    <layout-navigation-right v-if="$vuetify.breakpoint.mdAndUp">
      <v-list
        dense
        class="list-actions"
      >
        <v-menu
          v-model="showCreateMenu"
          :close-on-content-click="false"
          max-width="500px"
        >
          <template #activator="{ on, attrs }">
            <v-list-item
              v-bind="attrs"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon color="primary">
                  mdi-plus-circle
                </v-icon>
              </v-list-item-icon>
              <v-list-item-title>Créer un nouveau portail</v-list-item-title>
            </v-list-item>
          </template>
          <v-card v-if="newPortal">
            <v-card-title primary-title>
              <h3 class="headline mb-0">
                Créer un nouveau portail
              </h3>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="newPortal.title"
                name="title"
                label="Titre"
                @keyup.enter.native="createPortal(); showCreateMenu = false"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                @click="showCreateMenu = false"
              >
                Annuler
              </v-btn>
              <v-btn
                :disabled="!newPortal.title"
                color="primary"
                @click="createPortal(); showCreateMenu = false"
              >
                Enregistrer
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-list>
    </layout-navigation-right>
  </v-row>
</template>

<script>
import eventBus from '~/event-bus'
import RemoveConfirm from '~/components/remove-confirm.vue'
const { mapState, mapActions, mapGetters } = require('vuex')

export default {
  components: { RemoveConfirm },
  layout: 'manager',
  middleware: 'admin-required',
  data: () => ({
    showCreateMenu: false,
    newPortal: null,
    portals: null,
    currentPortal: null,
    showDeleteDialog: false
  }),
  computed: {
    ...mapState('session', ['user', 'initialized']),
    ...mapState(['env']),
    ...mapGetters('session', ['activeAccount'])
  },
  watch: {
    showCreateMenu () {
      if (this.showCreateMenu) {
        this.newPortal = { title: '' }
      }
    }
  },
  async mounted () {
    await this.refresh()
  },
  methods: {
    ...mapActions('session', ['login']),
    async refresh () {
      this.portals = await this.$axios.$get('api/v1/portals', { params: { owner: this.activeAccount.type + ':' + this.activeAccount.id } })
      this.$store.dispatch('setBreadcrumbs', [{
        text: `${this.portals.length} portail${this.portals.length > 1 ? 's' : ''}`
      }])
    },
    async deletePortal (portal) {
      await this.$axios.$delete(`api/v1/portals/${portal._id}`)
      this.refresh()
    },
    async createPortal () {
      try {
        await this.$axios.$post('api/v1/portals', this.newPortal)
        eventBus.$emit('notification', { type: 'success', msg: 'Portail créé' })
      } catch (error) {
        eventBus.$emit('notification', { error, msg: 'Impossible de créer le portail' })
      }
      this.refresh()
    }
  }
}
</script>
