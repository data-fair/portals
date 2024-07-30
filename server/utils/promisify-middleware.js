const createError = require('http-errors')

module.exports = (middleware, reqProperty) => {
  return async (req, res) => new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return reject(createError(413, 'La taille de fichier est limitée à 10 Mo.'))
        }
        return reject(err)
      }
      resolve(req[reqProperty])
    })
  })
}
