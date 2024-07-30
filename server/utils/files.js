const fs = require('fs-extra')

// try to prevent weird bug with NFS by forcing syncing new files before use
/**
 * @param {string} p
 */
exports.fsyncFile = async (p) => {
  const fd = await fs.open(p, 'r')
  await fs.fsync(fd)
  await fs.close(fd)
}
