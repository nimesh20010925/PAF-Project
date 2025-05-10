import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Add the following console log to help debug API requests
    // Add this near the beginning of the request interceptor function
    console.log("Making API request with config:", config)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Add this near the beginning of the response interceptor function
    console.log("Received API response:", response)
    return response
  },
  (error) => {
    // Add this near the beginning of the error interceptor function
    console.error("API request error:", error.response || error)
    return Promise.reject(error)
  },
)

export default api
