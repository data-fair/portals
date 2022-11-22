<template>
  <div>
    <action-icon
      v-if="config.twitter"
      :href="'https://twitter.com/' + config.twitter"
      target="_blank"
      title="Compte Twitter"
      icon="mdi-twitter"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />

    <action-icon
      v-if="config.facebook"
      :href="'https://www.facebook.com/' + config.facebook"
      target="_blank"
      title="Compte Facebook"
      icon="mdi-facebook"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />

    <action-icon
      v-if="config.youtube"
      :href="'https://www.youtube.com/' + (config.youtube.includes('/') ? config.youtube : 'user/' + config.youtube)"
      target="_blank"
      title="Chaîne Youtube"
      icon="mdi-youtube"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />

    <action-icon
      v-if="config.vimeo"
      :href="'https://vimeo.com/' + config.vimeo"
      target="_blank"
      title="Chaîne Vimeo"
      icon="mdi-vimeo"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />

    <action-icon
      v-if="config.linkedin"
      :href="'https://www.linkedin.com/company/' + config.linkedin"
      target="_blank"
      title="Compte LinkedIn"
      icon="mdi-linkedin"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />

    <action-icon
      v-if="config.instagram"
      :href="'https://www.instagram.com/' + config.instagram"
      target="_blank"
      title="Compte Instagram"
      icon="mdi-instagram"
      :color="color"
      :dark="dark"
      :tooltip-bottom="tooltipBottom"
    />
  </div>
</template>

<script>
const { mapState } = require('vuex')
export default {
  props: {
    color: { type: String, default: 'primary' },
    dark: { type: Boolean, default: false },
    tooltipBottom: { type: Boolean, default: false }
  },
  computed: {
    ...mapState(['config'])
  }
}
</script>

<style>

</style>
