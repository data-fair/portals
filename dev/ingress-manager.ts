import express from 'express'
import type { IngressManagerIngressInfo } from '../api/types/index.ts'
import { assertReqInternalSecret } from '@data-fair/lib-express/index.js'

const app = express()
app.use(express.json())

app.post('/api/ingress', (req, res, next) => {
  assertReqInternalSecret(req, 'secret-ingress')
  const body = req.body as IngressManagerIngressInfo[]
  let hostAliases = ''
  for (const item of body) {
    const url = new URL(item.url)
    if (url.port !== '5600') {
      res.status(400).send('in dev env only 5600 port is allowed, for example "http://portal1.localhost:5600"')
      return
    }
    if (!url.hostname.endsWith('.localhost')) {
      res.status(400).send('in dev env only *.localhost hostname is allowed, for example "http://portal1.localhost:5600"')
      return
    }
    hostAliases += `127.0.0.1 ${url.hostname}\n`
  }

  console.log(`
Received ingress definitions, make sure hosts are aliased in /etc/hosts:
${hostAliases}
`)

  res.status(201).send()
})

app.delete('/api/ingress/:id', async (req, res, next) => {
  assertReqInternalSecret(req, 'secret-ingress')
  console.log(`
Received request for portal deletion:
${req.params.id}
`)
  res.status(201).send()
})

app.listen(5697, (err) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log('Mock ingress manager listening on port 5697')
})
