module.exports = {
  publicUrl: 'http://localhost:6200',
  port: 6200,
  directoryUrl: 'http://localhost:6200/simple-directory',
  dataFairUrl: 'http://localhost:6200/data-fair',
  openapiViewerUrl: 'http://localhost:6200/openapi-viewer',
  sessionDomain: null,
  mongo: {
    host: 'localhost',
    port: 27017,
    db: 'data-fair-portals-' + (process.env.NODE_ENV || 'development'),
  },
}
