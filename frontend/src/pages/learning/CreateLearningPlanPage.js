"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { learningPlanAPI } from "../../utils/api" // Updated import
import { useToast } from "../../contexts/ToastContext"
import "./LearningPlanPages.css"

const CreateLearningPlanPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topics: [{ name: "", description: "", resources: [""] }],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleTopicChange = (index, e) => {
    const { name, value } = e.target
    const updatedTopics = [...formData.topics]
    updatedTopics[index] = { ...updatedTopics[index], [name]: value }
    setFormData({ ...formData, topics: updatedTopics })
  }

  const handleResourceChange = (topicIndex, resourceIndex, value) => {
    const updatedTopics = [...formData.topics]
    updatedTopics[topicIndex].resources[resourceIndex] = value
    setFormData({ ...formData, topics: updatedTopics })
  }

  const addTopic = () => {
    setFormData({
      ...formData,
      topics: [...formData.topics, { name: "", description: "", resources: [""] }],
    })
  }

  const removeTopic = (index) => {
    const updatedTopics = [...formData.topics]
    updatedTopics.splice(index, 1)
    setFormData({ ...formData, topics: updatedTopics })
  }

  const addResource = (topicIndex) => {
    const updatedTopics = [...formData.topics]
    updatedTopics[topicIndex].resources.push("")
    setFormData({ ...formData, topics: updatedTopics })
  }

  const removeResource = (topicIndex, resourceIndex) => {
    const updatedTopics = [...formData.topics]
    updatedTopics[topicIndex].resources.splice(resourceIndex, 1)
    setFormData({ ...formData, topics: updatedTopics })
  }

  // Fix the handleSubmit function to properly format the data
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.title.trim()) {
      showToast("Please enter a title for your learning plan", "error")
      return
    }

    // Prepare data for backend
    const validTopics = formData.topics
      .filter((topic) => topic.name && topic.name.trim() !== "")
      .map((topic, index) => {
        // Filter out empty resources
        const validResources = topic.resources.filter((resource) => resource.trim() !== "")

        return {
          title: topic.name,
          description: topic.description || "",
          resources: validResources.join(","),
          orderIndex: index,
          completed: false,
        }
      })

    if (validTopics.length === 0) {
      showToast("Please add at least one topic to your learning plan", "error")
      return
    }

    const finalFormData = {
      title: formData.title,
      description: formData.description || "",
      topics: validTopics,
    }

    try {
      setLoading(true)
      const response = await learningPlanAPI.createLearningPlan(finalFormData)
      showToast("Learning plan created successfully!", "success")
      navigate(`/learning-plans/${response.data.data.id}`)
    } catch (error) {
      console.error("Error creating learning plan:", error)
      showToast(error.response?.data?.message || "Failed to create learning plan", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-learning-plan-container">
      <h1>Create Learning Plan</h1>
      <form className="create-learning-plan-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a title for your learning plan"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this learning plan is about"
          />
        </div>

        <div className="topics-section">
          <h2>Topics</h2>
          <button type="button" className="add-topic-button" onClick={addTopic}>
            Add Topic
          </button>

          {formData.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="topic-form">
              <h3>
                Topic {topicIndex + 1}
                {formData.topics.length > 1 && (
                  <button type="button" className="remove-topic-button" onClick={() => removeTopic(topicIndex)}>
                    Remove
                  </button>
                )}
              </h3>

              <div className="form-group">
                <label htmlFor={`topic-name-${topicIndex}`}>Topic Title</label>
                <input
                  type="text"
                  id={`topic-name-${topicIndex}`}
                  name="name"
                  value={topic.name}
                  onChange={(e) => handleTopicChange(topicIndex, e)}
                  placeholder="Enter topic title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`topic-description-${topicIndex}`}>Topic Description</label>
                <textarea
                  id={`topic-description-${topicIndex}`}
                  name="description"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(topicIndex, e)}
                  placeholder="Describe this topic"
                />
              </div>

              <div className="resources-section">
                <label>Resources</label>
                {topic.resources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="resource-input">
                    <input
                      type="text"
                      value={resource}
                      onChange={(e) => handleResourceChange(topicIndex, resourceIndex, e.target.value)}
                      placeholder="Enter a resource URL or description"
                    />
                    {topic.resources.length > 1 && (
                      <button
                        type="button"
                        className="remove-resource-button"
                        onClick={() => removeResource(topicIndex, resourceIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-resource-button" onClick={() => addResource(topicIndex)}>
                  Add Resource
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating..." : "Create Learning Plan"}
        </button>
      </form>
    </div>
  )
}

export default CreateLearningPlanPage
