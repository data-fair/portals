const express = require('express')

const status = require('../utils/status')

const router = express.Router()

let info = { version: process.env.NODE_ENV }
try { info = require('../../BUILD.json') } catch (err) {}
router.get('/info', (req, res) => {
  if (!req.user) return res.status(401).send()
  res.send(info)
})

router.get('/status', status.status)
router.get('/ping', status.ping)

module.exports = router
