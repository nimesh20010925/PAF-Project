"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { userAPI, postAPI } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import PostItem from "../../components/posts/PostItem"
import Loading from "../../components/common/Loading"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { username } = useParams()
  const { currentUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching user data for username: ${username}`)
        const response = await userAPI.getUserByUsername(username)
        console.log("User data response:", response)

        if (!response.data || !response.data.data) {
          console.error("Invalid user data response:", response)
          setError("Failed to load user profile: Invalid response format")
          setLoading(false)
          return
        }

        const userData = response.data.data
        setUser(userData)
        setIsFollowing(userData.isFollowing)

        // Fetch user's posts
        console.log(`Fetching posts for user ID: ${userData.id}`)
        const postsResponse = await postAPI.getPostsByUserId(userData.id)
        console.log("Posts response:", postsResponse)

        if (postsResponse.data && postsResponse.data.data) {
          setPosts(postsResponse.data.data.content || [])
        } else {
          console.error("Invalid posts response:", postsResponse)
          setPosts([])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load user profile: " + (error.response?.data?.message || error.message))
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchUserData()
    }
  }, [username])

  const handleFollow = async () => {
    if (!currentUser) {
      addToast("You must be logged in to follow users", "error")
      navigate("/login")
      return
    }

    if (followLoading) return

    try {
      setFollowLoading(true)
      console.log(`${isFollowing ? "Unfollowing" : "Following"} user with ID: ${user.id}`)

      if (isFollowing) {
        const response = await userAPI.unfollowUser(user.id)
        console.log("Unfollow response:", response)
        addToast(`You have unfollowed ${user.name || user.username}`, "success")
      } else {
        const response = await userAPI.followUser(user.id)
        console.log("Follow response:", response)
        addToast(`You are now following ${user.name || user.username}`, "success")
      }

      setIsFollowing(!isFollowing)
      setUser((prevUser) => ({
        ...prevUser,
        followersCount: isFollowing ? prevUser.followersCount - 1 : prevUser.followersCount + 1,
      }))
    } catch (error) {
      console.error(`Error ${isFollowing ? "unfollowing" : "following"} user:`, error)
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
      addToast(`Failed to ${isFollowing ? "unfollow" : "follow"} user: ${errorMessage}`, "error")
    } finally {
      setFollowLoading(false)
    }
  }

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png" // Use default avatar
    if (url.startsWith("http")) return url
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"
    return `${baseUrl}${url}`
  }

  if (loading) return <Loading />

  if (error)
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    )

  if (!user)
    return (
      <div className="not-found-container">
        <div className="not-found">User not found</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    )

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <img src={getImageUrl(user.coverImage) || "/placeholder.svg"} alt="Cover" className="cover-image" />
        </div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img src={getImageUrl(user.avatarUrl) || "/placeholder.svg"} alt={user.username} />
          </div>
          <div className="profile-details">
            <h1>{user.name || user.username}</h1>
            <p className="username">@{user.username}</p>
            {user.bio && <p className="bio">{user.bio}</p>}
            <div className="profile-stats">
              <div className="stat">
                <span className="count">{posts.length}</span> Posts
              </div>
              <Link to={`/profile/${username}/followers`} className="stat">
                <span className="count">{user.followersCount}</span> Followers
              </Link>
              <Link to={`/profile/${username}/following`} className="stat">
                <span className="count">{user.followingCount}</span> Following
              </Link>
            </div>
            <div style={{ marginTop: "20px" }}></div>
            {currentUser && currentUser.id === user.id ? (
              <Link to="/profile/edit" className="edit-profile-btn">
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`follow-btn ${isFollowing ? "following" : ""} ${followLoading ? "loading" : ""}`}
                disabled={followLoading}
              >
                {followLoading ? "Processing..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
