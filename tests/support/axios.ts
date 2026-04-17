import type { AxiosAuthOptions } from '@data-fair/lib-node/axios-auth.js'
import { axiosBuilder } from '@data-fair/lib-node/axios.js'
import { axiosAuth as _axiosAuth } from '@data-fair/lib-node/axios-auth.js'

export const directoryUrl = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/simple-directory`
export const apiUrl = `http://localhost:${process.env.DEV_API_PORT}/portals-manager`
export const baseURL = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/portals-manager`

const axiosOpts = { baseURL }

export const axios = (opts = {}) => axiosBuilder({ ...axiosOpts, ...opts })

export const axiosAuth = (opts: string | Omit<AxiosAuthOptions, 'directoryUrl' | 'axiosOpts' | 'password'>) => {
  opts = typeof opts === 'string' ? { email: opts } : opts
  const password = opts.email === 'test_superadmin@test.com' ? 'superpasswd' : 'passwd'
  return _axiosAuth({ ...opts, password, axiosOpts, directoryUrl })
}

export const clean = async () => {
  const ax = axiosBuilder({ baseURL: apiUrl })
  await ax.delete('/api/test-env')
}
