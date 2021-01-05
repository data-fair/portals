<template>
  <!-- a little bit of dynamic css -->
  <!-- cf https://stackoverflow.com/a/57331310 -->
  <component :is="'style'">
    a {
    color: {{ linkColor }};
    }

    .area--dark a, .area--dark h3, .area--dark span {
    color: white;
    }

    .area--light a, .area--light h3, .area--light span {
    color: {{ textDark }};
    }

    .primary--text {
    color: {{ linkColor }}!important;
    }
  </component>
</template>

<script>
  const { mapState, mapGetters } = require('vuex')

  export default {
    computed: {
      ...mapState(['textDark']),
      ...mapGetters(['linkColor']),
    },
  }
</script>

<style lang="css" scoped>
</style>
