import express from 'express'
import type { IngressManagerIngressInfo } from '../api/types/index.ts'
import { assertReqInternalSecret } from '@data-fair/lib-express/index.js'

const app = express()
app.use(express.json())

app.post('/api/ingress', (req, res, next) => {
  assertReqInternalSecret(req, 'SECRET_INGRESS')
  const body = req.body as IngressManagerIngressInfo
  const url = new URL(body.url)
  if (url.port !== '5607') {
    res.status(400).send('in dev env only 5607 port is allowed')
    return
  }
  console.log(`Received ingress definition, make sure the host is aliased in /etc/hosts:

# dev portal ${body._id}
127.0.0.1 ${url.host}
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
