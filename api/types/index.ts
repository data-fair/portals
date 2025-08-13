import { type AccountKeys } from '@data-fair/lib-express'

export type IngressManagerIngressInfo = {
  _id: string,
  url: string,
  owner: AccountKeys,
  customCert?: string,
  controller?: string,
  blockedIps?: string[],
  redirects?: [string, string][]
}
