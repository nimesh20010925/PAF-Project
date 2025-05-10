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
  
    // Log the original URL for debugging
    console.log("Original URL:", url)
  
    // If it's already an absolute URL, return it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      console.log("URL is already absolute:", url)
      return url
    }
  
    const baseUrl = getMediaBaseUrl()
    console.log("Base URL:", baseUrl)
  
    let formattedUrl
  
    // If it's a relative URL starting with /uploads/, just prepend the base URL
    if (url.startsWith("/uploads/")) {
      formattedUrl = `${baseUrl}${url}`
    }
    // If it's a relative URL starting with uploads/, prepend the base URL and a slash
    else if (url.startsWith("uploads/")) {
      formattedUrl = `${baseUrl}/${url}`
    }
    // For other filenames, assume they should be in the uploads directory
    else {
      formattedUrl = `${baseUrl}/uploads/${url}`
    }
  
    console.log("Formatted URL:", formattedUrl)
    return formattedUrl
  }
  
  /**
   * Process an array of media items to ensure all URLs are properly formatted
   * @param {Array} mediaItems Array of media objects
   * @returns {Array} Array of media objects with formatted URLs
   */
  export const processMediaItems = (mediaItems) => {
    if (!mediaItems || !Array.isArray(mediaItems)) return []
  
    return mediaItems.map((media, index) => {
      if (!media) return media
  
      // Keep the original URL for debugging
      const originalUrl = media.url
  
      // Format the URL
      const formattedUrl = formatMediaUrl(media.url)
  
      return {
        ...media,
        originalUrl,
        url: formattedUrl,
        index,
      }
    })
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
  
  /**
   * Create a direct image URL for testing
   * This is a fallback method to try different URL formats
   * @param {string} filename The image filename
   * @returns {string} A direct URL to the image
   */
  export const createDirectImageUrl = (filename) => {
    if (!filename) return null
  
    const baseUrl = getMediaBaseUrl()
  
    // Try different path formats
    const paths = [
      `${baseUrl}/uploads/${filename}`,
      `${baseUrl}/uploads/images/${filename}`,
      `${baseUrl}/images/${filename}`,
      `${baseUrl}/media/${filename}`,
      `${baseUrl}/${filename}`,
      `/uploads/${filename}`, // Relative path
      `/media/${filename}`, // Relative path
    ]
  
    console.log("Possible image paths:", paths)
    return paths[0] // Return the first option as default
  }
  
  // Export all utility functions;
  