export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Redirect /explore to /datasets
  if (path === '/explore/' || path === '/explore') {
    return sendRedirect(event, '/datasets', 302)
  }

  // Redirect /explore/dataset/:id to /datasets/:id
  if (path.startsWith('/explore/dataset/')) {
    const id = path.replace('/explore/dataset/', '').split('/')[0]
    return sendRedirect(event, `/datasets/${id}`, 302)
  }

  // Redirect /datasets/:id/full to /datasets/:id/table
  if (path.match(/^\/datasets\/[^/]+\/full$/)) {
    const newPath = `${path.replace('/full', '/table')}${url.search}`
    return sendRedirect(event, newPath, 302)
  }
})
