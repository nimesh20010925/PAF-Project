"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { storyAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import "./StoryPages.css"

const StoriesPage = () => {
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const storiesPerPage = 12

  useEffect(() => {
    fetchAllStories(currentPage)
  }, [currentPage])

  const fetchAllStories = async (page) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching all stories, page ${page}...`)
      const response = await storyAPI.getAllStories(page, storiesPerPage)

      if (response.data && response.data.success) {
        const storyData = response.data.data
        console.log("Stories data:", storyData)

        setStories(storyData.content || [])
        setTotalPages(storyData.totalPages || 1)
        setTotalElements(storyData.totalElements || 0)
      } else {
        console.error("Error in response:", response.data)
        setError("Failed to load stories. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
      setError("Failed to load stories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStoryClick = (story) => {
    console.log("Story clicked:", story)
    setSelectedStory(story)

    // Mark story as viewed
    if (story && story.id) {
      try {
        storyAPI.viewStory(story.id)
      } catch (error) {
        console.error("Error marking story as viewed:", error)
      }
    }
  }

  const handleCloseStory = () => {
    setSelectedStory(null)
  }

  const handleNextStory = () => {
    const currentIndex = stories.findIndex((story) => story.id === selectedStory.id)
    if (currentIndex < stories.length - 1) {
      setSelectedStory(stories[currentIndex + 1])
      // Mark next story as viewed
      if (stories[currentIndex + 1] && stories[currentIndex + 1].id) {
        try {
          storyAPI.viewStory(stories[currentIndex + 1].id)
        } catch (error) {
          console.error("Error marking story as viewed:", error)
        }
      }
    } else {
      // If last story, close viewer
      setSelectedStory(null)
    }
  }

  const handlePrevStory = () => {
    const currentIndex = stories.findIndex((story) => story.id === selectedStory.id)
    if (currentIndex > 0) {
      setSelectedStory(stories[currentIndex - 1])
      // Mark previous story as viewed
      if (stories[currentIndex - 1] && stories[currentIndex - 1].id) {
        try {
          storyAPI.viewStory(stories[currentIndex - 1].id)
        } catch (error) {
          console.error("Error marking story as viewed:", error)
        }
      }
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleCreateStory = () => {
    navigate("/create-story")
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="stories-page-container">
      <div className="stories-header">
        <h1>All Stories</h1>
        {currentUser && (
          <button onClick={handleCreateStory} className="create-story-button">
            Create Story
          </button>
        )}
      </div>

      {loading ? (
        <div className="stories-loading">
          <div className="loading-spinner"></div>
          <p>Loading stories...</p>
        </div>
      ) : error ? (
        <div className="stories-error">
          <p>{error}</p>
          <button onClick={() => fetchAllStories(currentPage)} className="retry-button">
            Retry
          </button>
        </div>
      ) : stories.length === 0 ? (
        <div className="no-stories">
          <p>No stories available.</p>
          {currentUser && (
            <button onClick={handleCreateStory} className="create-story-link">
              Be the first to create a story!
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="stories-grid">
            {stories.map((story) => (
              <div key={story.id} className="story-grid-item" onClick={() => handleStoryClick(story)}>
                <div className={`story-thumbnail ${story.viewed ? "viewed" : ""}`}>
                  <img
                    src={story.mediaUrl || "/placeholder.svg?height=200&width=200"}
                    alt={story.content || "Story"}
                    className="story-thumbnail-image"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/default-avatar.png"
                    }}
                  />
                  <div className="story-thumbnail-overlay">
                    <div className="story-user-info">
                      <img
                        src={story.user?.avatarUrl || "/default-avatar.png"}
                        alt={story.user?.username}
                        className="story-user-avatar"
                      />
                      <span>{story.user?.username}</span>
                    </div>
                    <span className="story-timestamp">{formatTimestamp(story.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="pagination-button"
              >
                Previous
              </button>

              <span className="page-info">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedStory && (
        <div className="story-viewer-overlay" onClick={handleCloseStory}>
          <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="story-viewer-header">
              <div className="story-user-info">
                <Link to={`/profile/${selectedStory.user?.username}`} onClick={handleCloseStory}>
                  <img
                    src={selectedStory.user?.avatarUrl || "/default-avatar.png"}
                    alt={`${selectedStory.user?.username}'s avatar`}
                    className="story-user-avatar"
                  />
                  <span>{selectedStory.user?.username}</span>
                </Link>
                <span className="story-timestamp">{formatTimestamp(selectedStory.createdAt)}</span>
              </div>
              <button className="close-story-button" onClick={handleCloseStory}>
                &times;
              </button>
            </div>

            <div className="story-content">
              {selectedStory.mediaType?.startsWith("IMAGE") ? (
                <img
                  src={selectedStory.mediaUrl || "/placeholder.svg?height=600&width=400"}
                  alt={selectedStory.content || "Story"}
                  className="story-media"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/default-avatar.png"
                  }}
                />
              ) : selectedStory.mediaType?.startsWith("VIDEO") ? (
                <video controls autoPlay className="story-media" src={selectedStory.mediaUrl}>
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="story-media-placeholder">Media not available</div>
              )}

              {selectedStory.content && (
                <div className="story-caption">
                  <p>{selectedStory.content}</p>
                </div>
              )}
            </div>

            <div className="story-navigation">
              <button
                className="story-nav-button prev"
                onClick={handlePrevStory}
                disabled={stories.findIndex((story) => story.id === selectedStory.id) === 0}
              >
                &lt;
              </button>
              <button
                className="story-nav-button next"
                onClick={handleNextStory}
                disabled={stories.findIndex((story) => story.id === selectedStory.id) === stories.length - 1}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoriesPage
