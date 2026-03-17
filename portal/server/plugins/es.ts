import { Client } from '@elastic/elasticsearch'
import type { ClientOptions } from '@elastic/elasticsearch/lib/client'

export class PortalEs {
  private _client?: Client

  get client () {
    if (!this._client) throw new Error('ES was not connected')
    return this._client
  }

  async connect (config: { nodes: string; auth?: { username: string; password: string }; ca?: string }) {
    const options: ClientOptions = { node: config.nodes }
    if (config.auth) {
      options.auth = config.auth
    }
    if (config.ca) {
      options.tls = options.tls ?? {}
      options.tls.ca = config.ca
    }
    this._client = new Client(options)
  }
}

export const portalEs = new PortalEs()

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  await portalEs.connect({
    nodes: config.elasticsearchNodes,
    auth: config.elasticsearchAuth ? { username: config.elasticsearchAuth.split(':')[0]!, password: config.elasticsearchAuth.split(':')[1]! } : undefined,
    ca: config.elasticsearchCA
  })
})
