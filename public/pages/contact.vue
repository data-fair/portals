<template lang="html">
  <v-container data-iframe-height>
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
          />
          <v-text-field
            v-model="message.subject"
            :rules="[v => !!v || '']"
            :disabled="!!tokenError"
            label="Sujet"
            name="subject"
            required
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
          <v-row>
            <v-spacer />
            <v-btn
              :disabled="!valid || loading"
              color="primary"
              @click="send"
            >
              Envoyer
            </v-btn>
          </v-row>
        </v-form>
      </v-col>
      <v-col
        v-if="config.contactInfos && config.contactInfos.length"
        :cols="12"
        :sm="5"
        :md="4"
        :lg="3"
      >
        <v-card
          :elevation="0"
          outlined
          class="pa-3"
          style="height:100%"
        >
          <div v-html="marked(config.contactInfos)" />
          <template v-if="config.twitter || config.facebook || config.linkedin || config.youtube">
            <v-divider />
            <h4>
              Retrouvez-nous sur les réseaux sociaux
            </h4>
            <social-links />
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import eventBus from '../event-bus'
  import marked from 'marked'
  const { mapState } = require('vuex')

  const newMessage = { from: '', subject: '', text: '' }
  export default {
    data: () => ({
      valid: true,
      message: { ...newMessage },
      token: null,
      tokenError: null,
      loading: false,
    }),
    computed: {
      ...mapState(['config', 'portal', 'draft']),
    },
    async mounted() {
      try {
        this.token = await this.$axios.$get(`${this.$store.getters.directoryUrl}/api/auth/anonymous-action`)
      } catch (error) {
        this.tokenError = error
        eventBus.$emit('notification', { error })
      }
    },
    methods: {
      async send() {
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
      },
      marked,
    },
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
