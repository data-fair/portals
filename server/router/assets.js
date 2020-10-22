const express = require('express')
const Binary = require('mongodb').Binary
const fileUpload = require('express-fileupload')
const asyncWrap = require('../utils/async-wrap')
const path = require('path')

const router = express.Router()

const assets = {
  logo: {
    file: 'logo.png',
    mimeType: 'image/png'
  },
  home: {
    file: 'undraw_Data_points_re_vkpq.png',
    mimeType: 'image/jpeg'
  },
  favicon: {
    file: 'favicon.ico',
    mimeType: 'image/x-icon'
  }
}

router.get('/:type', asyncWrap(async (req, res, next) => {
  if (!assets[req.params.type]) return res.status(404).send()
  const db = req.app.get('db')
  const asset = await db.collection('assets').findOne({ type: req.params.type })
  if (asset) {
    res.type(asset.mimeType)
    res.send(asset.data.buffer)
  } else {
    res.type(assets[req.params.type].mimeType)
    res.sendFile(path.resolve(__dirname, '../../public/static', assets[req.params.type].file))
  }
}))

router.put('/:type', fileUpload({ limits: { fileSize: 1 * 1024 * 1024 } }), asyncWrap(async (req, res, next) => {
  if (!assets[req.params.type]) return res.status(400).send()
  // if (!req.activeAccount || req.activeAccount.type === 'user') return res.status(401).send('No active account or active account is not an organization')
  // if (req.activeAccountRole !== 'admin') return res.status(403).send('Only admins can edit settings')
  if (!req.files.asset) return res.status(400).send('Asset file required')
  await req.app.get('db').collection('assets').replaceOne(
    { type: req.params.type },
    { type: req.params.type, data: Binary(req.files.asset.data), mimeType: req.files.asset.mimetype },
    { upsert: true }
  )
  res.status(200).send()
}))

module.exports = router
