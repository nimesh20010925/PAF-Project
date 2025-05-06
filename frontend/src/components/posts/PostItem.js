"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { likeAPI, commentAPI } from "../../utils/api"
import "./PostItem.css"
import { getPlaceholderImage, handleImageError } from "../../utils/placeholderUtils"
// First, import the formatMediaUrl function from mediaUtils
import { formatMediaUrl, isImageUrl, isVideoUrl } from "../../utils/mediaUtils"

const PostItem = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.liked || false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [hasLoadedComments, setHasLoadedComments] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [media, setMedia] = useState([])

  useEffect(() => {
    if (post.media && Array.isArray(post.media)) {
      setMedia(fixMediaUrls(post.media)) // Call the updated fixMediaUrls function
    }
  }, [post.media])

  // Replace the fixMediaUrls function with this improved version
  const fixMediaUrls = (mediaItems) => {
    if (!mediaItems || !Array.isArray(mediaItems)) return []

    return mediaItems.map((media) => {
      if (!media?.url) return media

      // Use the utility function to format the URL properly
      const formattedUrl = formatMediaUrl(media.url)

      return { ...media, url: formattedUrl }
    })
  }

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
      const response = await commentAPI.createComment(post.id, { content: commentText })
      if (response.data && response.data.data) {
        setComments([response.data.data, ...comments])
      }
      setCommentText("")
    } catch (error) {
      console.error("Error creating comment:", error)
    }
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

  // Update the renderMedia function to better handle media types
  const renderMedia = () => {
    if (!media || !Array.isArray(media) || media.length === 0) {
      return null
    }

    return (
      <div className={`post-media post-media-count-${media.length}`}>
        {media.map((mediaItem, index) => (
          <div key={index} className="post-media-item">
            {mediaItem.type === "IMAGE" || isImageUrl(mediaItem.url) ? (
              <img
                src={mediaItem.url || getPlaceholderImage(200, 200, "No Image")}
                alt={`Post media ${index + 1}`}
                onError={(e) => handleImageError(e, 200, 200, "Image not available")}
              />
            ) : mediaItem.type === "VIDEO" || isVideoUrl(mediaItem.url) ? (
              <video controls>
                <source src={mediaItem.url} type="video/mp4" />
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
        }}
      >
        <h4>Media Debug Info</h4>
        {media && media.length > 0 ? (
          media.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>
                <strong>Media #{index + 1}</strong>
              </p>
              <p>ID: {item.id || "N/A"}</p>
              <p>Type: {item.type || "N/A"}</p>
              <p>URL: {item.url || "N/A"}</p>
            </div>
          ))
        ) : (
          <p>No media available</p>
        )}
      </div>
    )
  }

  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${post.user.username}`} className="post-user">
          <img
            src={post.user.avatarUrl || "/placeholder.svg?height=40&width=40"}
            alt={post.user.username}
            className="avatar"
          />
          <div className="post-user-info">
            <span className="post-user-name">{post.user.name || post.user.username}</span>
            <span className="post-user-username">@{post.user.username}</span>
          </div>
        </Link>
        <div className="post-meta">
          <span className={`post-type-badge ${getPostTypeBadgeClass()}`}>
            {post.type.charAt(0) + post.type.slice(1).toLowerCase()}
          </span>
          <span className="post-date">{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
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
