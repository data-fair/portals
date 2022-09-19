const config = require('config')
const fs = require('fs-extra')
const express = require('express')
const slug = require('slugify')
const shortid = require('shortid')
const Ajv = require('ajv')
const ajv = new Ajv()
const { RateLimiterMongo } = require('rate-limiter-flexible')
const requestIp = require('request-ip')
const emailValidator = require('email-validator')
const marked = require('marked')
const { nanoid } = require('nanoid')

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
delete configDefaults.homeReuse
delete configDefaults.featuredReuse

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
  if (use.description) use.description = sanitizeHtml(marked(use.description))
  return use
}

// portals are synced to settings.publicationSites in data-fair
async function syncPortalUpdate (portal, cookie) {
  const publicationSite = {
    type: 'data-fair-portals',
    id: portal._id,
    title: portal.title,
    url: link(portal),
    datasetUrlTemplate: link(portal, '/datasets/{id}'),
    applicationUrlTemplate: link(portal, '/reuses/{id}')
  }
  if (portal.config && portal.config.authentication === 'required') {
    publicationSite.private = true
  }
  const id = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  await axios.post(
    `${config.dataFairUrl}/api/v1/settings/${portal.owner.type}/${id}/publication-sites`,
    publicationSite,
    { headers: { cookie } }
  )
}
async function syncPortalDelete (portal, cookie) {
  const id = portal.owner.department ? encodeURIComponent(`${portal.owner.id}:${portal.owner.department}`) : portal.owner.id
  await axios.delete(
    `${config.dataFairUrl}/api/v1/settings/${portal.owner.type}/${id}/publication-sites/data-fair-portals/${portal._id}`,
    { headers: { cookie } }
  )
}

const router = module.exports = express.Router()

// List user portals, or all portals for super admin
router.get('', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const filter = {}
  if (req.query.owner) {
    const [ownerType, ownerId, ownerDepartment] = req.query.owner.split(':')
    if (ownerType === 'user' && ownerId !== req.user.id) {
      return res.status(403).send('Vous n\'êtes pas l\'utilisateur demandé.')
    }
    const userOrg = req.user.organizations.find(o => o.id === ownerId)
    if (ownerType === 'organization' && !userOrg) {
      return res.status(403).send('Vous n\'appartenez pas à l\'organisation demandée.')
    }
    if (ownerType === 'organization' && userOrg && userOrg.department && userOrg.department !== ownerDepartment) {
      return res.status(403).send('Vous n\'appartenez pas au département demandé.')
    }
    filter['owner.type'] = ownerType
    filter['owner.id'] = ownerId
    if (ownerDepartment) filter['owner.department'] = ownerDepartment
  } else if (!req.user.isAdmin) {
    return res.status(403).send('Seul un super administrateur peut requêter la liste des portails sans filtre sur propriétaire.')
  }
  res.send((await req.app.get('db').collection('portals').find(filter).limit(10000).toArray()).map(cleanPortal))
}))

// Create a new portal (cannot be used to update)
router.post('', asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const collection = req.app.get('db').collection('portals')
  const portal = req.body
  portal.config = cleanConfig(portal.config || configDefaults)
  portal.configDraft = cleanConfig(portal.configDraft || configDefaults)
  if (portal._id) return res.status(400).send('You cannot specify the id of the created portal')
  if (portal.host) return res.status(400).send('You cannot specify the host of the created portal')
  portal._id = shortid.generate()
  portal.owner = {
    type: req.user.organization ? 'organization' : 'user',
    id: req.user.organization ? req.user.organization.id : req.user.id,
    name: req.user.organization ? req.user.organization.name : req.user.name
  }
  if (req.user.organization && req.user.organization.department) {
    portal.owner.department = req.user.organization.department
  }
  if (portal.owner.type === 'organization' && req.user.organization.role !== 'admin') {
    return res.status(403).send('Vous devez être administrateur de l\'organisation pour modifier le portail.')
  }
  if (!validatePortal(portal)) return res.status(400).send(validatePortal.errors)
  const existingPortal = await collection.findOne({ _id: portal._id })
  if (existingPortal) {
    return res.status(409).send('Ce portail existe déjà.')
  }
  await collection.insertOne(portal)
  await syncPortalUpdate(portal, req.headers.cookie)
  res.send(cleanPortal(portal, req.params.html === true))
}))

// Read the portal matching a request, check that the user is owner
async function setPortal (req, res, next) {
  if (!req.user) return res.status(401).send()
  const portal = await req.app.get('db')
    .collection('portals').findOne({ _id: req.params.id }, { owner: true })
  if (!portal) return res.status(404).send('Portail inconnu')
  if (portal.owner.type === 'organisation') {
    const orga = req.user.organizations.find(o => o.id === portal.owner.id)
    if (!orga || orga.role !== 'admin') return res.status(403).send('admin only')
    if (orga.department && orga.department !== portal.owner.department) return res.status(403).send('wrong department')
  }
  if (portal.owner.type === 'user' && req.user.id !== portal.owner.id) {
    return res.status(403).send('user himself only')
  }
  req.portal = portal
  next()
}

// Get an existing portal as the owner
router.get('/:id', asyncWrap(setPortal), asyncWrap(async (req, res) => {
  if (req.query.noConfig === 'true') {
    delete req.portal.config
    delete req.portal.configDraft
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
    .findOneAndUpdate({ _id: req.params.id }, { $set: { host: req.body } }, { returnOriginal: false })).value
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
  const pages = req.app.get('db').collection('pages')
  const filter = { 'portal._id': req.params.id }
  if (!req.user) filter.public = true
  else if (portal.owner.type === 'user' && portal.owner.id !== req.user.id) filter.public = true
  else if (portal.owner.type === 'organization' && (!req.user.organization || portal.owner.id !== req.user.organization.id)) filter.public = true
  else if (portal.owner.type === 'organization' && req.user.organization && req.user.organization.department && req.user.organization.department !== portal.owner.department) filter.public = true
  if (req.query.published === 'true') filter.published = true
  const [results, count] = await Promise.all([
    pages.find(filter).limit(1000).project(project).toArray(),
    pages.countDocuments(filter)
  ])
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
  const baseId = slug(req.body.title, { lower: true })
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
  const project = req.query.select ? Object.assign({}, ...req.query.select.split(',').map(f => ({ [f]: 1 }))) : {}
  const uses = req.app.get('db').collection('uses')
  const filter = {
    'portal._id': req.params.id,
    status: 'published',
    'owner.type': req.portal.owner.type,
    'owner.id': req.portal.owner.id
  }
  if (req.query.owner === 'me') {
    filter['owner.type'] = 'user'
    filter['owner.id'] = req.user.id
    filter.status = 'draft'
  } else if (req.query.creator === 'me') {
    filter['created.id'] = req.user.id
    filter.status = { $in: ['waitingForValidation', 'published'] }
  } else if (req.query.status) {
    // only owner of portal can filter on
    // we use setPortal just to check that the user is owner
    await setPortal(req, res, next)
    filter.status = req.query.status
  }
  const [results, count] = await Promise.all([
    uses.find(filter).limit(10000).project(project).toArray(),
    uses.countDocuments(filter)
  ])
  res.json({ count, results })
}))

// Create a use
router.post('/:id/uses', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  req.body._id = req.body.slug = nanoid()
  req.body.portal = {
    _id: req.portal._id,
    title: req.portal.title
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
  req.body.status = 'draft'
  const valid = validateUse(req.body)
  if (!valid) return res.status(400).send(validateUse.errors)
  await req.app.get('db').collection('uses').insertOne(req.body)
  cleanUse(req.body, req.query.html === 'true')
  res.status(200).send(req.body)
}))

router.patch('/:id/uses/:useId', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    await setPortal(req, res, next)
  }
  const acceptedParts = Object.keys(useSchema.properties).filter(k => !useSchema.properties[k].readOnly)
  for (const key in req.body) {
    if (!acceptedParts.includes(key)) return res.status(400).send('Unsupported patch part ' + key)
  }
  req.body.slug = req.body.slug || req.body.id
  req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
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
  const patchedUse = Object.assign({}, use, req.body)
  const valid = validateUse(JSON.parse(JSON.stringify(patchedUse)))
  if (!valid) return res.status(400).send(validateUse.errors)

  await req.app.get('db').collection('uses').findOneAndUpdate({ _id: req.params.useId, 'portal._id': req.portal._id }, patch)
  cleanPage(patchedUse, req.query.html === 'true')
  res.status(200).send(patchedUse)
}))

router.delete('/:id/uses/:useId', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    // we use setPortal just to check that the user is owner
    await setPortal(req, res, next)
  }
  await req.app.get('db').collection('uses').deleteOne({ id: req.params.pageId, 'portal._id': req.portal._id })
  res.status(204).send()
}))

router.post('/:id/uses/:useId/_submit', asyncWrap(setPortalAnonymous), asyncWrap(async (req, res, next) => {
  const db = req.app.get('db')
  const use = await db.collection('uses').findOne({ _id: req.params.useId, 'portal._id': req.portal._id })
  if (!use) return res.status(404).send('use not found')
  if (use.owner.type !== 'user' || use.owner.id !== req.user.id) {
    // we use setPortal just to check that the user is owner
    await setPortal(req, res, next)
  }
  const baseSlug = slug(use.title, { lower: true })
  let useSlug = baseSlug
  let updateOk = false
  let i = 1
  while (!updateOk) {
    try {
      await req.app.get('db').collection('uses').updateOne(
        { _id: req.params.useId },
        { $set: { slug: useSlug, owner: req.portal.owner, status: 'waitingForValidation' } })
      updateOk = true
    } catch (err) {
      if (err.code !== 11000) throw err
      i += 1
      useSlug = `${baseSlug}-${i}`
    }
  }
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
