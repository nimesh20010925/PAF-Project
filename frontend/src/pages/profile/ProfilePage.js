"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import PostItem from "../../components/posts/PostItem"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { username } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const userResponse = await api.get(`/api/users/${username}`)

      if (!userResponse.data || !userResponse.data.data) {
        throw new Error("Invalid user data received")
      }

      setProfileUser(userResponse.data.data)

      // Check if current user is following this profile
      if (currentUser && currentUser.id !== userResponse.data.data.id) {
        try {
          const followingResponse = await api.get(`/api/users/${currentUser.id}/following`)
          const isFollowing = followingResponse.data.data.some((user) => user.id === userResponse.data.data.id)
          setIsFollowing(isFollowing)
        } catch (error) {
          console.error("Error checking follow status:", error)
        }
      }

      // Get user stats
      try {
        const postsResponse = await api.get(`/api/posts/user/${userResponse.data.data.id}`)
        const followersCount = userResponse.data.data.followersCount || 0
        const followingCount = userResponse.data.data.followingCount || 0
        const postsCount = postsResponse.data.data.totalElements || 0

        setStats({
          posts: postsCount,
          followers: followersCount,
          following: followingCount,
        })

        // Set posts
        setPosts(postsResponse.data.data.content || [])
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching profile:", error)
      showToast("Failed to load profile", "error")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [username, currentUser, showToast])

  const handleFollow = async () => {
    if (!currentUser) {
      showToast("Please login to follow users", "warning")
      return
    }

    try {
      if (isFollowing) {
        await api.post(`/users/${currentUser.id}/unfollow/${profileUser.id}`)
        setIsFollowing(false)
        setStats((prev) => ({ ...prev, followers: prev.followers - 1 }))
        showToast(`Unfollowed ${profileUser.username}`, "info")
      } else {
        await api.post(`/users/${currentUser.id}/follow/${profileUser.id}`)
        setIsFollowing(true)
        setStats((prev) => ({ ...prev, followers: prev.followers + 1 }))
        showToast(`Following ${profileUser.username}`, "success")
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
      showToast("Failed to update follow status", "error")
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="profile-page-container">
          <div className="profile-loading">Loading profile...</div>
        </div>
      </Layout>
    )
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="profile-page-container">
          <div className="profile-error">User not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="profile-page-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={profileUser.profileImage || "/default-avatar.png"} alt={`${profileUser.username}'s profile`} />
          </div>
          <div className="profile-info">
            <div className="profile-username">
              <h1>{profileUser.username}</h1>
              {currentUser && currentUser.id !== profileUser.id && (
                <button className={`follow-button ${isFollowing ? "following" : ""}`} onClick={handleFollow}>
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
              {currentUser && currentUser.id === profileUser.id && (
                <Link to="/profile/edit" className="edit-profile-button">
                  Edit Profile
                </Link>
              )}
            </div>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{stats.posts}</span> posts
              </div>
              <div className="stat">
                <Link to={`/profile/${username}/followers`}>
                  <span className="stat-number">{stats.followers}</span> followers
                </Link>
              </div>
              <div className="stat">
                <Link to={`/profile/${username}/following`}>
                  <span className="stat-number">{stats.following}</span> following
                </Link>
              </div>
            </div>
            <div className="profile-bio">
              <h2>{profileUser.fullName}</h2>
              <p>{profileUser.bio}</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button className="tab active">Posts</button>
          <Link to={`/profile/${username}/learning-plans`}>
            <button className="tab">Learning Plans</button>
          </Link>
        </div>

        <div className="profile-content">
          {posts.length === 0 ? (
            <div className="no-posts">
              {currentUser && currentUser.id === profileUser.id ? (
                <>
                  <p>You haven't posted anything yet.</p>
                  <Link to="/create-post" className="create-post-button">
                    Create your first post
                  </Link>
                </>
              ) : (
                <p>{profileUser.username} hasn't posted anything yet.</p>
              )}
            </div>
          ) : (
            <div className="profile-posts">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage
