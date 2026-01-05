export default defineEventHandler((event) => {
  // allow Nginx to buffer/cache the response
  setHeader(event, 'X-Accel-Buffering', 'yes')
})
