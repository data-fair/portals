const config = require('config')
const fs = require('fs-extra')
const path = require('path')
const express = require('express')
const slug = require('slugify')
const createError = require('http-errors')
const Ajv = require('ajv')
const ajv = new Ajv()
const { RateLimiterMongo } = require('rate-limiter-flexible')
const requestIp = require('request-ip')
const emailValidator = require('email-validator')
const marked = require('marked').parse
const { nanoid } = require('nanoid')
const { randomUUID } = require('crypto')

const sanitizeHtml = require('../../shared/sanitize-html')
const portalSchema = require('../../contract/portal')
const validatePortal = ajv.compile(portalSchema)
const pageSchema = require('../../contract/page.json')
const validatePage = ajv.compile(pageSchema)
const useSchema = require('../../contract/use')
const validateUse = ajv.compile(useSchema)
const asyncWrap = require('../utils/async-wrap')
const { downloadAsset, uploadAssets, prepareFitHashedAsset, fillConfigAssets } = require('../utils/assets')
const axios = require('../utils/axios')
const findUtils = require('../utils/find')
const usesUtils = require('../utils/uses')
const notifications = require('../utils/notifications')
const imagesDatasetUtils = require('../utils/images-dataset')
const debugSyncPortal = require('debug')('sync-portal')

const configSchemaNoAllOf = JSON.parse(JSON.stringify(portalSchema.properties.config))
configSchemaNoAllOf.allOf.forEach(a => {
  Object.values(a.properties).forEach(p => {
    if (p.dependencies) Object.assign(p.properties, p.dependencies.active.properties)
  })
})
configSchemaNoAllOf.properties = Object.assign({}, ...configSchemaNoAllOf.allOf.map(a => a.properties))
delete configSchemaNoAllOf.allOf
const configDefaults = require('json-schema-defaults')(configSchemaNoAllOf)
// TODO find a better default lib
delete configDefaults.homeApplication
delete configDefaults.featuredApplication
delete configDefaults.homeLinks

function link (portal, path = '') {
  return portal.host ? `https://${portal.host}${path}` : `${config.publicUrl}${path}?portalId=${portal._id}`
}

function cleanPortal (portal, html) {
  portal.draftLink = `${config.publicUrl}?portalId=${portal._id}&draft=true`
  portal.link = link(portal)
  if (portal.config) portal.config = cleanConfig(portal.config, html)
  if (portal.configDraft) portal.configDraft = cleanConfig(portal.configDraft, html)
  return portal
}

function cleanPage (page, html) {
  if (page.config) cleanPageConfig(page.config, html)
  if (page.configDraft) cleanPageConfig(page.configDraft, html)
}

function cleanConfig (conf, html) {
  if (conf.description && html) conf.description = sanitizeHtml(marked(conf.description))
  if (conf.contactInfos && html) conf.contactInfos = sanitizeHtml(marked(conf.contactInfos))
  return conf
}

function cleanPageConfig (conf, html) {
  if (!conf) return
  if (typeof conf !== 'object') return
  if (!html) return
  if (['text', 'alert', 'cardSimple'].includes(conf.type) && conf.content) {
    conf.content = sanitizeHtml(marked(conf.content))
  }
  if (conf.description) conf.description = sanitizeHtml(marked(conf.description))
  if (conf.alert && conf.alert.content) conf.alert.content = sanitizeHtml(marked(conf.alert.content))
  Object.keys(conf).forEach(key => {
    if (Array.isArray(conf[key])) conf[key].forEach(item => cleanPageConfig(item, html))
  })
}

function cleanUse (use, html) {
  if (!use) return
  if (use.description && html) use.description = sanitizeHtml(marked(use.description))
  return use
}

// portals are synced to settings.publicationSites in data-fair and to a dataset containing images
async function syncPortalUpdate (portal, cookie) {
  const publicationSite = {
    type: 'data-fair-portals',
    id: portal._id,
    title: portal.title,
    url: link(portal),
    datasetUrlTemplate: link(portal, '/datasets/{slug}'),
    applicationUrlTemplate: link(portal, '/reuses/{slug}')
  }
  if (portal.config && portal.config.authentication === 'required') {
    publicationSite.private = true
  }
  debugSyncPortal('sync portal', portal)

  const id = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  debugSyncPortal(`sync to data-fair ${id}`)

  await axios.post(
    `${config.dataFairUrl}/api/v1/settings/${portal.owner.type}/${id}/publication-sites`,
    publicationSite,
    { headers: { cookie } }
  )

  if (portal.config && portal.host && config.secretKeys.sites) {
    debugSyncPortal(`sync to SD ${id}`)
    await axios.post(
      `${config.privateDirectoryUrl || config.directoryUrl}/api/sites`,
      {
        _id: 'data-fair-portals:' + portal._id,
        owner: portal.owner,
        host: portal.host,
        logo: `https://${portal.host}/api/v1/portals/${portal._id}/assets/logo?hash=${portal.config.assets.logo && portal.config.assets.logo.hash}`,
        theme: {
          primaryColor: config.themeColor || '#1E88E5'
        }
      },
      { params: { key: config.secretKeys.sites } }
    )
  }

  debugSyncPortal(`sync images dataset ${id}`)
  await axios.put(
    `${config.dataFairUrl}/api/v1/datasets/${imagesDatasetUtils.id(portal)}`,
    imagesDatasetUtils.init(portal),
    { headers: { cookie } }
  )
  if (portal.config && portal.config.authentication === 'required') {
    await axios.put(
      `${config.dataFairUrl}/api/v1/datasets/${imagesDatasetUtils.id(portal)}/permissions`,
      [],
      { headers: { cookie } }
    )
  } else {
    await axios.put(
      `${config.dataFairUrl}/api/v1/datasets/${imagesDatasetUtils.id(portal)}/permissions`,
      [{ operations: [], classes: ['read'] }],
      { headers: { cookie } }
    )
  }
}
async function syncPortalDelete (portal, cookie) {
  const id = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  await axios.delete(
    `${config.dataFairUrl}/api/v1/settings/${portal.owner.type}/${id}/publication-sites/data-fair-portals/${portal._id}`,
    { headers: { cookie } }
  )
  await axios.delete(
    `${config.dataFairUrl}/api/v1/datasets/${imagesDatasetUtils.id(portal)}`,
    { headers: { cookie } }
  )
}

const router = module.exports = express.Router()

// List user portals, or all portals for super admin
router.get('', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const filter = {}
  if (req.query.showAll && !req.user.adminMode) {
    return res.status(403).send('Seul un super administrateur peut requêter la liste complète des portails.')
  }
  if (!req.query.showAll) {
    filter['owner.type'] = req.user.activeAccount.type
    filter['owner.id'] = req.user.activeAccount.id
    if (req.user.activeAccount.department) {
      filter['owner.department'] = req.user.activeAccount.department
    }
  }
  res.send((await req.app.get('db').collection('portals').find(filter).limit(10000).toArray()).map(cleanPortal))
}))

const canCreatePortal = (user, owner) => {
  if (owner.type === 'user') {
    return (owner.id === user.id)
  } else {
    if (user.organizations.find(o => o.id === owner.id && o.role === 'admin' && !o.department)) {
      // org admin ok for any dep or no dep
      return true
    }
    if (owner.department && user.organizations.find(o => o.id === owner.id && o.role === 'admin' && o.department === owner.department)) {
      // dep admin, ok
      return true
    }
  }
}

// Create a new portal (cannot be used to update)
router.post('', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const collection = req.app.get('db').collection('portals')
  const portal = req.body
  portal.config = cleanConfig(portal.config || configDefaults)
  portal.configDraft = cleanConfig(portal.configDraft || configDefaults)
  if (portal._id) return res.status(400).send('You cannot specify the id of the created portal')
  if (portal.host) return res.status(400).send('You cannot specify the host of the created portal')
  // this is better than nanoid to create an id that will be accepted by data-fair for the images dataset
  portal._id = randomUUID()
  portal.owner = portal.owner || req.user.accountOwner
  if (!canCreatePortal(req.user, portal.owner)) return res.status(403).send()

  if (!validatePortal(portal)) {
    return res.status(400).send(validatePortal.errors)
  }
  const existingPortal = await collection.findOne({ _id: portal._id })
  if (existingPortal) {
    return res.status(409).send('Ce portail existe déjà.')
  }
  await collection.insertOne(portal)
  await syncPortalUpdate(portal, req.headers.cookie)
  notifications.subscribe(req, {
    outputs: ['devices', 'email'],
    locale: 'fr',
    sender: portal.owner,
    visibility: 'private',
    topic: {
      key: `portals:use-submitted:${portal._id}`,
      title: `Un contributeur demande de publier une réutilisation sur ${portal.title || portal._id}`
    },
    urlTemplate: `${config.dataFairUrl}/extra/portals?p=.%2F${portal._id}%2Fuses%2F{id}%2Fedit`
  })
  res.send(cleanPortal(portal, req.params.html === true))
}))

// Read the portal matching a request, check that the user is owner
async function setPortal (req, res, next) {
  if (!req.user) return res.status(401).send()
  const portal = await req.app.get('db')
    .collection('portals').findOne({ _id: req.params.id })
  if (!portal) throw createError(404, 'Portail inconnu')
  if (portal.owner.type === 'organization') {
    const orga = req.user.organizations.find(o => o.id === portal.owner.id && (!o.department || o.department === portal.owner.department))
    if (!orga || orga.role !== 'admin') throw createError(403, 'admin only')
  }
  if (portal.owner.type === 'user' && req.user.id !== portal.owner.id) {
    throw createError(403, 'user himself only')
  }
  req.portal = portal
  if (next) next()
}

// Get an existing portal as the owner
router.get('/:id', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  if (req.query.noConfig === 'true') {
    delete req.portal.config
    delete req.portal.configDraft
  }
  // this is to manage transition with old portals that do not have an images dataset
  // TODO: remove this in a few months
  try {
    await axios.get(`${config.dataFairUrl}/api/v1/datasets/${imagesDatasetUtils.id(req.portal)}`)
  } catch (err) {
    await syncPortalUpdate(req.portal, req.headers.cookie)
  }
  res.send(cleanPortal(req.portal, req.query.html === 'true'))
}))

// Delete an existing portal as the owner
router.delete('/:id', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  await req.app.get('db')
    .collection('portals').deleteOne({ _id: req.params.id })
  if (await fs.pathExists(`${config.dataDir}/${req.params.id}`)) await fs.remove(`${config.dataDir}/${req.params.id}`)
  await syncPortalDelete(req.portal, req.headers.cookie)
  res.send()
}))

// Update the draft configuration as the owner
router.put('/:id/configDraft', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  req.body.updatedAt = new Date().toISOString()
  await fillConfigAssets(`${config.dataDir}/${req.portal._id}/draft`, req.body)
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, { $set: { configDraft: cleanConfig(req.body) } })
  res.send()
}))

const googleFonts = require('google-fonts-complete')
const fonts = Object.entries(googleFonts)
  .filter(entry => entry[1].subsets.includes('latin'))
  .map(([name, info]) => ({ source: 'google-fonts', name, label: name, category: info.category }))
router.get('/:id/fonts', asyncWrap(setPortal), (req, res, next) => {
  const assetsFonts = []
  if (req.portal.configDraft?.assets?.font1?.name) {
    assetsFonts.push({ source: 'assets', name: 'font1', label: `Police 1 (${req.portal.configDraft.assets.font1.name})` })
  }
  if (req.portal.configDraft?.assets?.font2?.name) {
    assetsFonts.push({ source: 'assets', name: 'font2', label: `Police 2 (${req.portal.configDraft.assets.font2.name})` })
  }
  res.send([...assetsFonts, ...fonts])
})

router.post('/:id/assets/:assetId', uploadAssets.any(), asyncWrap(async (req, res) => {
  await prepareFitHashedAsset(`${config.dataDir}/${req.params.id}/draft`, req.params.assetId)
  res.send()
}))

router.get('/:id/assets/:assetId', asyncWrap(setPortalAnonymous), asyncWrap(downloadAsset))

// Validate the draft as the owner
// Both configuration and uploaded resources
router.post('/:id/_validate_draft', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, {
      $set: {
        config: {
          ...req.portal.configDraft,
          updatedAt: new Date().toISOString()
        }
      }
    })
  if (await fs.pathExists(`${config.dataDir}/${req.portal._id}/draft`)) {
    await fs.copy(`${config.dataDir}/${req.portal._id}/draft`, `${config.dataDir}/${req.portal._id}/prod`)
  }
  await syncPortalUpdate({ ...req.portal, config: req.portal.configDraft }, req.headers.cookie)
  res.send()
}))
router.post('/:id/_cancel_draft', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, { $set: { configDraft: req.portal.config } })
  if (await fs.pathExists(`${config.dataDir}/${req.portal._id}/prod`)) {
    await fs.copy(`${config.dataDir}/${req.portal._id}/prod`, `${config.dataDir}/${req.portal._id}/draft`)
  }
  res.send()
}))

// Define the exposition host as super admin
router.put('/:id/host', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  if (!req.user.isAdmin) return res.status(403).send()
  const portal = (await req.app.get('db').collection('portals')
    .findOneAndUpdate({ _id: req.params.id }, { $set: { host: req.body } }, { returnDocument: 'after' })).value
  await syncPortalUpdate(portal, req.headers.cookie)
  res.send()
}))

async function setPortalAnonymous (req, res, next) {
  const draft = req.query.draft === 'true'
  if (draft && !req.user) {
    return res.status(401).send('Le mode brouillon demande d\'être authentifié')
  }
  const portal = await req.app.get('db')
    .collection('portals').findOne({ _id: req.params.id }, { owner: true, [draft ? 'configDraft' : 'config']: true })
  if (!portal) return res.status(404).send('Portail inconnu')
  if (draft && portal.owner.type === 'organisation' && !req.user.organizations.find(o => o.id === portal.owner.id)) {
    return res.status(403).send('Le mode brouillon demande d\'être propriétaire.')
  }
  if (draft && portal.owner.type === 'user' && req.user.id !== portal.owner.id) {
    return res.status(403).send('Le mode brouillon demande d\'être propriétaire.')
  }
  const config = draft ? portal.configDraft : portal.config
  if (!config) return res.status(404).send('Aucune configuration enregistrée pour ce portail')

  // not very respectful of contract, but we use this to automatically switch user is possible in client
  config.owner = portal.owner

  req.portal = portal
  req.config = config
  next()
}

// Public access to the portal configuration, except for the draft that is reserved to owner
router.get('/:id/config', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res) => {
  res.send(cleanConfig(req.config, req.query.html === 'true'))
}))

// Get the list of pages
router.get('/:id/pages', asyncWrap(async (req, res, next) => {
  const portal = await req.app.get('db').collection('portals').findOne({ _id: req.params.id }, { owner: 1 })
  if (!portal) return res.status(404).send('Portail inconnu')
  const project = req.query.select ? Object.assign({}, ...req.query.select.split(',').map(f => ({ [f]: 1 }))) : {}
  const sort = findUtils.sort(req.query.sort)
  const pages = req.app.get('db').collection('pages')
  const filter = { 'portal._id': req.params.id }
  const [skip, size] = findUtils.pagination(req.query)
  if (req.query.template) filter.template = req.query.template
  if (!req.user) filter.public = true
  else if (portal.owner.type === 'user' && portal.owner.id !== req.user.id) filter.public = true
  else if (portal.owner.type === 'organization' && (!req.user.organization || portal.owner.id !== req.user.organization.id)) filter.public = true
  else if (portal.owner.type === 'organization' && req.user.organization && req.user.organization.department && req.user.organization.department !== portal.owner.department) filter.public = true
  if (filter.public || req.query.published === 'true') filter.published = true
  const [results, count] = await Promise.all([
    pages.find(filter).limit(size).skip(skip).project(project).sort(sort).toArray(),
    pages.countDocuments(filter)
  ])
  results.forEach(page => cleanPage(page, req.query.html === 'true'))
  res.json({ count, results })
}))

// Get a page
router.get('/:id/pages/:pageId', asyncWrap(async (req, res, next) => {
  const portal = await req.app.get('db').collection('portals').findOne({ _id: req.params.id }, { owner: 1 })
  if (!portal) return res.status(404).send('Portail inconnu')
  const page = await req.app.get('db').collection('pages').findOne({ id: req.params.pageId, 'portal._id': req.params.id })
  if (!page) return res.status(404).send()
  if (!page.public) {
    if (!req.user) return res.status(401).send()
    if (portal.owner.type === 'user' && portal.owner.id !== req.user.id) return res.status(403).send()
    if (portal.owner.type === 'organization' && (!req.user.organization || portal.owner.id !== req.user.organization.id)) {
      return res.status(403).send()
    }
    if (portal.owner.type === 'organization' && req.user.organization && req.user.organization.department && req.user.organization.department !== portal.owner.department) {
      return res.status(403).send()
    }
  }
  cleanPage(page, req.query.html === 'true')
  res.status(200).json(page)
}))

// Create a page
router.post('/:id/pages', asyncWrap(setPortal), asyncWrap(async (req, res, next) => {
  const baseId = slug(req.body.title.slice(0, 100), { lower: true, strict: true })
  req.body.id = baseId
  req.body.portal = {
    _id: req.portal._id,
    title: req.portal.title
  }
  req.body.created = req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
  }
  if (req.body.published) {
    req.body.publishedAt = new Date()
  }
  const valid = validatePage(req.body)
  if (!valid) return res.status(400).send(validatePage.errors)
  let insertOk = false
  let i = 1
  while (!insertOk) {
    try {
      await req.app.get('db').collection('pages').insertOne(req.body)
      insertOk = true
    } catch (err) {
      if (err.code !== 11000) throw err
      i += 1
      req.body.id = `${baseId}-${i}`
    }
  }
  cleanPage(req.body, req.query.html === 'true')
  res.status(200).send(req.body)
}))

// Patch some of the attributes of a page
router.patch('/:id/pages/:pageId', asyncWrap(setPortal), asyncWrap(async (req, res, next) => {
  const filter = { id: req.params.pageId, 'portal._id': req.portal._id }
  const page = await req.app.get('db').collection('pages')
    .findOne(filter, { projection: { _id: 0 } })
  if (!page) return res.status(404).send()
  // Restrict the parts of the page that can be edited by API

  const acceptedParts = Object.keys(pageSchema.properties).filter(k => !pageSchema.properties[k].readOnly)
  acceptedParts.push('config')
  for (const key in req.body) {
    if (!acceptedParts.includes(key)) return res.status(400).send('Unsupported patch part ' + key)
  }
  req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
  }
  if (req.body.published && !page.published) {
    req.body.publishedAt = new Date()
  }

  const patch = {}
  for (const key in req.body) {
    if (!req.body[key]) {
      patch.$unset = patch.$unset || {}
      patch.$unset[key] = undefined
      req.body[key] = undefined
    } else {
      patch.$set = patch.$set || {}
      patch.$set[key] = req.body[key]
    }
  }
  const patchedPage = Object.assign({}, page, req.body)
  const valid = validatePage(JSON.parse(JSON.stringify(patchedPage)))
  if (!valid) return res.status(400).send(validatePage.errors)

  await req.app.get('db').collection('pages').findOneAndUpdate(filter, patch)
  cleanPage(patchedPage, req.query.html === 'true')
  res.status(200).send(patchedPage)
}))

router.delete('/:id/pages/:pageId', asyncWrap(setPortal), asyncWrap(async (req, res, next) => {
  await req.app.get('db').collection('pages').deleteOne({ id: req.params.pageId, 'portal._id': req.portal._id })
  res.status(204).send()
}))

// Get the list of uses
router.get('/:id/uses', setPortalAnonymous, asyncWrap(async (req, res, next) => {
  const uses = req.app.get('db').collection('uses')
  const query = {
    'portal._id': req.params.id,
    published: true,
    'owner.type': req.portal.owner.type,
    'owner.id': req.portal.owner.id
  }
  if (req.query.slug) query.slug = req.query.slug
  if (req.query.dataset) query['datasets.id'] = req.query.dataset
  if (req.query.q) query.$text = { $search: req.query.q }

  if (req.query.owner === 'me') {
    if (!req.user) return res.status(403).send('owner=me filter is for authenticated users')
    query['owner.type'] = 'user'
    query['owner.id'] = req.user.id
    query.published = { $ne: true }
  } else if (req.query.creator === 'me') {
    query['created.id'] = req.user.id
    if (!req.user) return res.status(403).send('creator=me filter is for authenticated users')
    delete query.published
  } else if (req.query.published) {
    // only owner of portal can filter on published
    // we use setPortal just to check that the user is owner
    await setPortal(req, res)
    query.published = req.query.published === 'true'
  }
  const sort = findUtils.sort(req.query.sort)
  const project = findUtils.project(req.query.select)
  const [skip, size] = findUtils.pagination(req.query)

  const countPromise = req.query.count !== 'false' && uses.countDocuments(query)
  const resultsPromise = size > 0 && uses.find(query).collation({ locale: 'en' }).limit(size).skip(skip).sort(sort).project(project).toArray()
  const response = {}
  if (countPromise) response.count = await countPromise
  if (resultsPromise) response.results = await resultsPromise
  else response.results = []
  response.results.forEach(r => {
    cleanUse(r, req.query.html === 'true')
  })
  res.json(response)
}))

// Create a use
router.post('/:id/uses', asyncWrap(setPortalAnonymous), usesUtils.uploadImage.any(), asyncWrap(async (req, res, next) => {
  await usesUtils.afterUpload(req)
  req.body._id = req.body.slug = req.params.useId || nanoid()
  req.body.portal = {
    _id: req.portal._id,
    title: req.portal.title,
    owner: req.portal.owner
  }
  req.body.created = req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
  }
  req.body.owner = {
    type: 'user',
    id: req.user.id,
    name: req.user.name
  }
  req.body.published = false
  const valid = validateUse(req.body)
  if (!valid) return res.status(400).send(validateUse.errors)
  await req.app.get('db').collection('uses').insertOne(req.body)
  cleanUse(req.body, req.query.html === 'true')
  res.status(200).send(req.body)
}))

router.patch('/:id/uses/:useId', asyncWrap(setPortalAnonymous), usesUtils.uploadImage.any(), asyncWrap(async (req, res, next) => {
  await usesUtils.afterUpload(req)
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    await setPortal(req, res)
  }
  const acceptedParts = Object.keys(useSchema.properties).filter(k => !useSchema.properties[k].readOnly)
  for (const key in req.body) {
    if (!acceptedParts.includes(key)) return res.status(400).send('Unsupported patch part ' + key)
  }
  req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
  }

  const patch = {}
  for (const key in req.body) {
    if ([null, ''].includes(req.body[key])) {
      patch.$unset = patch.$unset || {}
      patch.$unset[key] = undefined
      req.body[key] = undefined
    } else {
      patch.$set = patch.$set || {}
      patch.$set[key] = req.body[key]
    }
  }
  if (req.body.published && !use.published) {
    req.body.publishedAt = use.publishedAt || new Date()
    const baseSlug = slug(use.title, { lower: true, strict: true })
    let useSlug = baseSlug
    let updateOk = false
    let i = 1
    while (!updateOk) {
      try {
        await req.app.get('db').collection('uses').updateOne(
          { _id: req.params.useId },
          { $set: { slug: useSlug, publishedAt: req.body.publishedAt } })
        updateOk = true
        req.body.slug = useSlug
      } catch (err) {
        if (err.code !== 11000) throw err
        i += 1
        useSlug = `${baseSlug}-${i}`
      }
    }
  }
  const patchedUse = Object.assign({}, use, req.body)
  const valid = validateUse(JSON.parse(JSON.stringify(patchedUse)))
  if (!valid) return res.status(400).send(validateUse.errors)

  await req.app.get('db').collection('uses').findOneAndUpdate({ _id: req.params.useId, 'portal._id': req.portal._id }, patch)
  cleanPage(patchedUse, req.query.html === 'true')
  res.status(200).send(patchedUse)
}))

router.get('/:id/uses/:useId', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (!use.published && (use.owner.type !== 'user' || use.owner.id !== req.user.id)) {
    // we use setPortal just to check that the user is owner
    await setPortal(req, res)
  }
  res.send(use)
}))

router.get('/:id/uses/:useId/image', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (!use.image) return res.status(404).send('use image not found')
  res.sendFile(path.join(usesUtils.directory(req.params.id, req.params.useId), 'image'), {
    headers: {
      'content-type': use.image.type,
      'cache-control': use.published ? 'public' : 'private'
    }
  })
}))

router.get('/:id/uses/:useId/image-thumbnail', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (!use.image) return res.status(404).send('use image not found')
  res.sendFile(path.join(usesUtils.directory(req.params.id, req.params.useId), 'image-thumbnail.png'), {
    headers: {
      'cache-control': use.published ? 'public' : 'private'
    }
  })
}))

router.delete('/:id/uses/:useId', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    // we use setPortal just to check that the user is owner
    await setPortal(req, res)
  }
  await req.app.get('db').collection('uses').deleteOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  res.status(204).send()
}))

router.post('/:id/uses/:useId/_submit', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    // we use setPortal just to check that the user is owner
    await setPortal(req, res)
  }
  await req.app.get('db').collection('uses').updateOne(
    { _id: req.params.useId },
    { $set: { owner: req.portal.owner, published: false } })
  notifications.send({
    sender: { ...req.portal.owner },
    topic: { key: `portals:use-submitted:${req.portal._id}` },
    title: `Un contributeur demande de publier une réutilisation sur ${req.portal.title || req.portal._id}`,
    body: use.title,
    urlParams: { id: use._id },
    visibility: 'private'
  })
  return res.status(204).send()
}))

const matchingPortalHost = (portal, req) => {
  if (!req.headers.origin) return true
  if (config.publicUrl.startsWith(req.headers.origin)) return true
  if (req.portal.host && req.portal.host === new URL(req.headers.origin).host) return true
  return false
}

// Anonymous users can post an email to the registered contact
const limiterOptions = {
  keyPrefix: 'data-fair-portals-rate-limiter-contact',
  points: 1,
  duration: 60
}
let _limiter
const limiter = (req) => {
  _limiter = _limiter || new RateLimiterMongo({ storeClient: req.app.get('client'), ...limiterOptions })
  return _limiter
}
router.post('/:id/contact-email', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  if (!emailValidator.validate(req.body.from)) return res.status(400).send('Adresse mail non renseignée ou malformée.')
  if (!req.body.token) return res.status(401).send()
  if (!req.config.contactEmail) return res.status(404).send('Adresse mail de contact non configurée')

  // 1rst level of anti-spam prevention, no cross origin requests on this route
  if (!matchingPortalHost(req.portal, req)) {
    return res.status(405).send('Appel depuis un domaine extérieur non supporté')
  }

  const { verifyToken } = req.app.get('session')
  try {
    // 2nd level of anti-spam protection, validate that the user was present on the page for a few seconds before sending
    await verifyToken(req.body.token)
  } catch (err) {
    if (err.name === 'NotBeforeError') {
      return res.status(429).send('Message refusé, l\'activité ressemble à celle d\'un robot spammeur.')
    } else {
      return res.status(401).send('Invalid token')
    }
  }

  try {
    // 3rd level of anti-spam protection, simple rate limiting based on ip
    await limiter(req).consume(requestIp.getClientIp(req), 1)
  } catch (err) {
    console.warn('Rate limit error for /mails/contact route', requestIp.getClientIp(req), req.body.email, err)
    return res.status(429).send('Trop de messages dans un bref interval. Veuillez patienter avant d\'essayer de nouveau.')
  }

  const mail = {
    from: req.body.from,
    to: req.config.contactEmail,
    subject: req.body.subject,
    text: req.body.text
  }
  await req.app.get('mailTransport').sendMailAsync(mail)

  res.status(200).send(req.body)
}))
