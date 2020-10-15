import Vue from 'vue'

Vue.filter('bytes', function (bytes) {
  const sizes = ['Octets', 'Ko', 'Mo', 'Go']
  if (bytes === 0) return '0 Octet'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)))
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / (1000 ** i)).toFixed(2)} ${sizes[i]}`
})
