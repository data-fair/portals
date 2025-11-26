export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  if (path === '/explore/' || path === '/explore') {
    return sendRedirect(event, '/datasets', 301)
  }

  if (path.startsWith('/explore/dataset/')) {
    const id = path.replace('/explore/dataset/', '').split('/')[0]
    return sendRedirect(event, `/datasets/${id}`, 301)
  }

  if (path.match(/^\/datasets\/[^/]+\/full$/)) {
    const newPath = path.replace('/full', '/table')
    return sendRedirect(event, newPath, 301)
  }
})
