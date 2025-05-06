"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { postAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import "./CreatePostPage.css"

const CreatePostPage = () => {
  console.log("Rendering CreatePostPage")
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    postType: "SKILL", // Changed default to match backend enum
    media: null,
  })

  const [mediaPreview, setMediaPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Log file details for debugging
      console.log("Selected file:", file.name, file.type, file.size)

      setFormData((prev) => ({ ...prev, media: file }))
      setUploadStatus(`File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)

      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result)
        console.log("Preview generated")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      showToast("Please login to create a post", "error")
      navigate("/login")
      return
    }

    setLoading(true)
    setUploadStatus("Preparing to upload...")

    try {
      // Create the post data object
      const postData = {
        title: formData.title,
        content: formData.content,
        type: formData.postType, // This will now be one of: SKILL, PROGRESS, PLAN
      }

      console.log("Submitting post:", postData)
      setUploadStatus("Uploading post data...")

      // If using the createPost API function that expects separate arguments
      let response
      if (formData.media) {
        // If there's media, pass it as the second argument
        setUploadStatus("Uploading media file...")
        console.log("Uploading with media:", formData.media.name, formData.media.type)
        response = await postAPI.createPost(postData, [formData.media])
      } else {
        // If no media, pass an empty array
        response = await postAPI.createPost(postData, [])
      }

      console.log("Post creation response:", response)
      setUploadStatus("Post created successfully!")

      // Extract the post ID from the response
      let postId
      if (response.data && response.data.data && response.data.data.id) {
        postId = response.data.data.id
      } else if (response.data && response.data.id) {
        postId = response.data.id
      } else {
        console.error("Could not find post ID in response:", response)
        throw new Error("Invalid response format")
      }

      showToast("Post created successfully!", "success")

      // Add a small delay before navigation to ensure the post is saved
      setUploadStatus("Redirecting to post...")
      setTimeout(() => {
        navigate(`/posts/${postId}`)
      }, 1000)
    } catch (error) {
      console.error("Error creating post:", error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to create post"
      setUploadStatus(`Error: ${errorMessage}`)
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post-container">
      <h1>Create a New Post</h1>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="postType">Post Type</label>
          <select id="postType" name="postType" value={formData.postType} onChange={handleChange} required>
            <option value="SKILL">Skill</option>
            <option value="PROGRESS">Progress</option>
            <option value="PLAN">Plan</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your knowledge, ask a question, or start a discussion"
            rows="8"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="media">Add Media (Optional)</label>
          <input type="file" id="media" name="media" onChange={handleFileChange} accept="image/*,video/*" />

          {uploadStatus && (
            <div
              className="upload-status"
              style={{
                marginTop: "10px",
                padding: "8px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {uploadStatus}
            </div>
          )}

          {mediaPreview && (
            <div className="media-preview">
              {formData.media.type.startsWith("image/") ? (
                <img src={mediaPreview || "/placeholder.svg"} alt="Preview" />
              ) : formData.media.type.startsWith("video/") ? (
                <video controls src={mediaPreview} />
              ) : null}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")} className="cancel-button" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating Post..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePostPage
