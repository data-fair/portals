import type { Account, AccountKeys } from '@data-fair/lib-express'

export type IngressManagerIngressInfo = {
  _id: string,
  url: string,
  owner: AccountKeys,
  customCert?: string,
  controller?: string,
  blockedIps?: string[],
  redirects?: [string, string][],
  rewrites?: [string, string][],
  waf?: 'on' | 'off' | 'detectionOnly'
}

export type Application = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: string
  updatedAt: string
  image?: string
  url: string
  href: string
  exposedUrl: string
  public?: boolean
  preferLargeDisplay?: boolean
  owner: Account
  topics?: {
    id: string
    title: string
    color?: string
  }[]
  baseApplication?: {
    meta?: {
      'df:capture-width'?: string
      'df:capture-height'?: string
    }
  }
}

export type Dataset = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: string
  updatedAt: string
  dataUpdatedAt?: string
  owner: Account

  // Metadata fields
  topics?: {
    id: string
    title: string
    color?: string
  }[]
  keywords?: string[]
  license?: {
    title: string
    href: string
  }
  origin?: string
  modified?: string
  creator?: string
  spatial?: string
  temporal?: {
    start: string
    end?: string
  }
  frequency?: string
  customMetadata?: Record<string, string>

  attachments?: {
    url: string
    title: string
    name: string
    type: 'file' | 'remoteFile'
    description: string
    size: string
    updatedAt: string
  }[]

  count?: number
  storage?: {
    indexed?: {
      size?: number
    }
  }

  image?: string
  thumbnail?: string

  isMetaOnly: boolean
  isRest?: boolean
  isVirtual?: boolean
  bbox?: number[]

  public?: boolean
  userPermissions: string[]

  virtual?: {
    children?: string[]
  }

  extras?: {
    applications?: {
      id: string
      slug?: string
      updatedAt: string
    }[]
  }

  previews?: {
    id: string
    title: string
    href: string
  }[]
}
