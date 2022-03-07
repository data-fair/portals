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
    return createElement('h1', { class: 'display-1 grey--text text--darken-3 mb-4 mt-3' }, this.text)
  }
})

Vue.component('SectionTitle', {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  render: function (createElement) {
    return createElement('h2', { class: 'headline grey--text text--darken-3 my-4' }, this.text)
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
    return createElement('h3', { class: 'title grey--text text--darken-3 my-3' }, this.text)
  }
})

Vue.component('CardTitle', {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  render: function (createElement) {
    return createElement('h3', { class: 'title grey--text text--darken-2 font-weight-bold' }, this.text)
  }
})
