"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./LearningPlanPages.css"

const LearningPlanPage = () => {
  const { planId } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [learningPlan, setLearningPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchLearningPlan = async () => {
      try {
        setLoading(true)

        const response = await api.get(`/learning-plans/${planId}`)
        setLearningPlan(response.data)

        // Calculate progress
        if (response.data.topics.length > 0) {
          const completedTopics = response.data.topics.filter((topic) => topic.completed).length
          const progressPercentage = (completedTopics / response.data.topics.length) * 100
          setProgress(progressPercentage)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plan:", error)
        showToast("Failed to load learning plan", "error")
        navigate("/")
      }
    }

    fetchLearningPlan()
  }, [planId, navigate, showToast])

  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure you want to delete this learning plan?")) {
      return
    }

    try {
      await api.delete(`/learning-plans/${planId}`)
      showToast("Learning plan deleted successfully", "success")
      navigate("/")
    } catch (error) {
      console.error("Error deleting learning plan:", error)
      showToast("Failed to delete learning plan", "error")
    }
  }

  const handleTopicCompletion = async (topicId, completed) => {
    try {
      await api.put(`/learning-plans/${planId}/topics/${topicId}`, {
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

  if (loading) {
    return (
      <Layout>
        <div className="learning-plan-container">
          <div className="loading">Loading learning plan...</div>
        </div>
      </Layout>
    )
  }

  if (!learningPlan) {
    return (
      <Layout>
        <div className="learning-plan-container">
          <div className="error">Learning plan not found</div>
        </div>
      </Layout>
    )
  }

  const isOwner = currentUser && learningPlan.user.id === currentUser.id

  return (
    <Layout>
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
              <Link to={`/learning-plans/${planId}/edit`} className="edit-plan-button">
                Edit Plan
              </Link>
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
                      {index + 1}. {topic.title}
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
    </Layout>
  )
}

export default LearningPlanPage
