<template>
  <div v-if="reuseFetch.data.value">
    <v-table density="compact">
      <tbody>
        <tr>
          <td class="font-weight-bold">
            {{ t('id') }}
          </td>
          <td>{{ reuseFetch.data.value._id }}</td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('slug') }}
          </td>
          <td>{{ reuseFetch.data.value.slug }}</td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('owner') }}
          </td>
          <td>
            <owner-avatar
              :owner="reuseFetch.data.value.owner"
              size="24"
            />
            {{ reuseFetch.data.value.owner.name }}
            <template v-if="reuseFetch.data.value.owner.departmentName">
              - {{ reuseFetch.data.value.owner.departmentName }}
            </template>
          </td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('createdAt') }}
          </td>
          <td>{{ formatDate(reuseFetch.data.value.created.date) }}</td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('createdBy') }}
          </td>
          <td>{{ reuseFetch.data.value.created.name }}</td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('updatedAt') }}
          </td>
          <td>{{ formatDate(reuseFetch.data.value.updated.date) }}</td>
        </tr>
        <tr>
          <td class="font-weight-bold">
            {{ t('updatedBy') }}
          </td>
          <td>{{ reuseFetch.data.value.updated.name }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { t } = useI18n()
const { reuseFetch } = useReuseStore()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

</script>

<i18n lang="yaml">
  en:
    id: ID
    slug: Slug
    owner: Owner
    createdAt: Created at
    createdBy: Created by
    updatedAt: Updated at
    updatedBy: Updated by

  fr:
    id: ID
    slug: Slug
    owner: Propriétaire
    createdAt: Créé le
    createdBy: Créé par
    updatedAt: Mis à jour le
    updatedBy: Mis à jour par

</i18n>
