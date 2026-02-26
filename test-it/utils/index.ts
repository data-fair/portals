import type { AxiosAuthOptions } from '@data-fair/lib-node/axios-auth.js'

import { axiosBuilder } from '@data-fair/lib-node/axios.js'
import { axiosAuth as _axiosAuth } from '@data-fair/lib-node/axios-auth.js'
import mongo from '@data-fair/lib-node/mongo.js'

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
}

export const startApiServer = async () => {
  // Before tests
  process.env.SUPPRESS_NO_CONFIG_WARNING = '1'
  process.env.NODE_CONFIG_DIR = 'api/config/'
  console.log('start')
  const apiServer = await import('../../api/src/server.ts')
  await apiServer.start()
  console.log('ok')
}

export const stopApiServer = async () => {
  const apiServer = await import('../../api/src/server.ts')
  await apiServer.stop()
}
