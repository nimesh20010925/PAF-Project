"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { postAPI, commentAPI, likeAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import MediaDebugger from "../../components/debug/MediaDebugger"
import "./PostDetailPage.css"

// First, import the placeholder utilities at the top of the file
import { getPlaceholderImage, handleImageError } from "../../utils/placeholderUtils"

const PostDetailPage = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [debugMode, setDebugMode] = useState(true) // Set to true to enable debugging

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Function to fix media URLs by ensuring they have the correct base URL
  const fixMediaUrls = (mediaItems) => {
    if (!mediaItems || !Array.isArray(mediaItems)) return []

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"

    return mediaItems.map((media) => {
      if (!media) return media

      let url = media.url
      if (url && !url.startsWith("http")) {
        // If URL is relative, make it absolute
        if (url.startsWith("/")) {
          url = `${baseUrl}${url}`
        } else {
          url = `${baseUrl}/${url}`
        }
      }

      return {
        ...media,
        url: url,
      }
    })
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching post with ID:", id)
        const response = await postAPI.getPostById(id)
        console.log("Post detail response:", response)

        if (response.data && response.data.data) {
          const postData = response.data.data

          // Fix media URLs if present
          if (postData.media && Array.isArray(postData.media)) {
            postData.media = fixMediaUrls(postData.media)
            console.log("Fixed media URLs:", postData.media)
          }

          setPost(postData)
          setIsLiked(postData.liked)
          setLikesCount(postData.likesCount)
        } else {
          console.error("Invalid post response format:", response)
          setError("Failed to load post data. Invalid response format.")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post. " + (err.response?.data?.message || err.message || ""))

        // If we've tried less than 3 times and got a 404, retry after a delay
        if (retryCount < 3 && err.response?.status === 404) {
          setRetryCount((prev) => prev + 1)
          setTimeout(() => {
            fetchPost()
          }, 1000) // Wait 1 second before retrying
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const response = await commentAPI.getCommentsByPostId(id, page)

      if (response.data && response.data.data) {
        const newComments = response.data.data.content || []
        if (newComments.length === 0) {
          setHasMoreComments(false)
        } else {
          setComments((prev) => (page === 0 ? newComments : [...prev, ...newComments]))
        }
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      if (isLiked) {
        await likeAPI.unlikePost(id)
        setLikesCount((prev) => Math.max(0, prev - 1))
      } else {
        await likeAPI.likePost(id)
        setLikesCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (err) {
      console.error("Error handling like:", err)
      showToast("Failed to update like status", "error")
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      const response = await commentAPI.createComment(id, { content: commentText })

      if (response.data && response.data.data) {
        setComments((prev) => [response.data.data, ...prev])
        setCommentText("")

        // Update comment count in post
        if (post) {
          setPost((prev) => ({
            ...prev,
            commentsCount: (prev.commentsCount || 0) + 1,
          }))
        }
      }
    } catch (err) {
      console.error("Error creating comment:", err)
      showToast("Failed to post comment", "error")
    } finally {
      setSubmittingComment(false)
    }
  }

  const loadMoreComments = () => {
    setPage((prev) => prev + 1)
    fetchComments()
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      await postAPI.deletePost(id)
      showToast("Post deleted successfully", "success")
      navigate("/")
    } catch (err) {
      console.error("Error deleting post:", err)
      showToast("Failed to delete post", "error")
    }
  }

  const renderMedia = () => {
    // Check if media exists and is an array
    if (!post.media || !Array.isArray(post.media) || post.media.length === 0) {
      return null
    }

    console.log("Rendering media:", post.media)

    return (
      <div className="post-detail-media">
        {post.media.map((media, index) => (
          <div key={index} className="post-media-item">
            {media.type === "IMAGE" ? (
              <img
                src={media.url || getPlaceholderImage(300, 300, "No Image")}
                alt={`Post media ${index + 1}`}
                onError={(e) => handleImageError(e, 300, 300, "Image not available")}
              />
            ) : media.type === "VIDEO" ? (
              <video controls>
                <source src={media.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="media-unsupported">Unsupported media type</div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="post-detail-error">
        <i className="material-icons">error</i>
        <h2>Error Loading Post</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
          <Link to="/" className="btn btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <i className="material-icons">sentiment_dissatisfied</i>
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <Link to="/" className="back-button">
          <i className="material-icons">arrow_back</i>
        </Link>
        <h1>Post</h1>
        {currentUser && post.user.id === currentUser.id && (
          <div className="post-actions-dropdown">
            <button className="post-actions-btn">
              <i className="material-icons">more_vert</i>
            </button>
            <div className="post-actions-menu">
              <button onClick={handleDelete} className="delete-btn">
                <i className="material-icons">delete</i> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="post-detail-content">
        <div className="post-detail-user">
          <Link to={`/profile/${post.user.username}`} className="post-user">
            <img
              src={post.user.avatarUrl || "/placeholder.svg?height=50&width=50"}
              alt={post.user.username}
              className="avatar"
            />
            <div className="post-user-info">
              <span className="post-user-name">{post.user.name || post.user.username}</span>
              <span className="post-user-username">@{post.user.username}</span>
            </div>
          </Link>
          <div className="post-meta">
            <span className={`post-type-badge post-type-${post.type.toLowerCase()}`}>
              {post.type.charAt(0) + post.type.slice(1).toLowerCase()}
            </span>
            <span className="post-date">{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="post-detail-body">
          <p>{post.content}</p>
        </div>

        {/* Debug mode toggle button */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            marginBottom: "10px",
            padding: "5px 10px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {debugMode ? "Hide Debug Info" : "Show Debug Info"}
        </button>

        {/* Media debugger */}
        {debugMode && <MediaDebugger media={post.media} />}

        {/* Regular media display */}
        {renderMedia()}

        <div className="post-detail-stats">
          <button className={`like-button ${isLiked ? "liked" : ""}`} onClick={handleLike}>
            <i className="material-icons">{isLiked ? "favorite" : "favorite_border"}</i>
            <span>{likesCount} likes</span>
          </button>
          <div className="comments-count">
            <i className="material-icons">chat_bubble_outline</i>
            <span>{post.commentsCount || 0} comments</span>
          </div>
        </div>

        <div className="post-detail-comments">
          <h3>Comments</h3>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submittingComment}
            />
            <button type="submit" className="btn btn-primary" disabled={submittingComment || !commentText.trim()}>
              {submittingComment ? "Posting..." : "Post"}
            </button>
          </form>

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Link to={`/profile/${comment.user.username}`} className="comment-user">
                    <img
                      src={comment.user.avatarUrl || "/placeholder.svg?height=40&width=40"}
                      alt={comment.user.username}
                      className="avatar"
                    />
                  </Link>
                  <div className="comment-content">
                    <div className="comment-header">
                      <Link to={`/profile/${comment.user.username}`} className="comment-username">
                        {comment.user.name || comment.user.username}
                      </Link>
                      <span className="comment-date">{format(new Date(comment.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet. Be the first to comment!</div>
            )}

            {commentsLoading && (
              <div className="comments-loading">
                <div className="loading-spinner small"></div>
                <p>Loading comments...</p>
              </div>
            )}

            {hasMoreComments && comments.length > 0 && !commentsLoading && (
              <button onClick={loadMoreComments} className="load-more-btn">
                Load More Comments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage
