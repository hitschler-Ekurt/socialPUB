/**
 * Generates a JPEG thumbnail from a video file using HTML5 Canvas.
 * Captures a frame at 25% of video duration (minimum 1 second).
 * Returns a JPEG Blob at 320px width, proportional height.
 */
export function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    function cleanup() {
      URL.revokeObjectURL(objectUrl)
    }

    video.onloadeddata = () => {
      video.currentTime = Math.max(1, video.duration * 0.25)
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas")
        const targetWidth = 320
        const aspectRatio = video.videoHeight / video.videoWidth
        canvas.width = targetWidth
        canvas.height = Math.round(targetWidth * aspectRatio)

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          cleanup()
          reject(new Error("Canvas-Kontext konnte nicht erstellt werden"))
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            cleanup()
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Thumbnail-Erstellung fehlgeschlagen"))
            }
          },
          "image/jpeg",
          0.8
        )
      } catch (err) {
        cleanup()
        reject(
          new Error(
            `Thumbnail-Erstellung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`
          )
        )
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error("Video konnte nicht geladen werden"))
    }
  })
}
