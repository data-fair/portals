<template lang="html">
  <v-container data-iframe-height>
    <h1 class="hide-element">
      Contact
    </h1>
    <v-row>
      <v-col>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="message.from"
            :rules="[v => !!v || '']"
            :disabled="!!tokenError"
            label="Votre adresse email"
            name="email"
            required
            outlined
            dense
          />
          <v-text-field
            v-model="message.subject"
            :rules="[v => !!v || '']"
            :disabled="!!tokenError"
            label="Sujet"
            name="subject"
            required
            outlined
            dense
          />
          <v-textarea
            v-model="message.text"
            :rules="[v => !!v || '']"
            :disabled="!!tokenError"
            label="Votre demande"
            name="text"
            outlined
            required
          />
          <v-row class="mx-0 mb-0">
            <v-spacer />
            <v-hover v-slot="{hover}">
              <v-btn
                :disabled="!valid || loading"
                color="primary"
                :outlined="hover && hoverInverse"
                :elevation="elevation"
                @click="send"
              >
                Envoyer
              </v-btn>
            </v-hover>
            <v-spacer />
          </v-row>
        </v-form>
        <v-sheet
          v-if="config.contactNote && config.contactNote.length"
          color="grey lighten-3"
          class="pa-3 mt-6 text-body-2"
          v-html="config.contactNote"
        />
      </v-col>
      <v-col
        v-if="config.contactInfos && config.contactInfos.length"
        :cols="12"
        :sm="5"
        :md="4"
        :lg="3"
      >
        <v-card
          v-bind="infoCardProps"
          class="pa-3"
        >
          <div v-html="config.contactInfos" />
          <template v-if="config.contactPhone">
            <v-divider />
            <span>
              <v-icon style="margin-top:-4px">
                mdi-phone
              </v-icon><a
                :href="'tel:' + config.contactPhone"
                aria-label="Contactez nous par téléphone"
              >{{
                config.contactPhoneLabel }} {{ config.contactPhone }}</a>
            </span>
          </template>
          <template v-if="config.contactWebsite">
            <v-divider />
            <span>
              <v-icon style="margin-top:-4px">
                mdi-web
              </v-icon><a
                :href="config.contactWebsite"
                aria-label="Retrouvez nous sur ce site"
              >{{
                config.contactWebsiteLabel || config.contactWebsite }}</a>
            </span>
          </template>
          <template v-if="hasSocialLinks">
            <v-divider />
            <span class="text-caption">
              Retrouvez-nous sur les réseaux sociaux
            </span>
            <social-links />
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import eventBus from '../event-bus'
const { mapState, mapGetters } = require('vuex')

const newMessage = { from: '', subject: '', text: '' }
export default {
  middleware: 'portal-required',
  data: () => ({
    valid: true,
    message: { ...newMessage },
    token: null,
    tokenError: null,
    loading: false
  }),
  computed: {
    ...mapState(['config', 'portal', 'draft']),
    ...mapGetters(['primaryColorDark', 'hasSocialLinks', 'elevation', 'hoverInverse', 'infoCardProps'])
  },
  async mounted () {
    try {
      this.token = await this.$axios.$get(`${this.$store.getters.directoryUrl}/api/auth/anonymous-action`)
    } catch (error) {
      this.tokenError = error
      eventBus.$emit('notification', { error })
    }
  },
  methods: {
    async send () {
      if (!this.$refs.form.validate()) return
      this.loading = true
      try {
        await this.$axios.$post(`${this.$store.state.publicUrl}/api/v1/portals/${this.portal._id}/contact-email?draft=${this.draft}`, { ...this.message, token: this.token })
        this.message = { ...newMessage }
        this.$refs.form.resetValidation()
        eventBus.$emit('notification', { type: 'success', msg: 'Votre demande a été envoyée' })
      } catch (error) {
        eventBus.$emit('notification', { error })
      }
      this.loading = false
    }
  }
}
</script>

<style lang="css">
hr{
  display: block;
  flex: 1 1 0px;
  max-width: 100%;
  height: 0px;
  max-height: 0px;
  border: solid;
  border-width: thin 0 0 0;
  transition: inherit;
  border-color: rgba(0, 0, 0, 0.12);
  margin-top:8px;
  margin-bottom:8px;
}

h4 {
  color: #424242 !important;
  caret-color: #424242 !important;
}
</style>
