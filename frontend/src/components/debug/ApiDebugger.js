"use client"

import { useState, useEffect } from "react"
import { api } from "../../utils/api"

const ApiDebugger = () => {
  const [apiUrl, setApiUrl] = useState("")
  const [apiStatus, setApiStatus] = useState("unknown")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get the API URL from the axios instance
    setApiUrl(api.defaults.baseURL || "Not configured")

    // Check API connection
    checkApiConnection()
  }, [])

  const checkApiConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to make a simple request to the API
      await api.get("/api/posts?page=0&size=1")
      setApiStatus("connected")
    } catch (err) {
      setApiStatus("disconnected")
      setError(err.message || "Unknown error")
      console.error("API connection error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">API Debugger</h3>
      <div className="mb-2">
        <strong>API URL:</strong> {apiUrl}
      </div>
      <div className="mb-2">
        <strong>Status:</strong>{" "}
        <span className={apiStatus === "connected" ? "text-green-600" : "text-red-600"}>{apiStatus}</span>
      </div>
      {error && (
        <div className="text-red-600 mb-2">
          <strong>Error:</strong> {error}
        </div>
      )}
      <button
        onClick={checkApiConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Connection"}
      </button>
    </div>
  )
}

export default ApiDebugger
