<template>
  <v-menu
    v-model="menu"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    scrollable
    :close-on-click="false"
    :close-on-content-click="false"
    min-width="700px"
    max-width="700px"
  >
    <template #activator="{on, attrs}">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon color="primary">
            mdi-plus-circle
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>Créer une nouvelle page</v-list-item-title>
      </v-list-item>
    </template>

    <v-card
      v-if="menu"
      data-iframe-height
    >
      <v-card-title class="title">
        Créer une nouvelle page
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-select
            v-if="departments && departments.length > 1"
            v-model="editItem.department"
            :items="departments"
            dense
            clearable
            item-text="name"
            item-value="id"
            label="Département gestionnaire de la page"
          />
          <slot
            name="form"
            :valid="valid"
            :model="editItem"
          >
            <lazy-v-jsf
              v-if="editItem"
              v-model="editItem"
              :schema="schema"
              :options="{hideReadOnly: true, context: {}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}"
            />
          </slot>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click.native="menu = false"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          @click.native="confirm"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>

const { mapGetters, mapState } = require('vuex')
const schema = require('../../contract/page.json')

export default {
  data: () => ({
    menu: false,
    valid: false,
    editItem: { department: null },
    owners: null
  }),
  computed: {
    ...mapState(['portal']),
    ...mapGetters(['directoryUrl']),
    ...mapGetters('session', ['activeAccount']),
    schema () {
      const s = JSON.parse(JSON.stringify(schema))
      delete s.properties.publishedAt
      delete s.properties.published
      delete s.properties.public
      s.properties.template['x-cols'].lg = 4
      s.properties.width['x-cols'].lg = 4
      s.properties.navigation['x-cols'].lg = 4
      return s
    }
  },
  watch: {
    menu () {
      if (!this.menu) {
        this.editItem = { department: null }
      }
    }
  },
  async mounted () {
    if (!this.portal.owner.department && this.activeAccount.type === 'organization' && !this.activeAccount.department) {
      const org = await this.$axios.$get(`${this.directoryUrl}/api/organizations/${this.activeAccount.id}`)
      this.departments = org.departments || []
    }
  },
  methods: {
    confirm () {
      if (this.$refs.form.validate()) {
        const page = { ...this.editItem }
        if (!page.department) delete page.department
        this.$emit('created', page)
        this.menu = false
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
