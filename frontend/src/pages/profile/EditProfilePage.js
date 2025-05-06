"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./EditProfilePage.css"

const EditProfilePage = () => {
  const { currentUser, updateCurrentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    bio: "",
    profileImage: null,
    coverImage: null,
  })

  const [previewUrls, setPreviewUrls] = useState({
    profileImage: "",
    coverImage: "",
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    // Initialize form with current user data
    setFormData({
      username: currentUser.username || "",
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      bio: currentUser.bio || "",
      profileImage: null,
      coverImage: null,
    })

    setPreviewUrls({
      profileImage: currentUser.profileImage || "",
      coverImage: currentUser.coverImage || "",
    })
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))

      // Create and set preview URL
      const previewUrl = URL.createObjectURL(files[0])
      setPreviewUrls((prev) => ({ ...prev, [name]: previewUrl }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData()
      formDataObj.append("username", formData.username)
      formDataObj.append("fullName", formData.fullName)
      formDataObj.append("email", formData.email)
      formDataObj.append("bio", formData.bio)

      if (formData.profileImage) {
        formDataObj.append("profileImage", formData.profileImage)
      }

      if (formData.coverImage) {
        formDataObj.append("coverImage", formData.coverImage)
      }

      const response = await api.put(`/users/${currentUser.id}`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Update user in context
      updateCurrentUser(response.data)

      showToast("Profile updated successfully", "success")
      navigate(`/profile/${response.data.username}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast(error.response?.data?.message || "Failed to update profile", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <h2>Profile Information</h2>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows="4" />
            </div>
          </div>

          <div className="form-section">
            <h2>Profile Images</h2>

            <div className="form-group">
              <label htmlFor="profileImage">Profile Image</label>
              <div className="image-preview-container">
                {previewUrls.profileImage && (
                  <img
                    src={previewUrls.profileImage || "/placeholder.svg"}
                    alt="Profile preview"
                    className="image-preview profile-preview"
                  />
                )}
                <input type="file" id="profileImage" name="profileImage" onChange={handleFileChange} accept="image/*" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image</label>
              <div className="image-preview-container">
                {previewUrls.coverImage && (
                  <img
                    src={previewUrls.coverImage || "/placeholder.svg"}
                    alt="Cover preview"
                    className="image-preview cover-preview"
                  />
                )}
                <input type="file" id="coverImage" name="coverImage" onChange={handleFileChange} accept="image/*" />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/profile/${currentUser.username}`)}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default EditProfilePage
