"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { postAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import { processMediaItems } from "../../utils/mediaUtils"
import "./CreatePostPage.css" // Reusing the same styles

const mediaLimitsStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "8px",
  color: "#666",
  fontSize: "0.85rem",
}

const EditPostPage = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    postType: "SKILL",
    media: [],
  })

  const [existingMedia, setExistingMedia] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [uploadStatus, setUploadStatus] = useState(null)

  // Fetch the post data when the component mounts
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingPost(true)
        const response = await postAPI.getPostById(id)
        const post = response.data.data

        // Check if the current user is the author of the post
        if (post.user.id !== currentUser.id) {
          showToast("You can only edit your own posts", "error")
          navigate(`/posts/${id}`)
          return
        }

        setFormData({
          title: post.title || "",
          content: post.content || "",
          postType: post.type || "SKILL",
          media: [],
        })

        // Process existing media
        if (post.media && Array.isArray(post.media)) {
          const processedMedia = processMediaItems(post.media)
          setExistingMedia(processedMedia)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        showToast("Failed to load post data", "error")
        navigate("/")
      } finally {
        setLoadingPost(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id, currentUser, navigate, showToast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    // Check if total files (existing + new) exceeds 3
    if (existingMedia.length + files.length > 3) {
      showToast(`You can only have 3 media files in total. You already have ${existingMedia.length}.`, "error")
      setUploadStatus(`Error: Maximum 3 files allowed (${existingMedia.length} existing + ${files.length} new)`)
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
      setUploadStatus(`${files.length} new file(s) selected`)

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

  const handleRemoveExistingMedia = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNewMedia = (index) => {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      showToast("Please login to edit a post", "error")
      navigate("/login")
      return
    }

    setLoading(true)
    setUploadStatus("Preparing to update post...")

    try {
      // Create the post data object
      const postData = {
        title: formData.title,
        content: formData.content,
        type: formData.postType,
        // We'll need to handle existing media IDs to keep and new media to add
        // This depends on how your backend handles media updates
      }

      console.log("Updating post:", postData)
      setUploadStatus("Updating post data...")

      // For now, we'll just update the post content and type
      // In a real implementation, you'd need to handle media updates as well
      const response = await postAPI.updatePost(id, postData)

      console.log("Post update response:", response)
      setUploadStatus("Post updated successfully!")

      showToast("Post updated successfully!", "success")

      // Add a small delay before navigation to ensure the post is saved
      setUploadStatus("Redirecting to post...")
      setTimeout(() => {
        navigate(`/posts/${id}`)
      }, 1000)
    } catch (error) {
      console.error("Error updating post:", error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update post"
      setUploadStatus(`Error: ${errorMessage}`)
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  if (loadingPost) {
    return <div className="loading">Loading post data...</div>
  }

  return (
    <div className="create-post-container">
      <h1>Edit Post</h1>

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

        {existingMedia.length > 0 && (
          <div className="form-group">
            <label>Existing Media</label>
            <div className="media-previews">
              {existingMedia.map((media, index) => (
                <div key={media.id || index} className="media-preview">
                  {media.type === "IMAGE" ? (
                    <img src={media.url || "/placeholder.svg"} alt={`Existing media ${index + 1}`} />
                  ) : media.type === "VIDEO" ? (
                    <video controls src={media.url} />
                  ) : null}
                  <button type="button" className="remove-media-btn" onClick={() => handleRemoveExistingMedia(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="media">Add New Media (Optional)</label>
          <div style={mediaLimitsStyle}>
            <small>• Maximum 3 files per post total</small>
            <small>• Videos must be 30 seconds or less</small>
            <small>
              • You have {existingMedia.length} existing media files ({3 - existingMedia.length} slots available)
            </small>
          </div>
          <input
            type="file"
            id="media"
            name="media"
            onChange={handleFileChange}
            accept="image/*,video/*"
            multiple
            disabled={existingMedia.length >= 3}
          />

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
              {mediaPreviews.map((preview, index) => (
                <div key={preview.id} className="media-preview">
                  {preview.type.startsWith("image/") ? (
                    <img src={preview.url || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                  ) : preview.type.startsWith("video/") ? (
                    <video controls src={preview.url} />
                  ) : null}
                  <button type="button" className="remove-media-btn" onClick={() => handleRemoveNewMedia(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/posts/${id}`)} className="cancel-button" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Updating Post..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPostPage
