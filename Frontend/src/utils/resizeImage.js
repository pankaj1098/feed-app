// Shrinks a picked image in the browser before upload. Phone cameras often
// produce 48–200 MP photos; ImageKit refuses to serve anything above 25 MP
// (ELIMIT) and big files are slow to upload, so we cap the longest side.
const DEFAULT_MAX_SIDE = 2560
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024

async function loadImage(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Fall through to <img> decoding below.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function resizeImage(file, { maxSide = DEFAULT_MAX_SIDE, quality = 0.88 } = {}) {
  const image = await loadImage(file)
  const width = image.width
  const height = image.height
  const scale = Math.min(1, maxSide / Math.max(width, height))

  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    image.close?.()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  image.close?.()

  // PNG keeps transparency; everything else becomes a compact JPEG/WebP.
  const type = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg'
  const blob = await new Promise(resolve => canvas.toBlob(resolve, type, quality))
  if (!blob) return file

  const extension = type.split('/')[1].replace('jpeg', 'jpg')
  const name = file.name.replace(/\.[^.]+$/, '') + '.' + extension
  return new File([blob], name, { type, lastModified: Date.now() })
}
