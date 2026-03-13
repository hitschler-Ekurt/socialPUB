/**
 * Client-side video thumbnail extraction using HTML5 Canvas.
 * Creates a JPEG snapshot at 25% of video duration (min 1s).
 */

const THUMBNAIL_WIDTH = 320
const JPEG_QUALITY = 0.8

export function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
      video.removeAttribute("src")
      video.load()
    }

    video.addEventListener("error", () => {
      cleanup()
      reject(new Error("Video konnte nicht geladen werden"))
    })

    video.addEventListener("loadedmetadata", () => {
      const seekTime = Math.max(1, video.duration * 0.25)
      video.currentTime = Math.min(seekTime, video.duration)
    })

    video.addEventListener("seeked", () => {
      try {
        const aspectRatio = video.videoHeight / video.videoWidth
        const canvasWidth = THUMBNAIL_WIDTH
        const canvasHeight = Math.round(THUMBNAIL_WIDTH * aspectRatio)

        const canvas = document.createElement("canvas")
        canvas.width = canvasWidth
        canvas.height = canvasHeight

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          cleanup()
          reject(new Error("Canvas-Kontext konnte nicht erstellt werden"))
          return
        }

        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight)

        canvas.toBlob(
          (blob) => {
            cleanup()
            if (!blob) {
              reject(new Error("Thumbnail konnte nicht erstellt werden"))
              return
            }
            resolve(blob)
          },
          "image/jpeg",
          JPEG_QUALITY
        )
      } catch {
        cleanup()
        reject(new Error("Thumbnail-Erstellung fehlgeschlagen"))
      }
    })

    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    video.src = objectUrl
  })
}
