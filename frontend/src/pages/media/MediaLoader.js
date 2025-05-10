"use client"

import { useState, useEffect } from "react"
import { getPlaceholderImage } from "../../utils/placeholderUtils"

const MediaLoader = ({ src, alt, className, style = {}, type = "IMAGE", withFallback = true }) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [fallbackUsed, setFallbackUsed] = useState(false)

  // Generate alternative URLs to try if the main one fails
  const generateAlternatives = (originalUrl) => {
    if (!originalUrl) return []

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"
    const filename = originalUrl.split("/").pop()

    return [
      originalUrl,
      `${baseUrl}/uploads/${filename}`,
      `${baseUrl}/media/${filename}`,
      `${baseUrl}/images/${filename}`,
      `/uploads/${filename}`,
      `/media/${filename}`,
    ]
  }

  useEffect(() => {
    // Reset state when source changes
    setCurrentSrc(src)
    setLoadFailed(false)
    setAttemptCount(0)
    setFallbackUsed(false)
  }, [src])

  const handleError = (e) => {
    console.error(`Image load error for ${currentSrc}`, e)

    if (!withFallback) {
      setLoadFailed(true)
      return
    }

    // Try alternative URLs
    const alternatives = generateAlternatives(src)
    const nextAttempt = attemptCount + 1

    if (nextAttempt < alternatives.length) {
      console.log(`Trying alternative URL ${nextAttempt}: ${alternatives[nextAttempt]}`)
      setCurrentSrc(alternatives[nextAttempt])
      setAttemptCount(nextAttempt)
      setFallbackUsed(true)
    } else {
      console.log("All alternatives failed, using placeholder")
      setCurrentSrc(getPlaceholderImage(300, 300, "Image failed to load"))
      setLoadFailed(true)
      setFallbackUsed(true)
    }
  }

  const combinedStyle = {
    ...style,
    maxWidth: "100%",
    height: "auto",
  }

  return (
    <div className={`media-loader ${loadFailed ? "media-load-failed" : ""}`}>
      {fallbackUsed && !loadFailed && (
        <div className="fallback-notice" style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
          Using alternative source
        </div>
      )}

      {type === "IMAGE" ? (
        <img
          src={currentSrc || "/placeholder.svg"}
          alt={alt || "Media content"}
          className={className || "media-image"}
          style={combinedStyle}
          onError={handleError}
          crossOrigin="anonymous"
        />
      ) : type === "VIDEO" ? (
        <video
          controls
          className={className || "media-video"}
          style={combinedStyle}
          onError={handleError}
          crossOrigin="anonymous"
        >
          <source src={currentSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="unsupported-media" style={{ padding: "20px", textAlign: "center", backgroundColor: "#f0f0f0" }}>
          Unsupported media type
        </div>
      )}

      {loadFailed && (
        <div
          className="media-error-overlay"
          style={{
            marginTop: "5px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Failed to load media
        </div>
      )}
    </div>
  )
}

export default MediaLoader
