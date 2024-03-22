const config = require('config')
if (!process.__http_agents) require('../../shared/http-agents')

export default function ({ $axios }) {
  $axios.defaults.httpAgent = process.__http_agents.httpAgent
  $axios.defaults.httpsAgent = process.__http_agents.httpsAgent

  if (config.secretKeys.ignoreRateLimiging) {
    $axios.defaults.headers.common['x-ignore-rate-limiting'] = config.secretKeys.ignoreRateLimiting
  }
}
