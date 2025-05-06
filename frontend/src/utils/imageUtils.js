/**
 * Utility functions for handling images in the application
 */

/**
 * Get the base URL for API requests
 * @returns {string} The base URL for API requests
 */
export const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || "http://localhost:8080"
  }
  
  /**
   * Format an image URL to ensure it's properly formed
   * @param {string} url The raw URL from the backend
   * @returns {string} A properly formatted URL
   */
  export const formatImageUrl = (url) => {
    if (!url) return null
  
    // If it's already an absolute URL, return it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
  
    // If it's a relative URL, prepend the base URL
    const baseUrl = getBaseUrl()
    if (url.startsWith("/")) {
      return `${baseUrl}${url}`
    }
  
    // Otherwise, prepend the base URL and a slash
    return `${baseUrl}/${url}`
  }
  
  /**
   * Check if an image exists at the given URL
   * @param {string} url The URL to check
   * @returns {Promise<boolean>} A promise that resolves to true if the image exists
   */
  export const checkImageExists = async (url) => {
    if (!url) return false
  
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      console.error("Error checking image existence:", error)
      return false
    }
  }
  
  /**
   * Load an image and return a promise that resolves when the image is loaded
   * @param {string} url The URL of the image to load
   * @returns {Promise<HTMLImageElement>} A promise that resolves to the loaded image
   */
  export const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (error) => reject(error)
      img.src = formatImageUrl(url)
    })
  }
  