import type { ApiConfig } from '../config/type/index.ts'
import { assertValid } from '../config/type/index.ts'
import config from 'config'

const apiConfig = config
assertValid(apiConfig, { lang: 'en', name: 'config', internal: true })

if (apiConfig.privateIngressManagerUrl && !apiConfig.secretKeys.ingress) {
  throw new Error('config.privateIngressManagerUrl is defined, but config.secretKeys.ingress is missing')
}

export default apiConfig as ApiConfig
