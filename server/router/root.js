const express = require('express')

const status = require('../utils/status')

const config = require('config')

const router = express.Router()

let info = { version: process.env.NODE_ENV }
try { info = require('../../BUILD.json') } catch (err) {}
router.get('/info', (req, res) => {
  if (!req.user) return res.status(401).send()
  res.send(info)
})
router.get('/admin/info', (req, res) => {
  if (!req.user) return res.status(401).send()
  if (!req.user.adminMode) return res.status(403).send()
  res.send({ ...info, config })
})

router.get('/status', status.status)
router.get('/ping', status.ping)

module.exports = router
