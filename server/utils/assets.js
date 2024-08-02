const path = require('path')
const fs = require('fs-extra')
const config = require('config')
const sharp = require('sharp')
const hasha = require('hasha')
const multer = require('multer')
const mime = require('mime-types')
const resolvePath = require('resolve-path')
const createError = require('http-errors')
const { fsyncFile } = require('./files')
const promisifyMiddleware = require('./promisify-middleware')
const debug = require('debug')('assets')

const assets = {
  logo: {
    file: 'logo.png',
    size: { height: 80 }
  },
  home: {
    file: 'undraw_Data_points_re_vkpq.png',
    size: { width: 1904 }
  },
  footerBackground: {
    file: 'footer.png',
    size: { height: 300 }
  },
  favicon: {
    file: 'favicon.ico',
    size: { width: 48, height: 48 }
  },
  font1: {
    file: 'font1.woff2'
  },
  font2: {
    file: 'font2.woff2'
  }
}

exports.prepareFitHashedAsset = async (dir, asset) => {
  const originalBuffer = await fs.readFile(resolvePath(dir, asset))
  let buffer
  try {
    debug('use sharp to prepare resized image', asset, assets[asset])
    buffer = await sharp(originalBuffer)
      .resize(assets[asset].size.width, assets[asset].size.height, { fit: 'inside', withoutEnlargement: true })
      .png({ adaptiveFiltering: true, compressionLevel: 9, palette: true })
      .toBuffer()
  } catch (err) {
    console.warn('failure to resize asset image', dir, asset, err)
  }
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (file.startsWith(asset + '-')) {
      debug('remove previous version of the asset', file)
      await fs.remove(path.join(dir, file))
    }
  }
  let hash
  if (buffer && buffer.length <= originalBuffer.length) {
    hash = 'fit-' + (await hasha.async(buffer)).slice(0, 10) + '.png'
    debug('new version of asset is smaller, use it', `${asset}-${hash}`)
    await fs.writeFile(resolvePath(dir, `${asset}-${hash}`), buffer)
  } else {
    hash = (await hasha.async(originalBuffer)).slice(0, 10)
    debug('new version of asset is not smaller, use original', `${asset}-${hash}`)
    await fs.writeFile(resolvePath(dir, `${asset}-${hash}`), originalBuffer)
  }
  return hash
}

exports.fillConfigAssets = async (dir, conf, force) => {
  if (!await fs.pathExists(dir)) return
  const files = await fs.readdir(dir)
  for (const asset in conf.assets || {}) {
    if (!files.includes(asset)) {
      debug('file not found for asset, remove reference', asset)
      delete conf.assets[asset]
    } else {
      const hashedFile = files.find(f => f.startsWith(asset + '-'))
      // this condition should not be necessary, here only to complete missing hashed images from older portals
      // TODO: if the resized file is not smaller than original do not store hash in config ?
      if (hashedFile && !force) {
        debug('use hashed version of file', hashedFile)
        conf.assets[asset].hash = hashedFile.replace(asset + '-', '')
      } else {
        debug('process new hash of asset', asset)
        conf.assets[asset].hash = await exports.prepareFitHashedAsset(dir, asset)
      }
    }
  }
}

// Upload draft resources as the owner
// We upload resources only in a draft folder
// use POST _validate_draft to copy resources to production
const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, req.__uploadDestination)
  },
  filename (req, file, cb) {
    cb(null, req.params.assetId)
  }
})
const getAsset = promisifyMiddleware(multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single('asset'), 'file')

exports.uploadAsset = async (req, res) => {
  if (!assets[req.params.assetId]) throw createError(400, 'asset inconnu ' + req.params.assetId)
  req.__uploadDestination = resolvePath(config.dataDir, path.join(req.params.id, 'draft'))
  const filePath = path.join(req.__uploadDestination, req.params.assetId)
  // creating empty file before streaming then fsync after write seems to fix some weird bugs with NFS
  await fs.ensureFile(filePath)
  await getAsset(req, res)
  await fsyncFile(filePath)
}

exports.downloadAsset = async (req, res) => {
  // accept buffering and caching of this response in the reverse proxy
  res.setHeader('X-Accel-Buffering', 'yes')
  if (!assets[req.params.assetId]) return res.status(404).send()
  const draft = req.query.draft === 'true'
  const asset = req.config.assets[req.params.assetId]
  if (!asset) {
    return res.sendFile(path.resolve(__dirname, '../../public/static', assets[req.params.assetId].file), {
      headers: { 'cache-control': 'public,max-age=0' }
    })
  }
  const portalDir = resolvePath(config.dataDir, path.join(req.params.id, draft ? 'draft' : 'prod'))
  const filePath = resolvePath(portalDir, req.params.assetId)
  if (req.query.hash && req.query.hash !== 'undefined') {
    const maxAge = draft ? 0 : 31536000
    const headers = { 'cache-control': 'public,max-age=' + maxAge }
    const contentType = mime.contentType(req.query.hash) || mime.contentType(asset.name)
    if (contentType) headers['content-type'] = contentType
    return res.sendFile(`${filePath}-${req.query.hash}`, { headers })
  } else {
    const headers = { 'cache-control': 'public,max-age=0' }
    const contentType = mime.contentType(asset.name)
    if (contentType) headers['content-type'] = contentType
    return res.sendFile(filePath, { headers })
  }
}
