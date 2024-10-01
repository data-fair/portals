const express = require('express')
const status = require('../utils/status')
const asyncWrap = require('../utils/async-wrap')

const router = module.exports = express.Router()

// All routes in the router are only for the super admins of the service
router.use(asyncWrap(async (req, res, next) => {
  if (!req.user) return res.status(401).type('text/plain').send()
  if (!req.user.adminMode) return res.status(403).type('text/plain').send()
  next()
}))

let info = { version: process.env.NODE_ENV }
try { info = require('../../BUILD.json') } catch (err) {}
router.get('/info', (req, res) => {
  res.send(info)
})

router.get('/status', (req, res, next) => {
  status.status(req, res, next)
})
