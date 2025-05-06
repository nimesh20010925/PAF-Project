"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { postAPI } from "../utils/api"
import PostItem from "../components/posts/PostItem"
import StoryCircle from "../components/stories/StoryCircle"
import { useAuth } from "../contexts/AuthContext"
import { storyAPI } from "../utils/api"
import "./HomePage.css"
// Add error handler import
import { useErrorHandler } from "../utils/errorHandler"
import Loading from "../components/common/Loading"

// Add the hook inside the component
const HomePage = () => {
  const { currentUser } = useAuth()
  const { handleError } = useErrorHandler()
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchStories()
  }, [])

  // Update the fetchPosts function
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postAPI.getFeedPosts(page)

      if (response.data && response.data.data) {
        const postsData = response.data.data.content || []

        if (postsData.length === 0) {
          setHasMore(false)
        } else {
          setPosts((prevPosts) => (page === 0 ? postsData : [...prevPosts, ...postsData]))
        }
      } else {
        setError("Invalid response format")
      }
    } catch (err) {
      handleError(err, "Failed to load posts. Please try again.")
      setError("Failed to load posts. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStories = async () => {
    try {
      const response = await storyAPI.getFeedStories()
      setStories(response.data.data)
    } catch (err) {
      console.error("Error fetching stories:", err)
    }
  }

  const loadMorePosts = () => {
    setPage((prevPage) => prevPage + 1)
    fetchPosts()
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Feed</h1>
        <Link to="/posts/create" className="btn btn-primary">
          <i className="material-icons">add</i> Create Post
        </Link>
      </div>

      {/* Stories section */}
      <div className="stories-container">
        <StoryCircle user={currentUser} isCreate={true} key="create-story" />

        {stories.map((story) => (
          <StoryCircle key={story.id} story={story} user={story.user} />
        ))}
      </div>

      {/* Posts section */}
      <div className="posts-container">
        {error && <div className="error-message">{error}</div>}

        {posts.length > 0 ? (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        ) : !loading ? (
          <div className="empty-state">
            <i className="material-icons">sentiment_dissatisfied</i>
            <h3>No posts yet</h3>
            <p>Follow more users to see their posts or create your own!</p>
            <div className="empty-actions">
              <Link to="/explore" className="btn btn-secondary">
                Explore Users
              </Link>
              <Link to="/posts/create" className="btn btn-primary">
                Create a Post
              </Link>
            </div>
          </div>
        ) : null}

        {/* Update the loading state */}
        {loading && <Loading message="Loading posts..." />}

        {!loading && hasMore && posts.length > 0 && (
          <button className="load-more-btn" onClick={loadMorePosts}>
            Load More
          </button>
        )}
      </div>
    </div>
  )
}

export default HomePage
