"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import StoryCircle from "../../components/stories/StoryCircle"
import "./StoryPages.css"

const StoriesPage = () => {
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const storiesPerPage = 10

  useEffect(() => {
    fetchStories(currentPage)
  }, [currentPage])

  const fetchStories = async (page) => {
    try {
      setLoading(true)

      const response = await api.get(`/stories?page=${page - 1}&size=${storiesPerPage}`)
      setStories(response.data.content)
      setTotalPages(response.data.totalPages)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching stories:", error)
      showToast("Failed to load stories", "error")
      setLoading(false)
    }
  }

  const handleStoryClick = (story) => {
    setSelectedStory(story)
  }

  const handleCloseStory = () => {
    setSelectedStory(null)
  }

  const handleNextStory = () => {
    const currentIndex = stories.findIndex((story) => story.id === selectedStory.id)
    if (currentIndex < stories.length - 1) {
      setSelectedStory(stories[currentIndex + 1])
    } else {
      // If last story, close viewer
      setSelectedStory(null)
    }
  }

  const handlePrevStory = () => {
    const currentIndex = stories.findIndex((story) => story.id === selectedStory.id)
    if (currentIndex > 0) {
      setSelectedStory(stories[currentIndex - 1])
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <Layout>
      <div className="stories-page-container">
        <div className="stories-header">
          <h1>Stories</h1>
          {currentUser && (
            <Link to="/create-story" className="create-story-button">
              Create Story
            </Link>
          )}
        </div>

        {loading ? (
          <div className="stories-loading">Loading stories...</div>
        ) : stories.length === 0 ? (
          <div className="no-stories">
            <p>No stories available.</p>
            {currentUser && (
              <Link to="/create-story" className="create-story-link">
                Be the first to create a story!
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="stories-grid">
              {stories.map((story) => (
                <div key={story.id} className="story-grid-item" onClick={() => handleStoryClick(story)}>
                  <StoryCircle story={story} size="medium" showUsername={true} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="pagination-button"
                >
                  Previous
                </button>

                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
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
          <div className="story-viewer-overlay">
            <div className="story-viewer">
              <div className="story-viewer-header">
                <div className="story-user-info">
                  <Link to={`/profile/${selectedStory.user.username}`} onClick={handleCloseStory}>
                    <img
                      src={selectedStory.user.profileImage || "/default-avatar.png"}
                      alt={`${selectedStory.user.username}'s avatar`}
                      className="story-user-avatar"
                    />
                    <span>{selectedStory.user.username}</span>
                  </Link>
                </div>
                <button className="close-story-button" onClick={handleCloseStory}>
                  &times;
                </button>
              </div>

              <div className="story-content">
                {selectedStory.media.mediaType.startsWith("IMAGE") ? (
                  <img
                    src={selectedStory.media.url || "/placeholder.svg"}
                    alt={selectedStory.title || "Story"}
                    className="story-media"
                  />
                ) : selectedStory.media.mediaType.startsWith("VIDEO") ? (
                  <video controls autoPlay className="story-media" src={selectedStory.media.url} />
                ) : null}

                {(selectedStory.title || selectedStory.content) && (
                  <div className="story-caption">
                    {selectedStory.title && <h3>{selectedStory.title}</h3>}
                    {selectedStory.content && <p>{selectedStory.content}</p>}
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
    </Layout>
  )
}

export default StoriesPage
