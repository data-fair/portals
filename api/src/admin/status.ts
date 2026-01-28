import type { Request } from 'express'
import type { Db } from 'mongodb'

async function mongoStatus (db: Db) {
  const time = Date.now()
  return db.admin().serverStatus().then(
    status => ({
      status: 'ok',
      name: 'mongodb',
      timeInMs: Date.now() - time
    }),
    err => ({
      status: 'error',
      details: err,
      name: 'mongodb',
      timeInMs: Date.now() - time
    })
  )
}

export async function getStatus (req: Request) {
  let results
  try {
    results = await Promise.all([mongoStatus(req.app.get('db'))])
  } catch (err: any) {
    return {
      status: 'error',
      details: err.toString()
    }
  }
  const errors = results.filter(r => r.status === 'error')
  return {
    status: errors.length ? 'error' : 'ok',
    message: errors.length ? ('Problem with : ' + errors.map(s => s.name).join(', ')) : 'Service is ok',
    details: results
  }
}
