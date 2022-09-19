const config = require('config')
const dayjs = require('dayjs')
const axios = require('axios')
const fs = require('fs-extra')
const asyncWrap = require('../utils/async-wrap')

async function mongoStatus (req) {
  await req.app.get('db').admin().serverStatus()
}

async function jwksStatus (req) {
  const jwks = (await axios.get(config.directoryUrl + '/.well-known/jwks.json')).data
  if (!jwks || !jwks.keys || !jwks.keys.length) throw new Error('Incomplete JWKS response')
}

async function nuxtStatus (req) {
  if (process.env.NODE_ENV === 'test') return
  const nuxtConfig = require('../../nuxt.config.js')
  const dir = nuxtConfig.buildDir || '.nuxt'
  await fs.writeFile(`${dir}/check-access.txt`, 'ok')
  if (req.app.get('nuxt')) await req.app.get('nuxt').renderRoute('/')
}

async function dataDirStatus (req) {
  const dir = config.dataDir
  await fs.writeFile(`${dir}/check-access.txt`, 'ok')
}

async function singleStatus (req, fn, name) {
  const time = dayjs()
  try {
    await fn(req)
    return { status: 'ok', name, timeInMs: dayjs().diff(time) }
  } catch (err) {
    return { status: 'error', message: err.toString(), name, timeInMs: dayjs().diff(time) }
  }
}

async function getStatus (req) {
  const results = await Promise.all([
    singleStatus(req, mongoStatus, 'mongodb'),
    singleStatus(req, jwksStatus, 'auth-directory'),
    singleStatus(req, nuxtStatus, 'nuxt'),
    singleStatus(req, dataDirStatus, 'data-dir')
  ])
  const errors = results.filter(r => r.status === 'error')
  return {
    status: errors.length ? 'error' : 'ok',
    message: errors.length ? ('Problem with : ' + errors.map(s => s.name).join(', ')) : 'Service is ok',
    details: results
  }
}

exports.status = asyncWrap(async (req, res, next) => {
  const status = await getStatus(req)
  res.send(status)
})

exports.ping = asyncWrap(async (req, res, next) => {
  const status = await getStatus(req)
  if (status.status === 'error') res.status(500).send(status)
  else res.send(status.status)
})
