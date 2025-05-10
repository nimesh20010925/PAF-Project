"use client"

import { useState, useEffect } from "react"
import { postAPI } from "../../utils/api"
import PostItem from "../../components/posts/PostItem.js"
import "./PostsList.css"

const PostsList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postAPI.getAllPosts(page, 10) // 10 posts per page
      
      if (response.data && response.data.data) {
        const newPosts = response.data.data.content || []
        if (newPosts.length === 0) {
          setHasMore(false)
        } else {
          setPosts(prev => page === 0 ? newPosts : [...prev, ...newPosts])
        }
      }
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("Failed to load posts. " + (err.response?.data?.message || err.message || ""))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page])

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  if (loading && page === 0) {
    return (
      <div className="posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="posts-error">
        <i className="material-icons">error</i>
        <h2>Error Loading Posts</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="no-posts">
        <i className="material-icons">post_add</i>
        <h2>No Posts Found</h2>
        <p>Be the first to create a post!</p>
      </div>
    )
  }

  return (
    <div className="posts-list">
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}

      {loading && page > 0 && (
        <div className="posts-loading-more">
          <div className="loading-spinner small"></div>
          <p>Loading more posts...</p>
        </div>
      )}

      {hasMore && !loading && (
        <button onClick={loadMore} className="load-more-btn">
          Load More Posts
        </button>
      )}

      {!hasMore && (
        <div className="no-more-posts">
          <p>You've reached the end of posts</p>
        </div>
      )}
    </div>
  )
}

export default PostsList