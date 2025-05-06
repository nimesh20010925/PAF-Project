"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./LearningPlanPages.css"

const CreateLearningPlanPage = () => {
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [learningPlan, setLearningPlan] = useState({
    title: "",
    description: "",
    topics: [{ title: "", description: "", resources: "", completed: false }],
  })

  const [loading, setLoading] = useState(false)

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

    if (!currentUser) {
      showToast("Please login to create a learning plan", "error")
      navigate("/login")
      return
    }

    // Validate topics
    const emptyTopics = learningPlan.topics.some((topic) => !topic.title.trim())
    if (emptyTopics) {
      showToast("All topics must have a title", "warning")
      return
    }

    setLoading(true)

    try {
      // Create learning plan structure for the API
      const planData = {
        title: learningPlan.title,
        description: learningPlan.description,
        topics: learningPlan.topics.map((topic) => ({
          title: topic.title,
          description: topic.description,
          resources: topic.resources,
          completed: topic.completed,
        })),
      }

      const response = await api.post("/learning-plans", planData)
      showToast("Learning plan created successfully!", "success")
      navigate(`/learning-plans/${response.data.id}`)
    } catch (error) {
      console.error("Error creating learning plan:", error)
      showToast(error.response?.data?.message || "Failed to create learning plan", "error")
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="learning-plan-form-container">
        <h1>Create Learning Plan</h1>

        <form onSubmit={handleSubmit} className="learning-plan-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={learningPlan.title}
                onChange={handleChange}
                placeholder="e.g., Web Development Fundamentals"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={learningPlan.description}
                onChange={handleChange}
                placeholder="Describe the purpose and goals of this learning plan"
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
                    placeholder="e.g., HTML Basics"
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
                    placeholder="Describe what will be learned in this topic"
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
                    placeholder="List books, websites, courses, or other resources"
                    rows="3"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/")} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating..." : "Create Learning Plan"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreateLearningPlanPage
