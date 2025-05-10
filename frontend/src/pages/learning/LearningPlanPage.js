"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { learningPlanAPI } from "../../utils/api" // Updated import
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import "./LearningPlanPage.css"

const LearningPlanPage = () => {
  const { planId } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [learningPlan, setLearningPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLearningPlan = async () => {
      try {
        if (!planId) {
          throw new Error("Plan ID is missing.")
        }

        setLoading(true)
        setError(null)
        console.log(`Fetching learning plan with ID: ${planId}`)

        // Use the learningPlanAPI instead of direct api call
        const response = await learningPlanAPI.getLearningPlanById(planId)
        console.log("Learning plan response:", response)

        if (!response.data || !response.data.data) {
          throw new Error("Learning plan not found")
        }

        const planData = response.data.data
        setLearningPlan(planData)

        // Calculate progress
        if (planData.topics && planData.topics.length > 0) {
          const completedTopics = planData.topics.filter((topic) => topic.completed).length
          const progressPercentage = (completedTopics / planData.topics.length) * 100
          setProgress(progressPercentage)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plan:", error)
        setError("Failed to load learning plan")
        showToast(error.message || "Failed to load learning plan", "error")
      }
    }

    fetchLearningPlan()
  }, [planId, showToast])

  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure you want to delete this learning plan?")) {
      return
    }

    try {
      await learningPlanAPI.deleteLearningPlan(planId)
      showToast("Learning plan deleted successfully", "success")
      navigate("/learning-plans")
    } catch (error) {
      console.error("Error deleting learning plan:", error)
      showToast("Failed to delete learning plan", "error")
    }
  }

  const handleTopicCompletion = async (topicId, completed) => {
    try {
      // Use the correct API endpoint with /api prefix
      await learningPlanAPI.updateLearningPlan(`${planId}/topics/${topicId}`, {
        completed: !completed,
      })

      // Update local state
      const updatedPlan = { ...learningPlan }
      const topicIndex = updatedPlan.topics.findIndex((t) => t.id === topicId)

      if (topicIndex !== -1) {
        updatedPlan.topics[topicIndex].completed = !completed
        setLearningPlan(updatedPlan)

        // Recalculate progress
        const completedTopics = updatedPlan.topics.filter((topic) => topic.completed).length
        const progressPercentage = (completedTopics / updatedPlan.topics.length) * 100
        setProgress(progressPercentage)
      }

      showToast(`Topic marked as ${!completed ? "completed" : "incomplete"}`, "success")
    } catch (error) {
      console.error("Error updating topic completion:", error)
      showToast("Failed to update topic", "error")
    }
  }

  const handleEditPlan = () => {
    navigate(`/learning-plans/${planId}/edit`)
  }

  if (loading) {
    return (
      <div className="learning-plan-container">
        <div className="loading">Loading learning plan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="learning-plan-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate("/learning-plans")} className="back-button">
          Back to Learning Plans
        </button>
      </div>
    )
  }

  if (!learningPlan) {
    return (
      <div className="learning-plan-container">
        <div className="error">Learning plan not found</div>
        <button onClick={() => navigate("/learning-plans")} className="back-button">
          Back to Learning Plans
        </button>
      </div>
    )
  }

  const isOwner = currentUser && learningPlan.user.id === currentUser.id

  return (
    <div className="learning-plan-container">
      <div className="learning-plan-header">
        <div className="plan-title-section">
          <h1>{learningPlan.title}</h1>
          <div className="plan-meta">
            <div className="plan-creator">
              <Link to={`/profile/${learningPlan.user.username}`}>
                <img
                  src={learningPlan.user.profileImage || "/default-avatar.png"}
                  alt={`${learningPlan.user.username}'s avatar`}
                  className="creator-avatar"
                />
                <span>{learningPlan.user.username}</span>
              </Link>
            </div>
            <span className="plan-date">Created on {format(new Date(learningPlan.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {isOwner && (
          <div className="plan-actions">
            <button onClick={handleEditPlan} className="edit-plan-button">
              Edit Plan
            </button>
            <button onClick={handleDeletePlan} className="delete-plan-button">
              Delete Plan
            </button>
          </div>
        )}
      </div>

      <div className="plan-progress-section">
        <div className="progress-header">
          <h2>Progress</h2>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="plan-description">
        <h2>Description</h2>
        <p>{learningPlan.description}</p>
      </div>

      <div className="plan-topics">
        <h2>Topics</h2>

        {learningPlan.topics.length === 0 ? (
          <div className="no-topics">No topics found in this learning plan.</div>
        ) : (
          <div className="topics-list">
            {learningPlan.topics.map((topic, index) => (
              <div key={topic.id} className={`topic-item ${topic.completed ? "completed" : ""}`}>
                <div className="topic-header">
                  <h3>
                    {index + 1}. {topic.title || topic.name}
                  </h3>
                  {isOwner && (
                    <label className="topic-checkbox">
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => handleTopicCompletion(topic.id, topic.completed)}
                      />
                      Mark as completed
                    </label>
                  )}
                </div>

                {topic.description && (
                  <div className="topic-description">
                    <h4>Description:</h4>
                    <p>{topic.description}</p>
                  </div>
                )}

                {topic.resources && (
                  <div className="topic-resources">
                    <h4>Resources:</h4>
                    <p>{topic.resources}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningPlanPage
