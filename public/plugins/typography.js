/* eslint-disable vue/one-component-per-file */
import Vue from 'vue'

Vue.component('PageTitle', {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  render: function (createElement) {
    return createElement('h1', { class: 'text-h4 grey--text text--darken-3 my-3' }, this.text)
  }
})

Vue.component('SectionTitle', {
  props: {
    text: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: ('h2')
    }
  },
  render: function (createElement) {
    return createElement(this.tag, { class: 'text-h5 grey--text text--darken-3 my-4' }, [this.text, this.$slots.after])
  }
})

Vue.component('SectionSubtitle', {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  render: function (createElement) {
    return createElement('h3', { class: 'text-h6 grey--text text--darken-3 my-3' }, this.text)
  }
})
