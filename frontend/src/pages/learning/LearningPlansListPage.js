"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { learningPlanAPI } from "../../utils/api" // Updated import
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Loading from "../../components/common/Loading"
import "./LearningPlansListPages.css"

const LearningPlansListPage = () => {
  const [learningPlans, setLearningPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [page, setPage] = useState(0) // Added pagination
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  const loadLearningPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Starting to fetch learning plans...")

      const response = await learningPlanAPI.getAllLearningPlans(page, 10)
      console.log("API response:", response)

      if (response && response.data) {
        // Handle different response formats
        const plansData = response.data.data || response.data
        const plans = Array.isArray(plansData) ? plansData : plansData.content || []
        setLearningPlans(plans)
      } else {
        setError("No learning plans found or invalid response format.")
        setLearningPlans([])
      }
    } catch (err) {
      console.error("Error loading learning plans:", err)
      setError(`Failed to load learning plans: ${err.message}`)
      showToast(`Failed to load learning plans: ${err.message}`, "error")
      setLearningPlans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLearningPlans()
  }, [page]) // Re-fetch when page changes

  const handleRetry = () => {
    loadLearningPlans()
  }

  const handlePagination = (direction) => {
    if (direction === "next") setPage((prev) => prev + 1)
    else if (direction === "prev" && page > 0) setPage((prev) => prev - 1)
  }

  if (loading) {
    return <Loading message="Loading learning plans..." />
  }

  return (
    <div className="learning-plans-list-container">
      <div className="learning-plans-header">
        <h1>Learning Plans</h1>
        <div>
          <Link to="/learning-plans/create" className="create-plan-button">
            Create New Plan
          </Link>
        </div>
      </div>

      {debugInfo && (
        <div className="debug-info">
          <h3>API Debug Information</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {!error && learningPlans.length === 0 ? (
        <div className="no-plans-message">
          <p>No learning plans found. Create your first learning plan!</p>
          <Link to="/learning-plans/create" className="create-plan-button">
            Create Learning Plan
          </Link>
        </div>
      ) : (
        <div className="learning-plans-grid">
          {learningPlans.map((plan) => (
            <div key={plan.id} className="learning-plan-card">
              <h2>{plan.title}</h2>
              <p>{plan.description}</p>
              <div>
                <span>{plan.topics?.length || 0} topics</span>
                <span>Created by: {plan.user?.username || "Unknown"}</span>
              </div>

              <div style={{marginTop:"10px"}}>
                <Link to={`/learning-plans/${plan.id}`} className="view-plan-button">
                  View Plan
                </Link>
                {currentUser && plan.user?.id === currentUser.id && (
                  <Link to={`/learning-plans/${plan.id}/edit`} className="edit-plan-button">
                    Edit Plan
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={() => handlePagination("prev")} disabled={page === 0}>
          Previous
        </button>
        <button onClick={() => handlePagination("next")}>Next</button>
      </div>
    </div>
  )
}

export default LearningPlansListPage
