import type { AxiosAuthOptions } from '@data-fair/lib-node/axios-auth.js'

import { axiosBuilder } from '@data-fair/lib-node/axios.js'
import { axiosAuth as _axiosAuth } from '@data-fair/lib-node/axios-auth.js'
import mongo from '@data-fair/lib-node/mongo.js'
import es from '../../api/src/es.ts'

const directoryUrl = `http://localhost:${process.env.NGINX_PORT}/simple-directory`

export const baseURL = `http://localhost:${process.env.NGINX_PORT}/portals-manager`

const axiosOpts = { baseURL }

export const axios = (opts = {}) => axiosBuilder({ ...axiosOpts, ...opts })

export const axiosAuth = (opts: string | Omit<AxiosAuthOptions, 'directoryUrl' | 'axiosOpts' | 'password'>) => {
  opts = typeof opts === 'string' ? { email: opts } : opts
  const password = opts.email === 'superadmin@test.com' ? 'superpasswd' : 'passwd'
  return _axiosAuth({ ...opts, password, axiosOpts, directoryUrl })
}

export const clean = async () => {
  for (const name of ['portals', 'pages']) {
    await mongo.db.collection(name).deleteMany({})
  }
  await es.client.indices.delete({ index: 'portal-search-test-*', ignore_unavailable: true }).catch(err => { console.log(err) })
}

export const startApiServer = async () => {
  const apiServer = await import('../../api/src/server.ts')
  await apiServer.start()
}

export const stopApiServer = async () => {
  const apiServer = await import('../../api/src/server.ts')
  await apiServer.stop()
}
