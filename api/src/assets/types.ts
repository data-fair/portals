import type { Account } from '@data-fair/lib-express'

export type Asset = {
  _id: string
  owner: Account
  name: string
  key: string
  mimeType: string
  size: number
  width?: number
  height?: number
  duration?: number
  createdAt: string
}
