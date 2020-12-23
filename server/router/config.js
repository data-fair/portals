const express = require('express')
const ajv = require('ajv')({ useDefaults: true })
const configurationchema = require('../../contract/config')
const asyncWrap = require('../utils/async-wrap')
const adminRequired = require('../utils/auth').adminRequired
// const defaults = require('json-schema-defaults')

const schemaNoAllOf = JSON.parse(JSON.stringify(configurationchema))
schemaNoAllOf.properties = {}
// schemaNoAllOf.allOf.forEach(a => {
//   Object.values(a.properties).forEach(p => {
//     if (p.dependencies) Object.assign(p.properties, p.dependencies.active.properties)
//   })
// })
Object.assign(schemaNoAllOf.properties, ...schemaNoAllOf.allOf.map(a => a.properties))
delete schemaNoAllOf.allOf
delete schemaNoAllOf.properties.themeColor.format
delete schemaNoAllOf.properties.footerColor.format
const validate = ajv.compile(schemaNoAllOf)

const router = express.Router()

// Read a preference
router.get('', asyncWrap(async (req, res, next) => {
  const configuration = (await req.app.get('db').collection('configuration')
    .findOne({ _id: 'main' }, { _id: 0 })) || {}
  validate(configuration)
  res.status(200).json(Object.assign(configuration))
}))

// Create or update user configuration
router.post('', adminRequired, asyncWrap(async (req, res, next) => {
  // const configuration = await req.app.get('db').collection('configuration')
  //   .findOne({ _id: 'main' }, { _id: 0 }) || {}
  if (!validate(req.body)) return res.status(400).send(validate.errors)
  // const valid = validate(update)
  // if (!valid) return res.status(400).send(validate.errors)
  await req.app.get('db').collection('configuration').replaceOne({ _id: 'main' }, req.body, { upsert: true })
  res.status(200).json(req.body)
}))

module.exports = router
