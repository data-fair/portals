const path = require('path')
const config = require('config')
const fs = require('fs-extra')
const multer = require('multer')
const { nanoid } = require('nanoid')
const sharp = require('sharp')

exports.directory = (portalId, useId) => path.resolve(config.dataDir, portalId, 'prod', 'uses', useId)

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
exports.uploadImage = multer({ storage })

exports.afterUpload = async (req) => {
  if (req.body.body) req.body = JSON.parse(req.body.body)
  const image = req.files && req.files.find(f => f.fieldname === 'image')
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
