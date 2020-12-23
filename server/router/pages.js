const express = require('express')
const ajv = require('ajv')()
const slug = require('slugify')
const pageSchema = require('../../contract/page.json')
const validate = ajv.compile(pageSchema)
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()
const adminRequired = require('../utils/auth').adminRequired

// Get the list of pages

router.get('', asyncWrap(async (req, res, next) => {
  let size = 12
  if (req.query.size && !isNaN(parseInt(req.query.size))) size = parseInt(req.query.size)
  let page = 1
  if (req.query.page && !isNaN(parseInt(req.query.page))) page = parseInt(req.query.page)
  const project = req.query.select ? Object.assign({}, ...req.query.select.split(',').map(f => ({ [f]: 1 }))) : {}
  const pages = req.app.get('db').collection('pages')
  const [results, count] = await Promise.all([
    size > 0 ? pages.find().limit(size).skip((page - 1) * size).project(project).toArray() : Promise.resolve([]),
    pages.countDocuments()
  ])
  res.json({ count, results })
}))

// Create a page
router.post('', adminRequired, asyncWrap(async (req, res, next) => {
  const baseId = slug(req.body.title, { lower: true })
  req.body._id = baseId
  req.body.created = req.body.updated = {
    id: req.user.id,
    name: req.user.name,
    date: new Date().toISOString()
  }
  const valid = validate(req.body)
  if (!valid) return res.status(400).send(validate.errors)
  let insertOk = false
  let i = 1
  while (!insertOk) {
    try {
      await req.app.get('db').collection('pages').insertOne(req.body)
      insertOk = true
    } catch (err) {
      if (err.code !== 11000) throw err
      i += 1
      req.body._id = `${baseId}-${i}`
    }
  }
  res.status(200).json(req.body)
}))

// Patch some of the attributes of a page

router.patch('/:id', adminRequired, asyncWrap(async (req, res, next) => {
  const page = await req.app.get('db').collection('pages').findOne({ _id: req.params.id })
  if (!page) return res.status(404)
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
  var valid = validate(JSON.parse(JSON.stringify(patchedPage)))
  if (!valid) return res.status(400).send(validate.errors)

  await req.app.get('db').collection('pages').findOneAndUpdate({ _id: req.params.id }, patch)
  res.status(200).json(patchedPage)
}))

// Read a page
router.get('/:id', asyncWrap(async (req, res, next) => {
  const page = await req.app.get('db').collection('pages').findOne({ _id: req.params.id })
  if (!page) return res.status(404).send()
  res.status(200).json(page)
}))

router.delete('/:id', adminRequired, asyncWrap(async (req, res, next) => {
  await req.app.get('db').collection('pages').deleteOne({ _id: req.params.id })
  res.sendStatus(204)
}))

module.exports = router
