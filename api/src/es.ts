import config from '#config'
import { Client } from '@elastic/elasticsearch'
import { ClientOptions } from '@elastic/elasticsearch/lib/client'

export class DfEs {
  private _client?: Client

  get client () {
    if (!this._client) throw new Error('db was not connected')
    return this._client
  }

  async connect () {
    const options: ClientOptions = { node: config.elasticsearch.nodes }
    if (config.elasticsearch.auth) {
      options.auth = config.elasticsearch.auth
    }
    if (config.elasticsearch.ca) {
      options.tls = options.tls ?? {} // note, in v8 this becomes "tls"
      options.tls.ca = config.elasticsearch.ca
    }
    const client = new Client(options)
    try {
      await client.ping()
    } catch (err) {
      // 1 retry after 2s
      // solve the quite common case in docker compose of the service starting at the same time as the elasticsearh node
      await new Promise(resolve => setTimeout(resolve, 2000))
      await client.ping()
    }
    this._client = client
  }

  async init () {
    await this.connect()
  }
}

const dfEs = new DfEs()

export default dfEs
