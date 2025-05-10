"use client"

import { useState, useEffect } from "react"
import { getPlaceholderImage } from "../../utils/placeholderUtils"

const MediaLoader = ({
  src,
  alt,
  className = "",
  type = "IMAGE",
  withFallback = true,
  placeholderWidth = 200,
  placeholderHeight = 200,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [error, setError] = useState(false)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src)
    setError(false)
    setFallbackAttempted(false)
    setLoading(true)
  }, [src])

  // Try to create a direct URL from the original URL
  const createDirectUrl = (url) => {
    if (!url) return null

    // Extract filename from URL
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1]

    // If we have a filename, create a direct URL
    if (filename && filename.includes(".")) {
      // Try different base paths
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"

      // Try different paths - this helps with different server configurations
      const possiblePaths = [
        `${apiUrl}/uploads/${filename}`,
        `${apiUrl}/media/${filename}`,
        `${apiUrl}/images/${filename}`,
        `${apiUrl}/static/uploads/${filename}`,
        `${apiUrl}/api/media/${filename}`,
        `/uploads/${filename}`, // Relative path
        `/media/${filename}`, // Relative path
      ]

      console.log("Trying alternative paths:", possiblePaths)
      return possiblePaths[0] // Return the first option as default
    }

    return null
  }

  const handleError = () => {
    console.error(`Error loading media: ${currentSrc}`)

    if (withFallback && !fallbackAttempted) {
      setFallbackAttempted(true)

      // Try a direct URL as fallback
      const directUrl = createDirectUrl(src)
      if (directUrl && directUrl !== currentSrc) {
        console.log(`Trying fallback URL: ${directUrl}`)
        setCurrentSrc(directUrl)
        return
      }

      // If the URL contains "localhost:8080", try with just the filename
      if (src && src.includes("localhost:8080")) {
        const filename = src.split("/").pop()
        if (filename) {
          const relativePath = `/uploads/${filename}`
          console.log(`Trying relative path: ${relativePath}`)
          setCurrentSrc(relativePath)
          return
        }
      }
    }

    // If we've already tried a fallback or don't have one, show error state
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  if (type === "VIDEO" || (src && src.match(/\.(mp4|webm|ogg)$/i))) {
    return (
      <video
        controls
        className={`${className} ${error ? "media-error" : ""}`}
        onError={handleError}
        onLoadedData={handleLoad}
        style={{ maxWidth: "100%", height: "auto" }}
      >
        <source src={currentSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }

  // Default to image
  return (
    <>
      {loading && <div className="media-loading">Loading...</div>}

      {error ? (
        <div className="media-error">
          <img
            src={
              getPlaceholderImage(placeholderWidth, placeholderHeight, "Image not available") || "/default-avatar.png"
            }
            alt={alt || "Media not available"}
            className={`${className} placeholder-image`}
          />
        </div>
      ) : (
        <img
          src={currentSrc || "/default-avatar.png"}
          alt={alt || "Media"}
          className={`${className} ${loading ? "loading" : "loaded"}`}
          onError={handleError}
          onLoad={handleLoad}
          crossOrigin="anonymous"
          style={{ display: loading ? "none" : "block" }}
        />
      )}
    </>
  )
}

export default MediaLoader
