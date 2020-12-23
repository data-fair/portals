module.exports.adminRequired = (req, res, next) => {
  if (!req.user) return res.status(401).send()
  if (!req.user.adminMode) return res.status(403).send()
  next()
}
