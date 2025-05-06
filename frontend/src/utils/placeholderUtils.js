/**
 * Utility functions for handling placeholder images
 */

// Base64 encoded small placeholder image (1x1 pixel transparent PNG)
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

/**
 * Get a placeholder image URL that doesn't require server access
 * @param {number} width Width of the placeholder
 * @param {number} height Height of the placeholder
 * @param {string} text Optional text to display on the placeholder
 * @returns {string} Data URL for the placeholder image
 */
export const getPlaceholderImage = (width = 200, height = 200, text = "Image") => {
  // For small placeholders, just return a transparent pixel
  if (width < 10 || height < 10) {
    return TRANSPARENT_PIXEL
  }

  // Create a canvas element
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  // Get the canvas context and draw the placeholder
  const ctx = canvas.getContext("2d")

  // Fill with a light gray background
  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(0, 0, width, height)

  // Add a border
  ctx.strokeStyle = "#cccccc"
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, width, height)

  // Add text
  ctx.fillStyle = "#666666"
  ctx.font = `${Math.max(14, Math.floor(width / 10))}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, width / 2, height / 2)

  // Return the data URL
  return canvas.toDataURL("image/png")
}

/**
 * Handle image loading errors by replacing with a placeholder
 * @param {Event} event The error event
 * @param {number} width Width of the placeholder
 * @param {number} height Height of the placeholder
 * @param {string} altText Alternative text for the image
 */
export const handleImageError = (event, width = 200, height = 200, altText = "Image not available") => {
  const img = event.target
  console.error(`Image failed to load: ${img.src}`)
  img.src = getPlaceholderImage(width, height, altText)
  img.alt = altText

  // Add a red border to indicate an error
  img.style.border = "1px solid #ff0000"
}
