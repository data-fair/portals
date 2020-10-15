const express = require('express')
// const ajv = require('ajv')()
const configurationchema = require('../../contract/config')
// const validate = ajv.compile(configurationchema)
const asyncWrap = require('../utils/async-wrap')
const defaults = require('json-schema-defaults')

const schemaNoAllOf = JSON.parse(JSON.stringify(configurationchema))
schemaNoAllOf.properties = {}
// schemaNoAllOf.allOf.forEach(a => {
//   Object.values(a.properties).forEach(p => {
//     if (p.dependencies) Object.assign(p.properties, p.dependencies.active.properties)
//   })
// })
Object.assign(schemaNoAllOf.properties, ...schemaNoAllOf.allOf.map(a => a.properties))
delete schemaNoAllOf.allOf

const router = express.Router()

// Read a preference
router.get('', asyncWrap(async (req, res, next) => {
  const configuration = await req.app.get('db').collection('configuration')
    .findOne({})
  res.status(200).json(Object.assign(defaults(schemaNoAllOf), configuration || {}))
}))

// Create or update user configuration
router.post('', asyncWrap(async (req, res, next) => {
  const configuration = await req.app.get('db').collection('configuration')
    .findOne({ _id: req.user.id }, { _id: 0 }) || {}
  const update = Object.assign(defaults(schemaNoAllOf), configuration, req.body, { _id: req.user.id })
  // const valid = validate(update)
  // if (!valid) return res.status(400).send(validate.errors)
  // await req.app.get('db').collection('configuration').updateOne({ _id: req.user.id }, { $set: update }, { upsert: true })
  res.status(200).json(update)
}))

module.exports = router
