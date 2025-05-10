"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { postAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import "./CreatePostPage.css"

const mediaLimitsStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "8px",
  color: "#666",
  fontSize: "0.85rem",
}

const CreatePostPage = () => {
  console.log("Rendering CreatePostPage")
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    postType: "SKILL",
    media: [], // Changed from null to empty array
  })

  const [mediaPreviews, setMediaPreviews] = useState([]) // Changed from single preview to array
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 3) {
      showToast("Maximum 3 files allowed per post", "error")
      setUploadStatus("Error: Maximum 3 files allowed per post")
      return
    }

    // Check if any file is a video
    const videoFile = files.find((file) => file.type.startsWith("video/"))

    if (videoFile) {
      // Create a temporary URL for the video
      const videoUrl = URL.createObjectURL(videoFile)
      const video = document.createElement("video")

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(videoUrl)

        // Check if video is longer than 30 seconds
        if (video.duration > 30) {
          showToast("Videos must be 30 seconds or less", "error")
          setUploadStatus("Error: Videos must be 30 seconds or less")
          return
        }

        // If video is valid, proceed with the upload
        processValidFiles(files)
      }

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl)
        showToast("Error validating video file", "error")
        setUploadStatus("Error validating video file")
      }

      video.src = videoUrl
    } else {
      // If no video files, proceed with the upload
      processValidFiles(files)
    }
  }

  const processValidFiles = (files) => {
    if (files.length > 0) {
      // Log file details for debugging
      files.forEach((file) => {
        console.log("Selected file:", file.name, file.type, file.size)
      })

      setFormData((prev) => ({ ...prev, media: files }))
      setUploadStatus(`${files.length} file(s) selected`)

      // Generate previews for all files
      const previews = []

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push({
            id: Math.random().toString(36).substr(2, 9),
            type: file.type,
            url: reader.result,
          })

          if (previews.length === files.length) {
            setMediaPreviews(previews)
            console.log("Previews generated")
          }
        }
        reader.readAsDataURL(file)
      })
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
      if (formData.media.length > 0) {
        // If there's media, pass it as the second argument
        setUploadStatus("Uploading media files...")
        console.log(`Uploading ${formData.media.length} files`)
        response = await postAPI.createPost(postData, formData.media)
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
          <div style={mediaLimitsStyle}>
            <small>• Maximum 3 files per post</small>
            <small>• Videos must be 30 seconds or less</small>
          </div>
          <input type="file" id="media" name="media" onChange={handleFileChange} accept="image/*,video/*" multiple />

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

          {mediaPreviews.length > 0 && (
            <div className="media-previews">
              {mediaPreviews.map((preview) => (
                <div key={preview.id} className="media-preview">
                  {preview.type.startsWith("image/") ? (
                    <img src={preview.url || "/placeholder.svg"} alt="Preview" />
                  ) : preview.type.startsWith("video/") ? (
                    <video controls src={preview.url} />
                  ) : null}
                </div>
              ))}
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
