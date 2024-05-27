<template>
  <v-row data-iframe-height>
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
          <template v-if="portals && portals.length">
            <v-row
              v-for="owner in portalsByOwner.owners"
              :key="owner.key"
              class="mt-6"
            >
              <v-col>
                <h2 class="text-h5 mb-2">
                  {{ owner.fullName }}
                </h2>
                <v-card
                  width="500"
                  tile
                  outlined
                >
                  <v-list class="py-0">
                    <template v-for="portal in portalsByOwner.portals[owner.key]">
                      <v-list-item :key="portal._id">
                        <v-list-item-content>
                          <v-list-item-title>
                            <a
                              :href="portal.link"
                              target="_blank"
                            >{{ portal.title }}</a>
                          </v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-action v-if="owner.canAdmin">
                          <v-btn
                            :to="{name: 'manager-portals-portalId', params: {portalId: portal._id}}"
                            nuxt
                            icon
                            color="primary"
                            title="gérer le portail"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </v-list-item-action>
                        <v-list-item-action>
                          <v-btn
                            :to="{name: 'manager-portals-portalId-pages', params: {portalId: portal._id}}"
                            nuxt
                            icon
                            color="primary"
                            title="éditer les pages de contenu"
                          >
                            <v-icon>mdi-text-box-edit</v-icon>
                          </v-btn>
                        </v-list-item-action>
                        <v-list-item-action v-if="owner.canAdmin">
                          <v-btn
                            :to="{name: 'manager-portals-portalId-uses', params: {portalId: portal._id}}"
                            nuxt
                            icon
                            color="primary"
                            title="gérer les réutilisations"
                          >
                            <v-icon
                              color="primary"
                              style="position:relative;top:-4px;"
                            >
                              mdi-share
                            </v-icon>
                            <v-icon
                              color="primary"
                              size="16"
                              style="position:absolute;bottom:-3px;right:-3px;"
                            >
                              mdi-pencil
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                        <v-list-item-action v-if="owner.canAdmin">
                          <remove-confirm
                            :label="portal.title"
                            @removed="deletePortal(portal)"
                          />
                        </v-list-item-action>
                      </v-list-item>
                      <v-divider :key="portal._id + '-divider'" />
                    </template>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-col>
      </v-container>
    </v-col>
    <layout-navigation-right v-if="$vuetify.breakpoint.mdAndUp">
      <v-list
        dense
        class="list-actions mr-2"
      >
        <v-menu
          v-model="showCreateMenu"
          :close-on-content-click="false"
          max-width="500px"
          min-width="500px"
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
          <v-card
            v-if="newPortal"
            data-iframe-height
          >
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
              <v-select
                v-if="owners && owners.length > 1"
                v-model="newPortal.owner"
                :items="owners"
                return-object
                dense
                item-text="label"
                label="Propriétaire du portail"
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
    showDeleteDialog: false,
    owners: null
  }),
  computed: {
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters(['directoryUrl']),
    ...mapGetters('session', ['activeAccount']),
    portalsByOwner () {
      if (!this.portals) return
      const portalsByOwner = { portals: {}, owners: [] }
      if (this.activeAccount.department) {
        if (this.portals.some(p => p.owner.department === this.activeAccount.department)) {
          portalsByOwner.owners.push({
            ...this.activeAccount,
            key: `${this.activeAccount.type}/${this.activeAccount.id}/${this.activeAccount.department}`,
            fullName: `${this.activeAccount.name} / ${this.activeAccount.departmentName || this.activeAccount.department}`,
            canAdmin: true
          })
        }
      } else {
        if (this.portals.some(p => !p.department)) {
          portalsByOwner.owners.push({
            ...this.activeAccount,
            key: `${this.activeAccount.type}/${this.activeAccount.id}`,
            fullName: this.activeAccount.name,
            canAdmin: true
          })
        }
      }
      for (const portal of this.portals) {
        const key = `${portal.owner.type}/${portal.owner.id}${portal.owner.department ? `/${portal.owner.department}` : ''}`
        if (!portalsByOwner.portals[key]) portalsByOwner.portals[key] = []
        portalsByOwner.portals[key].push(portal)
        if (!portalsByOwner.owners.find(o => o.key === key)) {
          portalsByOwner.owners.push({
            ...portal.owner,
            key,
            fullName: `${portal.owner.name}${portal.owner.department ? ` / ${portal.owner.departmentName || portal.owner.department}` : ''}`
          })
        }
      }
      return portalsByOwner
    }
  },
  watch: {
    showCreateMenu () {
      if (this.showCreateMenu) {
        const newPortal = { title: '' }
        if (this.owners) {
          newPortal.owner = this.owners[0]
        }
        this.newPortal = newPortal
      }
    }
  },
  async mounted () {
    await this.refresh()
    if (this.activeAccount.type === 'organization' && !this.activeAccount.department) {
      this.owners = [{ type: this.activeAccount.type, id: this.activeAccount.id, name: this.activeAccount.name, label: this.activeAccount.name }]
      const org = await this.$axios.$get(`${this.directoryUrl}/api/organizations/${this.activeAccount.id}`)
      for (const dep of (org.departments || [])) {
        this.owners.push({
          type: 'organization',
          id: this.activeAccount.id,
          name: this.activeAccount.name,
          department: dep.id,
          label: `${this.activeAccount.name} / ${dep.name || dep.id}`
        })
      }
    }
  },
  methods: {
    ...mapActions('session', ['login']),
    async refresh () {
      this.portals = await this.$axios.$get('api/v1/portals')
      this.$store.dispatch('setManagerBreadcrumbs', [{
        text: `${this.portals.length} portail${this.portals.length > 1 ? 's' : ''}`
      }])
    },
    async deletePortal (portal) {
      await this.$axios.$delete(`api/v1/portals/${portal._id}`)
      this.refresh()
    },
    async createPortal () {
      const newPortal = JSON.parse(JSON.stringify(this.newPortal))
      if (newPortal.owner) {
        if ((this.user.organization && this.user.organization.department) || this.owners.length < 2) delete newPortal.owner
        else delete newPortal.owner.label
      }
      try {
        await this.$axios.$post('api/v1/portals', newPortal)
        eventBus.$emit('notification', { type: 'success', msg: 'Portail créé' })
      } catch (error) {
        eventBus.$emit('notification', { error, msg: 'Impossible de créer le portail' })
      }
      this.refresh()
    }
  }
}
</script>
