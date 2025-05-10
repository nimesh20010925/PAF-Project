"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { learningPlanAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import "./LearningPlanPages.css"

const EditLearningPlanPage = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [learningPlan, setLearningPlan] = useState({
    title: "",
    description: "",
    topics: [],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLearningPlan = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching learning plan with ID: ${id}`)

        // Use the learningPlanAPI utility instead of direct api call
        const response = await learningPlanAPI.getLearningPlanById(id)
        console.log("Learning plan response:", response)

        if (!response.data || (!response.data.data && !response.data.title)) {
          throw new Error("Invalid learning plan data received")
        }

        // Handle different response formats
        const planData = response.data.data || response.data

        // Check ownership
        if (planData.user.id !== currentUser?.id) {
          showToast("You can only edit your own learning plans", "error")
          navigate(`/learning-plans/${id}`)
          return
        }

        // Format the data
        setLearningPlan({
          title: planData.title || "",
          description: planData.description || "",
          topics: Array.isArray(planData.topics)
            ? planData.topics.map((topic) => ({
                id: topic.id,
                title: topic.title || topic.name || "",
                description: topic.description || "",
                resources: topic.resources || "",
                completed: topic.completed || false,
                orderIndex: topic.orderIndex || 0,
              }))
            : [],
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plan:", error)
        setError("Failed to load learning plan. Please try again.")
        showToast("Failed to load learning plan", "error")
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchLearningPlan()
    } else {
      navigate("/login")
    }
  }, [id, currentUser, navigate, showToast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLearningPlan((prev) => ({ ...prev, [name]: value }))
  }

  const handleTopicChange = (index, e) => {
    const { name, value } = e.target
    const updatedTopics = [...learningPlan.topics]
    updatedTopics[index] = { ...updatedTopics[index], [name]: value }
    setLearningPlan((prev) => ({ ...prev, topics: updatedTopics }))
  }

  const handleTopicCheckboxChange = (index, e) => {
    const { checked } = e.target
    const updatedTopics = [...learningPlan.topics]
    updatedTopics[index] = { ...updatedTopics[index], completed: checked }
    setLearningPlan((prev) => ({ ...prev, topics: updatedTopics }))
  }

  const addTopic = () => {
    setLearningPlan((prev) => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          title: "",
          description: "",
          resources: "",
          completed: false,
          orderIndex: prev.topics.length,
        },
      ],
    }))
  }

  const removeTopic = (index) => {
    if (learningPlan.topics.length === 1) {
      showToast("Learning plan must have at least one topic", "warning")
      return
    }

    const updatedTopics = [...learningPlan.topics]
    updatedTopics.splice(index, 1)

    // Update orderIndex for remaining topics
    const reorderedTopics = updatedTopics.map((topic, idx) => ({
      ...topic,
      orderIndex: idx,
    }))

    setLearningPlan((prev) => ({ ...prev, topics: reorderedTopics }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate topics
    const emptyTopics = learningPlan.topics.some((topic) => !topic.title.trim())
    if (emptyTopics) {
      showToast("All topics must have a title", "warning")
      return
    }

    setSaving(true)
    setError(null)

    try {
      console.log("Updating learning plan with ID:", id)

      // Create learning plan structure for the API
      const planData = {
        title: learningPlan.title,
        description: learningPlan.description,
        topics: learningPlan.topics.map((topic, index) => ({
          // Don't include IDs for topics as we're recreating them
          title: topic.title,
          name: topic.title, // Include both title and name for compatibility
          description: topic.description,
          resources: topic.resources,
          orderIndex: index,
          completed: topic.completed,
        })),
      }

      console.log("Sending update with data:", planData)

      // Use the learningPlanAPI utility instead of direct api call
      const response = await learningPlanAPI.updateLearningPlan(id, planData)

      console.log("Update response:", response)

      showToast("Learning plan updated successfully!", "success")
      navigate(`/learning-plans/${id}`)
    } catch (error) {
      console.error("Error updating learning plan:", error)
      const errorMessage = error.response?.data?.message || "Failed to update learning plan. Please try again."
      setError(errorMessage)
      showToast(errorMessage, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="learning-plan-form-container">
        <div className="loading">Loading learning plan...</div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="learning-plan-form-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate("/learning-plans")} className="button">
            Back to Learning Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="learning-plan-form-container">
      <h1>Edit Learning Plan</h1>

      <form onSubmit={handleSubmit} className="learning-plan-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" value={learningPlan.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={learningPlan.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Topics</h2>
            <button type="button" onClick={addTopic} className="add-topic-button">
              Add Topic
            </button>
          </div>

          {learningPlan.topics.map((topic, index) => (
            <div key={index} className="topic-form">
              <div className="topic-header">
                <h3>Topic {index + 1}</h3>
                <button type="button" onClick={() => removeTopic(index)} className="remove-topic-button">
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label htmlFor={`topic-title-${index}`}>Title</label>
                <input
                  type="text"
                  id={`topic-title-${index}`}
                  name="title"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`topic-description-${index}`}>Description</label>
                <textarea
                  id={`topic-description-${index}`}
                  name="description"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(index, e)}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`topic-resources-${index}`}>Resources</label>
                <textarea
                  id={`topic-resources-${index}`}
                  name="resources"
                  value={topic.resources}
                  onChange={(e) => handleTopicChange(index, e)}
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="completed"
                    checked={topic.completed}
                    onChange={(e) => handleTopicCheckboxChange(index, e)}
                  />
                  Mark as completed
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/learning-plans/${id}`)}
            className="cancel-button"
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditLearningPlanPage
