"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { postAPI, commentAPI, likeAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import MediaDebugger from "../../components/debug/MediaDebugger"
import MediaLoader from "../media/MediaLoader"
import "./PostDetailPage.css"

// Add the import for formatMediaUrl at the top of the file
import { processMediaItems } from "../../utils/mediaUtils"

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
  // Add state for processed media
  const [processedMedia, setProcessedMedia] = useState([])

  // Define a memoized function to process media
  const processMedia = useCallback((mediaItems) => {
    if (!mediaItems || !Array.isArray(mediaItems)) return []

    console.log("Processing media items:", mediaItems)
    const processed = processMediaItems(mediaItems)
    console.log("Processed media items:", processed)
    return processed
  }, [])

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
          console.log("Post data:", postData)

          setPost(postData)
          setIsLiked(postData.liked)
          setLikesCount(postData.likesCount)

          // Process media if available
          if (postData.media && Array.isArray(postData.media)) {
            setProcessedMedia(processMedia(postData.media))
          }
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
  }, [id, processMedia])

  // Update processed media when post media changes
  useEffect(() => {
    if (post?.media && Array.isArray(post.media)) {
      setProcessedMedia(processMedia(post.media))
    }
  }, [post?.media, processMedia])

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

    if (!currentUser) {
      showToast("Please log in to comment", "warning")
      return
    }

    try {
      setSubmittingComment(true)
      console.log("Submitting comment for post:", id, "with content:", commentText)
      const response = await commentAPI.createComment(id, { content: commentText })
      console.log("Comment submission response:", response)

      if (response.data && response.data.data) {
        setComments((prev) => [response.data.data, ...prev])
        setCommentText("")
        showToast("Comment posted successfully", "success")

        // Update comment count in post
        if (post) {
          setPost((prev) => ({
            ...prev,
            commentsCount: (prev.commentsCount || 0) + 1,
          }))
        }
      } else {
        console.error("Invalid response format:", response)
        showToast("Error posting comment: Invalid response format", "error")
      }
    } catch (err) {
      console.error("Error creating comment:", err)
      console.error("Error details:", err.response?.data || err.message)
      showToast(`Failed to post comment: ${err.response?.data?.message || err.message}`, "error")
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

  // Render media using the MediaLoader component
  const renderMedia = () => {
    if (!processedMedia || !Array.isArray(processedMedia) || processedMedia.length === 0) {
      return null
    }

    return (
      <div className="post-detail-media">
        {processedMedia.map((media, index) => (
          <div key={index} className="post-media-item">
            <MediaLoader
              src={media.url}
              alt={`Post media ${index + 1}`}
              className="post-detail-image"
              type={media.type}
              withFallback={true}
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
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

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postAPI.deletePost(post.id)
        showToast("Post deleted successfully", "success")
        navigate("/")
      } catch (error) {
        console.error("Error deleting post:", error)
        showToast("Failed to delete post", "error")
      }
    }
  }

  const toggleComments = () => {
    // Implement your comment toggle logic here
    console.log("Comments toggled!")
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
              crossOrigin="anonymous"
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
        {debugMode && <MediaDebugger media={processedMedia.length > 0 ? processedMedia : post?.media} />}

        {/* Regular media display */}
        {renderMedia()}

        <div className="post-detail-stats">
          <div className="post-actions">
            <button className={`post-action-btn ${isLiked ? "liked" : ""}`} onClick={handleLike}>
              <i className="material-icons">{isLiked ? "favorite" : "favorite_border"}</i>
              <span>{likesCount}</span>
            </button>
            <button className="post-action-btn" onClick={toggleComments}>
              <i className="material-icons">chat_bubble_outline</i>
              <span>{post.commentsCount || 0}</span>
            </button>
            {currentUser && currentUser.id === post.user.id && (
              <>
                <Link to={`/posts/${post.id}/edit`} className="post-action-btn">
                  <i className="material-icons">edit</i>
                </Link>
                <button className="post-action-btn delete-btn" onClick={handleDeletePost}>
                  <i className="material-icons">delete</i>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="post-detail-comments">
          <h3>Comments</h3>

          {currentUser ? (
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
          ) : (
            <div className="login-to-comment">
              <p>
                Please <Link to="/login">log in</Link> to comment
              </p>
            </div>
          )}

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Link to={`/profile/${comment.user.username}`} className="comment-user">
                    <img
                      src={comment.user.avatarUrl || "/placeholder.svg?height=40&width=40"}
                      alt={comment.user.username}
                      className="avatar"
                      crossOrigin="anonymous"
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
