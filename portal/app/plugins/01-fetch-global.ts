export default defineNuxtPlugin(async () => {
  const config = await useFetch('/portal/api/config', { watch: false })

  return {
    provide: {
      portalConfig: config.data.value
    }
  }
})
