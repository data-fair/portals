const express = require('express')

const status = require('../utils/status')

const router = express.Router()

router.get('/ping', status.ping)

module.exports = router
