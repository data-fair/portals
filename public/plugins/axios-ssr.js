if (!process.__http_agents) require('../../shared/http-agents')

export default function ({ $axios }) {
  $axios.defaults.httpAgent = process.__http_agents.httpAgent
  $axios.defaults.httpsAgent = process.__http_agents.httpsAgent

  if (process.env.SECRET_IGNORE_RATE_LIMITING) {
    $axios.defaults.headers.common['x-ignore-rate-limiting'] = process.env.SECRET_IGNORE_RATE_LIMITING
  }
}
