"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { likeAPI, commentAPI } from "../../utils/api"
import "./PostItem.css"
import { processMediaItems } from "../../utils/mediaUtils"
import MediaLoader from "../media/MediaLoader"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"

const PostItem = ({ post }) => {
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [isLiked, setIsLiked] = useState(post.liked || false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [hasLoadedComments, setHasLoadedComments] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [media, setMedia] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")

  useEffect(() => {
    if (post.media && Array.isArray(post.media)) {
      console.log("Post media:", post.media)
      setMedia(processMediaItems(post.media))
    }
  }, [post.media])

  const handleLike = async () => {
    if (!isLiked) {
      try {
        await likeAPI.likePost(post.id)
        setLikesCount((prevCount) => prevCount + 1)
        setIsLiked(true)
      } catch (error) {
        console.error("Error liking post:", error)
      }
    } else {
      try {
        await likeAPI.unlikePost(post.id)
        setLikesCount((prevCount) => Math.max(0, prevCount - 1))
        setIsLiked(false)
      } catch (error) {
        console.error("Error unliking post:", error)
      }
    }
  }

  const toggleComments = async () => {
    if (!currentUser) {
      showToast("Please log in to comment", "warning")
      return
    }

    const newState = !showCommentForm
    setShowCommentForm(newState)

    if (newState && !hasLoadedComments) {
      await loadComments()
    }
  }

  const loadComments = async () => {
    try {
      setLoadingComments(true)
      const response = await commentAPI.getCommentsByPostId(post.id)
      if (response.data && response.data.data) {
        setComments(response.data.data.content || [])
      }
      setHasLoadedComments(true)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      console.log("Submitting comment for post:", post.id, "with content:", commentText)
      const response = await commentAPI.createComment(post.id, { content: commentText })
      console.log("Comment submission response:", response)

      if (response.data && response.data.data) {
        setComments([response.data.data, ...comments])
        setCommentText("")
        showToast("Comment posted successfully", "success")
      } else {
        console.error("Invalid response format:", response)
        showToast("Error posting comment: Invalid response format", "error")
      }
    } catch (error) {
      console.error("Error creating comment:", error)
      console.error("Error details:", error.response?.data || error.message)
      showToast(`Failed to post comment: ${error.response?.data?.message || error.message}`, "error")
    }
  }

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.content)
  }

  const cancelEditingComment = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return

    try {
      const response = await commentAPI.updateComment(post.id, commentId, { content: editCommentText })
      if (response.data && response.data.data) {
        // Update the comment in the local state
        setComments(
          comments.map((comment) => (comment.id === commentId ? { ...comment, content: editCommentText } : comment)),
        )
        showToast("Comment updated successfully", "success")
      }
      setEditingCommentId(null)
      setEditCommentText("")
    } catch (error) {
      console.error("Error updating comment:", error)
      showToast("Failed to update comment", "error")
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentAPI.deleteComment(post.id, commentId)
      // Remove the comment from the local state
      setComments(comments.filter((comment) => comment.id !== commentId))
      showToast("Comment deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting comment:", error)
      showToast("Failed to delete comment", "error")
    }
  }

  const canModifyComment = (comment) => {
    return currentUser && (currentUser.id === comment.user.id || currentUser.id === post.user.id)
  }

  const getPostTypeBadgeClass = () => {
    switch (post.type) {
      case "SKILL":
        return "post-type-skill"
      case "PROGRESS":
        return "post-type-progress"
      case "PLAN":
        return "post-type-plan"
      default:
        return ""
    }
  }

  const renderMedia = () => {
    if (!media || !Array.isArray(media) || media.length === 0) {
      return null
    }

    return (
      <div className={`post-media post-media-count-${media.length}`}>
        {media.map((mediaItem, index) => (
          <div key={index} className="post-media-item">
            <MediaLoader
              src={mediaItem.url}
              alt={`Post media ${index + 1}`}
              className="post-image"
              type={mediaItem.type}
              withFallback={true}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderDebugInfo = () => {
    if (!showDebug) return null

    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          margin: "10px 0",
          backgroundColor: "#f8f9fa",
          fontSize: "12px",
          overflowX: "auto",
        }}
      >
        <h4>Media Debug Info</h4>
        {media && media.length > 0 ? (
          media.map((item, index) => (
            <div key={index} style={{ marginBottom: "20px", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
              <p>
                <strong>Media #{index + 1}</strong>
              </p>
              <p>ID: {item.id || "N/A"}</p>
              <p>Type: {item.type || "N/A"}</p>
              <p>URL: {item.url || "N/A"}</p>
              <p>Original URL (pre-formatting): {item.originalUrl || "N/A"}</p>
            </div>
          ))
        ) : (
          <p>No media available</p>
        )}

        <div style={{ marginTop: "15px" }}>
          <h4>Environment</h4>
          <p>API URL: {process.env.REACT_APP_API_URL || "Not set (using default: http://localhost:8080)"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${post.user?.username || "unknown"}`} className="post-user">
          <img
            src={post.user?.avatarUrl || "/placeholder.svg?height=40&width=40"}
            alt={post.user?.username || "User"}
            className="avatar"
            crossOrigin="anonymous"
          />
          <div className="post-user-info">
            <span className="post-user-name">{post.user?.name || post.user?.username || "Unknown User"}</span>
            <span className="post-user-username">@{post.user?.username || "unknown"}</span>
          </div>
        </Link>
        <div className="post-meta">
          <span className={`post-type-badge ${getPostTypeBadgeClass()}`}>
            {post.type.charAt(0) + post.type.slice(1).toLowerCase()}
          </span>
          <span className="post-date">
            {post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy") : "Unknown date"}
          </span>
        </div>
      </div>

      <div className="post-content">
        {post.content ? <p>{post.content}</p> : <p className="text-muted">No content available</p>}
      </div>

      {/* Debug toggle button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          marginBottom: "10px",
          padding: "5px 10px",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>

      {/* Debug info */}
      {renderDebugInfo()}

      {/* Media content */}
      {renderMedia()}

      <div className="post-actions">
        <button className={`post-action-btn ${isLiked ? "liked" : ""}`} onClick={handleLike}>
          <i className="material-icons">{isLiked ? "favorite" : "favorite_border"}</i>
          <span>{likesCount}</span>
        </button>
        <button className="post-action-btn" onClick={toggleComments}>
          <i className="material-icons">chat_bubble_outline</i>
          <span>{post.commentsCount || 0}</span>
        </button>
        <Link to={`/posts/${post.id}`} className="post-action-btn">
          <i className="material-icons">open_in_new</i>
        </Link>
      </div>

      {showCommentForm && (
        <div className="post-comments">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-small">
              Post
            </button>
          </form>

          <div className="comments-list">
            {loadingComments ? (
              <div className="comments-loading">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Link to={`/profile/${comment.user.username}`} className="comment-user">
                    <img
                      src={comment.user.avatarUrl || "/placeholder.svg?height=30&width=30"}
                      alt={comment.user.username}
                      className="avatar avatar-sm"
                      crossOrigin="anonymous"
                    />
                  </Link>
                  <div className="comment-content">
                    <div className="comment-header">
                      <Link to={`/profile/${comment.user.username}`} className="comment-username">
                        {comment.user.name || comment.user.username}
                      </Link>
                      <span className="comment-date">{format(new Date(comment.createdAt), "MMM d, yyyy")}</span>

                      {canModifyComment(comment) && (
                        <div className="comment-actions">
                          {editingCommentId === comment.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateComment(comment.id)}
                                className="comment-action-btn"
                                title="Save"
                              >
                                <i className="material-icons">check</i>
                              </button>
                              <button onClick={cancelEditingComment} className="comment-action-btn" title="Cancel">
                                <i className="material-icons">close</i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingComment(comment)}
                                className="comment-action-btn"
                                title="Edit"
                              >
                                <i className="material-icons">edit</i>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="comment-action-btn"
                                title="Delete"
                              >
                                <i className="material-icons">delete</i>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="edit-comment-input"
                      />
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet. Be the first to comment!</div>
            )}

            {post.commentsCount > comments.length && (
              <Link to={`/posts/${post.id}`} className="view-all-comments">
                View all {post.commentsCount} comments
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostItem
