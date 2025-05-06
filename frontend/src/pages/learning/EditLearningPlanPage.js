"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./LearningPlanPages.css"

const EditLearningPlanPage = () => {
  const { planId } = useParams()
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

  useEffect(() => {
    const fetchLearningPlan = async () => {
      try {
        setLoading(true)

        const response = await api.get(`/learning-plans/${planId}`)

        // Check ownership
        if (response.data.user.id !== currentUser?.id) {
          showToast("You can only edit your own learning plans", "error")
          navigate(`/learning-plans/${planId}`)
          return
        }

        // Format the data
        setLearningPlan({
          title: response.data.title,
          description: response.data.description,
          topics: response.data.topics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            resources: topic.resources,
            completed: topic.completed,
          })),
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plan:", error)
        showToast("Failed to load learning plan", "error")
        navigate("/")
      }
    }

    if (currentUser) {
      fetchLearningPlan()
    } else {
      navigate("/login")
    }
  }, [planId, currentUser, navigate, showToast])

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
      topics: [...prev.topics, { title: "", description: "", resources: "", completed: false }],
    }))
  }

  const removeTopic = (index) => {
    if (learningPlan.topics.length === 1) {
      showToast("Learning plan must have at least one topic", "warning")
      return
    }

    const updatedTopics = [...learningPlan.topics]
    updatedTopics.splice(index, 1)
    setLearningPlan((prev) => ({ ...prev, topics: updatedTopics }))
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

    try {
      // Create learning plan structure for the API
      const planData = {
        title: learningPlan.title,
        description: learningPlan.description,
        topics: learningPlan.topics.map((topic) => ({
          id: topic.id, // Include existing topic IDs
          title: topic.title,
          description: topic.description,
          resources: topic.resources,
          completed: topic.completed,
        })),
      }

      await api.put(`/learning-plans/${planId}`, planData)
      showToast("Learning plan updated successfully!", "success")
      navigate(`/learning-plans/${planId}`)
    } catch (error) {
      console.error("Error updating learning plan:", error)
      showToast(error.response?.data?.message || "Failed to update learning plan", "error")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="learning-plan-form-container">
          <div className="loading">Loading learning plan...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
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
              onClick={() => navigate(`/learning-plans/${planId}`)}
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
    </Layout>
  )
}

export default EditLearningPlanPage
