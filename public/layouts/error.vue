<template>
  <div class="container">
    <v-alert type="error">
      {{ error.message }}
    </v-alert>
  </div>
</template>

<script>
  export default {
    props: ['error'],
    layout: 'empty',
    mounted() {
      if (this.error.statusCode === 401) this.$store.dispatch('session/login')
    },
  }
</script>
