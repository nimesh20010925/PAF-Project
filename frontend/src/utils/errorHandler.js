"use client"

import { useToast } from "../contexts/ToastContext"

// Function to extract error message from API error
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    // If the error has a response with data
    if (error.response.data.message) {
      return error.response.data.message
    } else if (error.response.data.error) {
      return error.response.data.error
    }
  }

  // Default error message
  return error.message || "An unexpected error occurred"
}

// Hook to handle API errors with toast
export const useErrorHandler = () => {
  const { showToast } = useToast()

  const handleError = (error, customMessage = null) => {
    const message = customMessage || getErrorMessage(error)
    console.error("API Error:", error)
    showToast(message, "error")
    return message
  }

  return { handleError }
}
