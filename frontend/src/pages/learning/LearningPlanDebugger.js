"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

const LearningPlanDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()

  const testEndpoint = async (url, name) => {
    setLoading(true)
    try {
      console.log(`Testing endpoint: ${url}`)

      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(url, { headers })
      const data = await response.json()

      console.log(`Response from ${name}:`, data)

      setDebugInfo((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          statusText: response.statusText,
          data: data,
        },
      }))

      return { success: response.status >= 200 && response.status < 300, data }
    } catch (error) {
      console.error(`Error testing ${name}:`, error)
      setDebugInfo((prev) => ({
        ...prev,
        [name]: {
          error: error.message,
        },
      }))
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    // Test basic API connectivity
    await testEndpoint("http://localhost:8080/api/posts?page=0&size=1", "posts")

    // Test learning plans endpoint
    await testEndpoint("http://localhost:8080/api/learning-plans", "learningPlans")

    // Test if user-specific learning plans work
    if (currentUser && currentUser.id) {
      await testEndpoint(`http://localhost:8080/api/learning-plans/user/${currentUser.id}`, "userLearningPlans")
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>API Debugger</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={runAllTests}
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Run All Tests"}
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Current User</h2>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>

      <div>
        <h2>Test Results</h2>
        {Object.keys(debugInfo).length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to begin.</p>
        ) : (
          Object.entries(debugInfo).map(([name, info]) => (
            <div
              key={name}
              style={{
                marginBottom: "15px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: info.error ? "#ffebee" : "#e8f5e9",
              }}
            >
              <h3>{name}</h3>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(info, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LearningPlanDebugger
