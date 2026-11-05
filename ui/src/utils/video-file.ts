export type VideoProbe = { width: number, height: number, duration: number, poster?: Blob }

// the browser that will play the file is the best judge of what it can decode
export const probeVideo = (file: File) => new Promise<VideoProbe>((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.preload = 'auto'
  video.src = url
  const done = (fn: () => void) => {
    URL.revokeObjectURL(url)
    fn()
  }
  video.onerror = () => done(() => reject(new Error('unreadable')))
  video.onloadedmetadata = () => {
    if (!video.videoWidth) return done(() => reject(new Error('unreadable')))
    video.currentTime = Math.min(video.duration / 10, 5)
  }
  video.onseeked = () => {
    const { videoWidth: width, videoHeight: height, duration } = video
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(width, 1280)
    canvas.height = Math.round(height * canvas.width / width)
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => done(() => resolve({ width, height, duration, poster: blob ?? undefined })), 'image/webp', 0.8)
  }
})

// without faststart the moov box sits after mdat and playback has to fetch the end of the file first
export const hasFaststart = async (file: File) => {
  let offset = 0
  while (offset + 8 <= file.size) {
    const view = new DataView(await file.slice(offset, offset + 16).arrayBuffer())
    const type = String.fromCharCode(view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7))
    if (type === 'moov') return true
    if (type === 'mdat') return false
    const size = view.getUint32(0)
    offset += size === 1 ? Number(view.getBigUint64(8)) : size
    if (size === 0) return false
  }
  return false
}
