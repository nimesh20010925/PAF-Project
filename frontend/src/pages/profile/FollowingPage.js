"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./FollowPages.css"

const FollowingPage = () => {
  const { username } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  const [user, setUser] = useState(null)
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [followStatus, setFollowStatus] = useState({})

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true)

        // First, get the user
        const userResponse = await api.get(`/users/username/${username}`)
        setUser(userResponse.data)

        // Then get the following
        const followingResponse = await api.get(`/users/${userResponse.data.id}/following`)
        setFollowing(followingResponse.data)

        // If current user is logged in, check follow status for each followed user
        if (currentUser) {
          const statuses = {}

          await Promise.all(
            followingResponse.data.map(async (followedUser) => {
              try {
                const response = await api.get(`/users/${currentUser.id}/is-following/${followedUser.id}`)
                statuses[followedUser.id] = response.data
              } catch (error) {
                console.error(`Error checking follow status for user ${followedUser.id}:`, error)
                statuses[followedUser.id] = false
              }
            }),
          )

          setFollowStatus(statuses)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching following:", error)
        showToast("Failed to load following", "error")
        setLoading(false)
      }
    }

    fetchFollowing()
  }, [username, currentUser, showToast])

  const handleFollow = async (userId) => {
    if (!currentUser) {
      showToast("Please login to follow users", "warning")
      return
    }

    try {
      if (followStatus[userId]) {
        await api.post(`/users/${currentUser.id}/unfollow/${userId}`)
        setFollowStatus((prev) => ({ ...prev, [userId]: false }))

        // If we're viewing the current user's following list, we should remove this user
        if (currentUser.id === user.id) {
          setFollowing((prev) => prev.filter((user) => user.id !== userId))
        }

        showToast("Unfollowed successfully", "info")
      } else {
        await api.post(`/users/${currentUser.id}/follow/${userId}`)
        setFollowStatus((prev) => ({ ...prev, [userId]: true }))
        showToast("Following successfully", "success")
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
      showToast("Failed to update follow status", "error")
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="follow-page-container">
          <div className="follow-loading">Loading following...</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="follow-page-container">
          <div className="follow-error">User not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="follow-page-container">
        <div className="follow-header">
          <h1>People {user.username} Follows</h1>
          <div className="follow-navigation">
            <Link to={`/profile/${username}`} className="back-to-profile">
              Back to Profile
            </Link>
            <Link to={`/profile/${username}/followers`} className="toggle-follow-view">
              View Followers
            </Link>
          </div>
        </div>

        {following.length === 0 ? (
          <div className="no-follows">
            <p>{username === currentUser?.username ? "You aren't" : `${username} isn't`} following anyone yet.</p>
            {username === currentUser?.username && (
              <Link to="/explore" className="explore-link">
                Explore people to follow
              </Link>
            )}
          </div>
        ) : (
          <ul className="follow-list">
            {following.map((followedUser) => (
              <li key={followedUser.id} className="follow-item">
                <div className="follow-user-info">
                  <img
                    src={followedUser.profileImage || "/default-avatar.png"}
                    alt={`${followedUser.username}'s avatar`}
                    className="follow-avatar"
                  />
                  <div className="follow-user-details">
                    <Link to={`/profile/${followedUser.username}`} className="follow-username">
                      {followedUser.username}
                    </Link>
                    <span className="follow-fullname">{followedUser.fullName}</span>
                  </div>
                </div>

                {currentUser && currentUser.id !== followedUser.id && (
                  <button
                    className={`follow-button ${followStatus[followedUser.id] ? "following" : ""}`}
                    onClick={() => handleFollow(followedUser.id)}
                  >
                    {followStatus[followedUser.id] ? "Following" : "Follow"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}

export default FollowingPage
