const config = require('config')
const fs = require('fs-extra')
const path = require('path')
const express = require('express')
const slug = require('slugify')
const shortid = require('shortid')
const multer = require('multer')
const Ajv = require('ajv')
const ajv = new Ajv()
const portalSchema = require('../../contract/portal')
const validatePortal = ajv.compile(portalSchema)
const pageSchema = require('../../contract/page.json')
const validatePage = ajv.compile(pageSchema)
const asyncWrap = require('../utils/async-wrap')
const session = require('@koumoul/sd-express')({
  publicUrl: config.publicUrl,
  directoryUrl: config.directoryUrl,
  cookieDomain: config.sessionDomain,
})

const configSchemaNoAllOf = JSON.parse(JSON.stringify(portalSchema.properties.config))
configSchemaNoAllOf.allOf.forEach(a => {
  Object.values(a.properties).forEach(p => {
    if (p.dependencies) Object.assign(p.properties, p.dependencies.active.properties)
  })
})
configSchemaNoAllOf.properties = Object.assign({}, ...configSchemaNoAllOf.allOf.map(a => a.properties))
delete configSchemaNoAllOf.allOf
const configDefaults = require('json-schema-defaults')(configSchemaNoAllOf)

function cleanPortal(portal) {
  portal.draftLink = `${config.publicUrl}?portalId=${portal._id}&draft=true`
  portal.link = portal.host ? `https://${portal.host}` : `${config.publicUrl}?portalId=${portal._id}`
  return portal
}

const router = module.exports = express.Router()

// List user portals, or all portals for super admin
router.get('', session.auth, asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const filter = {}
  if (req.query.owner) {
    const [ownerType, ownerId] = req.query.owner.split(':')
    if (ownerType === 'user' && ownerId !== req.user.id) {
      return res.status(403).send('Vous n\'êtes pas l\'utilisateur demandé.')
    }
    if (ownerType === 'organization' && !req.user.organizations.find(o => o.id === ownerId)) {
      return res.status(403).send('Vous n\'appartenez pas à l\'organisation demandée.')
    }
    filter['owner.type'] = ownerType
    filter['owner.id'] = ownerId
  } else if (!req.user.isAdmin) {
    return res.status(403).send('Seul un super administrateur peut requêter la liste des portails sans filtre sur propriétaire.')
  }
  res.send((await req.app.get('db').collection('portals').find(filter).limit(10000).toArray()).map(cleanPortal))
}))

// Create a new portal (cannot be used to update)
router.post('', session.auth, asyncWrap(async (req, res) => {
  if (!req.user) return res.status(401).send()
  const collection = req.app.get('db').collection('portals')
  const portal = req.body
  portal.config = portal.config || configDefaults
  portal.configDraft = portal.configDraft || configDefaults
  if (portal._id) return res.status(400).send('You cannot specify the id of the created portal')
  if (portal.host) return res.status(400).send('You cannot specify the host of the created portal')
  portal._id = shortid.generate()
  portal.owner = {
    type: req.user.organization ? 'organization' : 'user',
    id: req.user.organization ? req.user.organization.id : req.user.id,
    name: req.user.organization ? req.user.organization.name : req.user.name,
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
  res.send(cleanPortal(portal))
}))

// Read the portal matching a request, check that the user is owner
async function setPortal(req, res, next) {
  if (!req.user) return res.status(401).send()
  const portal = await req.app.get('db')
    .collection('portals').findOne({ _id: req.params.id }, { owner: true })
  if (!portal) return res.status(404).send('Portail inconnu')
  if (portal.owner.type === 'organisation') {
    const orga = req.user.organizations.find(o => o.id === portal.owner.id)
    if (!orga || orga.role !== 'admin') return res.status(403).send()
  }
  if (portal.owner.type === 'user' && req.user.id !== portal.owner.id) {
    return res.status(403).send()
  }
  req.portal = portal
  next()
}

// Get an existing portal as the owner
router.get('/:id', session.auth, setPortal, asyncWrap(async(req, res) => {
  res.send(cleanPortal(req.portal))
}))

// Delete an existing portal as the owner
router.delete('/:id', session.auth, setPortal, asyncWrap(async(req, res) => {
  await req.app.get('db')
    .collection('portals').deleteOne({ _id: req.params.id })
  if (await fs.pathExists(`data/${req.params.id}`)) await fs.remove(`data/${req.params.id}`)
  res.send()
}))

// Update the draft configuration as the owner
router.put('/:id/configDraft', session.auth, setPortal, asyncWrap(async(req, res) => {
  req.body.updatedAt = new Date().toISOString()
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, { $set: { configDraft: req.body } })
  res.send()
}))

// Upload draft resources as the owner
// We upload resources only in a draft folder
// use POST _validate_draft to copy resources to production
const storage = multer.diskStorage({
  async destination(req, file, cb) {
    const dir = `data/${req.portal._id}/draft`
    if (!await fs.exists(dir)) await fs.ensureDir(dir)
    cb(null, dir)
  },
  filename(req, file, cb) {
    cb(null, req.params.assetId)
  },
})
const upload = multer({ storage })
router.post('/:id/assets/:assetId', session.auth, setPortal, upload.any(), asyncWrap(async(req, res) => {
  res.send()
}))
router.get('/:id/assets/:assetId', asyncWrap(async(req, res) => {
  const draft = req.query.draft === 'true'
  res.sendFile(path.join(process.cwd(), `data/${req.params.id}/${draft ? 'draft' : 'prod'}/${req.params.assetId}`))
}))

// Validate the draft as the owner
// Both configuration and uploaded resources
router.post('/:id/_validate_draft', session.auth, setPortal, asyncWrap(async(req, res) => {
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, {
      $set: {
        config: {
          ...req.portal.configDraft,
          updatedAt: new Date().toISOString(),
        },
      },
    })
  if (await fs.exists(`data/${req.portal._id}/draft`)) {
    await fs.copy(`data/${req.portal._id}/draft`, `data/${req.portal._id}/prod`)
  }
  res.send()
}))
router.post('/:id/_cancel_draft', session.auth, setPortal, asyncWrap(async(req, res) => {
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.portal._id }, { $set: { configDraft: req.portal.config } })
  if (await fs.exists(`data/${req.portal._id}/prod`)) {
    await fs.copy(`data/${req.portal._id}/prod`, `data/${req.portal._id}/draft`)
  }
  res.send()
}))

// Define the exposition host as super admin
router.put('/:id/host', session.auth, asyncWrap(async(req, res) => {
  if (!req.user) return res.status(401).send()
  if (!req.user.isAdmin) return res.status(403).send()
  await req.app.get('db')
    .collection('portals').updateOne({ _id: req.params.id }, { $set: { host: req.body } })
  res.send()
}))

// Public access to the portal configuration, except for the draft that is reserved to owner
router.get('/:id/config', session.auth, asyncWrap(async (req, res) => {
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

  res.send(config)
}))

// Get the list of pages
router.get('/:id/pages', session.auth, asyncWrap(async (req, res, next) => {
  const project = req.query.select ? Object.assign({}, ...req.query.select.split(',').map(f => ({ [f]: 1 }))) : {}
  const pages = req.app.get('db').collection('pages')
  const filter = { 'portal._id': req.params.id }
  const [results, count] = await Promise.all([
    pages.find(filter).limit(1000).project(project).toArray(),
    pages.countDocuments(filter),
  ])
  res.json({ count, results })
}))

// Get a page
router.get('/:id/pages/:pageId', session.auth, asyncWrap(async (req, res, next) => {
  const page = await req.app.get('db').collection('pages').findOne({ id: req.params.pageId, 'portal._id': req.params.id })
  if (!page) return res.status(404).send()
  res.status(200).json(page)
}))

// Create a page
router.post('/:id/pages', setPortal, asyncWrap(async (req, res, next) => {
  const baseId = slug(req.body.title, { lower: true })
  req.body.id = baseId
  req.body.portal = {
    _id: req.portal._id,
    title: req.portal.title,
  }
  req.body.created = req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString(),
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
  res.status(200).send(req.body)
}))

// Patch some of the attributes of a page
router.patch('/:id/pages/:pageId', setPortal, asyncWrap(async (req, res, next) => {
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
    date: new Date().toISOString(),
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
  var valid = validatePage(JSON.parse(JSON.stringify(patchedPage)))
  if (!valid) return res.status(400).send(validatePage.errors)

  await req.app.get('db').collection('pages').findOneAndUpdate(filter, patch)
  res.status(200).send(patchedPage)
}))

router.delete('/:id/pages/:pageId', setPortal, asyncWrap(async (req, res, next) => {
  await req.app.get('db').collection('pages').deleteOne({ id: req.params.pageId, 'portal._id': req.portal._id })
  res.status(204).send()
}))
