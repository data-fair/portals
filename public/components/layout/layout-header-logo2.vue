<template>
  <div style="float: right;">
    <a
      v-if="config.headerLogo2Link"
      :href="config.headerLogo2Link"
      target="blank"
    >
      <img
        :src="config.headerLogo2"
        contain
        style="height:80px;"
      >
    </a>
    <img
      v-else
      :src="config.headerLogo2"
      contain
      style="height:80px;"
    >
  </div>
</template>

<script>
  export default {
    props: ['config'],
  }
</script>

<style>

</style>
