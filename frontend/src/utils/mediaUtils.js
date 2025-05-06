/**
 * Utility functions for handling media in the application
 */

/**
 * Get the base URL for media files
 * @returns {string} The base URL for media files
 */
export const getMediaBaseUrl = () => {
    return process.env.REACT_APP_API_URL || "http://localhost:8080"
  }
  
  /**
   * Format a media URL to ensure it's properly formed
   * @param {string} url The raw URL from the backend
   * @returns {string} A properly formatted URL
   */
  export const formatMediaUrl = (url) => {
    if (!url) return null
  
    // If it's already an absolute URL, return it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
  
    // If it's a relative URL, prepend the base URL
    if (url.startsWith("/")) {
      return `${getMediaBaseUrl()}${url}`
    }
  
    // Otherwise, prepend the base URL and a slash
    return `${getMediaBaseUrl()}/${url}`
  }
  
  /**
   * Determine if a URL points to an image
   * @param {string} url The URL to check
   * @returns {boolean} True if the URL points to an image
   */
  export const isImageUrl = (url) => {
    if (!url) return false
  
    const lowercaseUrl = url.toLowerCase()
    return (
      lowercaseUrl.endsWith(".jpg") ||
      lowercaseUrl.endsWith(".jpeg") ||
      lowercaseUrl.endsWith(".png") ||
      lowercaseUrl.endsWith(".gif") ||
      lowercaseUrl.endsWith(".webp")
    )
  }
  
  /**
   * Determine if a URL points to a video
   * @param {string} url The URL to check
   * @returns {boolean} True if the URL points to a video
   */
  export const isVideoUrl = (url) => {
    if (!url) return false
  
    const lowercaseUrl = url.toLowerCase()
    return (
      lowercaseUrl.endsWith(".mp4") ||
      lowercaseUrl.endsWith(".webm") ||
      lowercaseUrl.endsWith(".ogg") ||
      lowercaseUrl.endsWith(".mov")
    )
  }
  