<template>
  <v-container fluid>
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
      <v-row>
        <v-btn color="primary" @click="newPortal = {title: ''}; showCreateDialog = true;">
          Créer un nouveau portail
        </v-btn>
      </v-row>
      <v-row class="mt-2">
        <v-card v-if="portals && portals.length" min-width="500">
          <v-list>
            <v-list-item v-for="portal in portals" :key="portal._id">
              <v-list-item-content>
                <v-list-item-title>
                  <a :href="portal.link">{{ portal.title }}</a>
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  icon
                  color="warning"
                  @click="currentPortal = portal; showDeleteDialog = true;"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  :to="`/manager/portals/${portal._id}`"
                  icon
                  color="primary"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-row>
    </v-col>

    <v-dialog v-model="showCreateDialog" max-width="500px">
      <v-card v-if="newPortal">
        <v-card-title primary-title>
          <h3 class="headline mb-0">
            Créer un nouveau portail
          </h3>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="newPortal.title"
              name="title"
              label="Titre"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showCreateDialog = false">
            Annuler
          </v-btn>
          <v-btn
            :disabled="!newPortal.title"
            color="primary"
            @click="createPortal(); showCreateDialog = false"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card v-if="currentPortal">
        <v-card-title primary-title>
          <h3 class="headline mb-0">
            Suppression de {{ currentPortal.title }}
          </h3>
        </v-card-title>
        <v-card-text>
          <v-alert :value="true" type="warning">
            Voulez vous vraiment supprimer ce portail ?
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDeleteDialog = false">
            Annuler
          </v-btn>
          <v-btn color="warning" @click="deletePortal(currentPortal); showDeleteDialog = false">
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import eventBus from '~/event-bus'
  const { mapState, mapActions, mapGetters } = require('vuex')

  export default {
    layout: 'manager',
    data: () => ({
      showCreateDialog: false,
      newPortal: null,
      portals: null,
      currentPortal: null,
      showDeleteDialog: false,
    }),
    computed: {
      ...mapState('session', ['user', 'initialized']),
      ...mapState(['env']),
      ...mapGetters('session', ['activeAccount']),
    },
    watch: {},
    async created() {
      if (!this.activeAccount) return
      this.refresh()
    },
    methods: {
      ...mapActions('session', ['login']),
      async refresh() {
        this.portals = await this.$axios.$get('api/v1/portals', { params: { owner: this.activeAccount.type + ':' + this.activeAccount.id } })
      },
      async deletePortal(portal) {
        await this.$axios.$delete(`api/v1/portals/${portal._id}`)
        this.refresh()
      },
      async createPortal() {
        try {
          await this.$axios.$post('api/v1/portals', this.newPortal)
          eventBus.$emit('notification', { type: 'success', msg: 'Portail créé' })
        } catch (error) {
          eventBus.$emit('notification', { error, msg: 'Impossible de créer le portail' })
        }
        this.refresh()
      },
    },
  }
</script>
