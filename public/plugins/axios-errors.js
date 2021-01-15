// make axios errors serialization
// cf https://github.com/nuxt-community/axios-module/issues/422

export default function ({ $axios, store }) {
  // Prevent unhandled Axios errors in SSR from throwing an error when serialized
  $axios.onError((error) => {
    // request errors do not seem to have this issue
    if (error.response) {
      const err = new Error(`Request failed with status code ${error.response.status}`)
      const config = (error.response && error.response.config) || error.config
      err.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        config: config && {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
        },
        data: error.response.data,
      }
      err.isAxiosError = true
      return Promise.reject(err)
    }
  })
}
