<template lang="html">
  <v-jsf
    :value="value"
    :schema="schema"
    :options="vjsfOptions"
    @input="val => $emit('input', val)"
    @change="$emit('change')"
  >
    <template slot="custom-markdown" slot-scope="{value: val, on, disabled}">
      <markdown-editor
        :value="val"
        :disabled="disabled"
        @input="v => on.input(v)"
        @change="on.change()"
      />
    </template>
  </v-jsf>
</template>

<script>
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import '@koumoul/vjsf/lib/deps/third-party.js'
  import '@koumoul/vjsf/dist/main.css'
  import MarkdownEditor from '~/components/markdown-editor.vue'

  export default {
    components: {
      VJsf,
      MarkdownEditor,
    },
    props: {
      value: { type: Object },
      options: { type: Object },
      schema: { type: Object, required: true },
    },
    computed: {
      vjsfOptions() {
        return {
          httpOptions: { withCredentials: true },
          editMode: 'inline',
          arrayItemCardProps: { outlined: true },
          ...this.options,
        }
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
