"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./StoryPages.css"

const CreateStoryPage = () => {
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log("Selected file:", file.name, file.type, file.size)

      // Check if file is image or video
      if (!file.type.match("image.*") && !file.type.match("video.*")) {
        showToast("Please upload an image or video file", "error")
        return
      }

      setMediaFile(file)

      // Create media preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Starting story submission...")

    if (!currentUser) {
      showToast("Please login to create a story", "error")
      navigate("/login")
      return
    }

    if (!mediaFile) {
      showToast("Please upload an image or video for your story", "warning")
      return
    }

    setLoading(true)

    try {
      // Create a simple FormData object
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("media", mediaFile)

      // Get the token from localStorage
      const token = localStorage.getItem("token")

      // Get the base URL from environment variables
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"
      console.log("Using API URL:", baseUrl)

      // Make a direct axios call to the backend
      const response = await axios.post(`${baseUrl}/api/stories/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      console.log("Story created successfully:", response.data)
      showToast("Story created successfully!", "success")
      navigate("/stories")
    } catch (error) {
      console.error("Error creating story:", error)
      console.error("Error details:", error.response?.data || "No response data")
      showToast(error.response?.data?.message || "Failed to create story. Check console for details.", "error")
    } finally {
      setLoading(false)
    }
  }

return (
    <Layout>
        <div className="create-story-container">
            <h1>Create a New Story</h1>

            <form onSubmit={handleSubmit} className="create-story-form">
                <div className="form-group">
                    <label htmlFor="title">Title (Optional)</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Give your story a title"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Content (Optional)</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Add a description or content for your story"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="media">Upload Media (Required)</label>
                    <input type="file" id="media" onChange={handleFileChange} accept="image/*,video/*" required />

                    {mediaPreview && (
                        <div className="media-preview">
                            {mediaFile?.type.startsWith("image/") ? (
                                <img
                                    src={mediaPreview || "/placeholder.svg"}
                                    alt="Story preview"
                                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                                />
                            ) : mediaFile?.type.startsWith("video/") ? (
                                <video controls src={mediaPreview} style={{ maxWidth: "100%", maxHeight: "300px" }} />
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate("/stories")} className="cancel-button" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? "Creating Story..." : "Create Story"}
                    </button>
                </div>
            </form>
        </div>
    </Layout>
)
}

export default CreateStoryPage
