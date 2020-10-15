<template lang="html">
  <div id="disqus_thread" />
</template>

<script>
export default {
  props: ['id'],
  mounted() {
    const vm = this
    window.disqus_config = function () {
      this.page.identifier = vm.$route.params.name + '-' + vm.$route.params.id
    }
    const d = document
    const s = d.createElement('script')
    s.src = 'https://koumoul.disqus.com/embed.js'
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s)
  }
}
</script>
