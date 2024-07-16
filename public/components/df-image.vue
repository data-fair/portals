<template>
  <v-input
    name="avatar"
    :label="line.assetTitle"
    :disabled="disabled"
    class="vjsf-crop-img"
  >
    <v-row class="mt-0 mx-0">
      <v-avatar
        v-if="value && value.attachmentPath"
        class="mt-1 mr-1"
        tile
      >
        <v-img
          v-if="!loading"
          :src="`${imagesDatasetUrl}/attachments/${value.attachmentPath}`"
        />
      </v-avatar>
      <v-file-input
        v-if="!disabled"
        v-model="file"
        type="file"
        class="pt-2"
        accept="image/*"
        placeholder="chargez une image"
        outlined
        dense
        prepend-icon=""
        @change="change"
      />
      <v-btn
        v-if="value && value.attachmentPath"
        class="mt-1 ml-1"
        text
        @click="remove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-row>
  </v-input>
</template>

<script>
import { mapGetters } from 'vuex'
import { nanoid } from 'nanoid'

export default {
  inject: ['form'],
  props: {
    value: { type: Object, required: false, default: null },
    line: { type: Object, required: true },
    disabled: { type: Boolean, default: false }
  },
  data () {
    return {
      loading: false,
      file: null
    }
  },
  computed: {
    ...mapGetters(['imagesDatasetUrl'])
  },
  mounted () {},
  methods: {
    async change (event) {
      if (!this.file) return
      this.loading = true
      const formData = new FormData()
      formData.append('attachment', this.file)
      const fullLine = { ...this.line }
      fullLine.assetId = fullLine.assetId || this.value.assetId || this.nanoid()
      if (!fullLine.assetTitle) {
        const parentValue = this.form.getExprNode().parent.value
        fullLine.assetTitle = parentValue.title || this.file.name
      }

      Object.keys(fullLine).forEach(key => {
        formData.append(key, fullLine[key])
      })

      const res = await this.$axios.$post(`${this.imagesDatasetUrl}/lines`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      this.$emit('input', {
        ...fullLine,
        _id: res._id,
        _updatedAt: res._updatedAt,
        attachmentPath: res.attachmentPath
      })
      this.$emit('change')
      this.loading = false
      this.file = null
    },
    async remove (event) {
      this.loading = true
      const assetId = this.line.assetId || this.value.assetId
      try {
        const response = await this.$axios.$get(`${this.imagesDatasetUrl}/lines?qs=assetId:"${assetId}"`)
        const id = response.results && response.results[0] && response.results[0]._id
        if (id) await this.$axios.$delete(`${this.imagesDatasetUrl}/lines/${id}`)
        this.$emit('input', {})
      } catch (err) {
        console.error(err)
      }
      this.loading = false
    },
    nanoid () {
      return nanoid()
    }
  }
}
</script>

<style lang="css">
.vjsf-crop-img>.v-input__control>.v-input__slot {
  display: block;
}
</style>
