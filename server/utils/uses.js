const path = require('path')
const config = require('config')
const fs = require('fs-extra')
const multer = require('multer')
const { nanoid } = require('nanoid')
const resolvePath = require('resolve-path')
const promisifyMiddleware = require('./promisify-middleware')
const sharp = require('sharp')

const portalDir = (portalId) => resolvePath(config.dataDir, portalId)
const usesDir = (portalId) => path.join(portalDir(portalId), 'prod', 'uses')

exports.directory = (portalId, useId) => resolvePath(usesDir(portalId), useId)

// Upload draft resources as the owner
// We upload resources only in a draft folder
// use POST _validate_draft to copy resources to production
const storage = multer.diskStorage({
  async destination (req, file, cb) {
    req.params.useId = req.params.useId || nanoid()
    const dir = exports.directory(req.params.id, req.params.useId)
    await fs.ensureDir(dir)
    cb(null, dir)
  },
  filename (req, file, cb) {
    cb(null, 'image')
  }
})
const getImage = promisifyMiddleware(multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single('image'), 'file')

exports.uploadImage = async (req, res) => {
  const image = await getImage(req, res)
  if (req.body.body) req.body = JSON.parse(req.body.body)
  if (image) {
    req.body.image = {
      name: image.originalname,
      type: image.mimetype,
      size: image.size
    }
    await sharp(image.path)
      .resize(600, null, { fit: 'inside', withoutEnlargement: true })
      .png({ adaptiveFiltering: true, compressionLevel: 9, palette: true })
      .toFile(image.path + '-thumbnail.png')
  }
}
