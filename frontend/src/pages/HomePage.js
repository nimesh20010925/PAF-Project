"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { postAPI, storyAPI } from "../utils/api"
import PostItem from "../components/posts/PostItem"
import StoryCircle from "../components/stories/StoryCircle"
import { useAuth } from "../contexts/AuthContext"
import { useErrorHandler } from "../utils/errorHandler"
import Loading from "../components/common/Loading"
import PostsList from "./posts/PostsList"
import "./HomePage.css"

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
    setPage(0)
    fetchPosts()
    fetchStories()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postAPI.getFeedPosts(page)

      if (response.data?.data) {
        const postsData = response.data.data.content || []
        if (postsData.length === 0) {
          setHasMore(false)
        } else {
          setPosts((prev) => (page === 0 ? postsData : [...prev, ...postsData]))
          setPage((prev) => prev + 1)
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
      const response = await storyAPI.getAllStories(0, 100)
      if (response.data?.data?.content) {
        setStories(response.data.data.content)
      }
    } catch (err) {
      console.error("Error fetching stories:", err)
    }
  }

  const loadMorePosts = () => {
    fetchPosts()
  }

  return (
    <div className="home-page">

      {/* SECTION 1: Create Post */}
      <section className="home-header">
        <h1>Create New Post</h1>
        <Link to="/posts/create" className="btn btn-primary">
          <i className="material-icons">add</i> Create Post
        </Link>
      </section>

      {/* SECTION 2: Stories */}
      <section>
        <h1>Stories</h1>
        <div className="stories-container">
          <StoryCircle user={currentUser} isCreate={true} key="create-story" />
          {stories.map((story) => (
            <StoryCircle key={story.id} story={story} user={story.user} />
          ))}
        </div>
      </section>

      {/* SECTION 3: Feed / Recent Posts */}
      <section>
        <h1>Feed</h1>
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

          {loading && <Loading message="Loading posts..." />}

          {!loading && hasMore && posts.length > 0 && (
            <button className="load-more-btn" onClick={loadMorePosts}>
              Load More
            </button>
          )}
        </div>
      </section>

      {/* SECTION 4: Recent Posts List */}
      <section>
        <h1>Recent Posts</h1>
        <PostsList />
      </section>
    </div>
  )
}

export default HomePage
