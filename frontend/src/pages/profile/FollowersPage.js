"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../utils/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import Layout from "../../components/layout/Layout"
import "./FollowPages.css"

const FollowersPage = () => {
  const { username } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  const [user, setUser] = useState(null)
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followStatus, setFollowStatus] = useState({})

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true)

        // First, get the user
        const userResponse = await api.get(`/users/username/${username}`)
        setUser(userResponse.data)

        // Then get the followers
        const followersResponse = await api.get(`/users/${userResponse.data.id}/followers`)
        setFollowers(followersResponse.data)

        // If current user is logged in, check follow status for each follower
        if (currentUser) {
          const statuses = {}

          await Promise.all(
            followersResponse.data.map(async (follower) => {
              try {
                const response = await api.get(`/users/${currentUser.id}/is-following/${follower.id}`)
                statuses[follower.id] = response.data
              } catch (error) {
                console.error(`Error checking follow status for user ${follower.id}:`, error)
                statuses[follower.id] = false
              }
            }),
          )

          setFollowStatus(statuses)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching followers:", error)
        showToast("Failed to load followers", "error")
        setLoading(false)
      }
    }

    fetchFollowers()
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
          <div className="follow-loading">Loading followers...</div>
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
          <h1>{user.username}'s Followers</h1>
          <div className="follow-navigation">
            <Link to={`/profile/${username}`} className="back-to-profile">
              Back to Profile
            </Link>
            <Link to={`/profile/${username}/following`} className="toggle-follow-view">
              View Following
            </Link>
          </div>
        </div>

        {followers.length === 0 ? (
          <div className="no-follows">
            <p>{username === currentUser?.username ? "You don't" : `${username} doesn't`} have any followers yet.</p>
          </div>
        ) : (
          <ul className="follow-list">
            {followers.map((follower) => (
              <li key={follower.id} className="follow-item">
                <div className="follow-user-info">
                  <img
                    src={follower.profileImage || "/default-avatar.png"}
                    alt={`${follower.username}'s avatar`}
                    className="follow-avatar"
                  />
                  <div className="follow-user-details">
                    <Link to={`/profile/${follower.username}`} className="follow-username">
                      {follower.username}
                    </Link>
                    <span className="follow-fullname">{follower.fullName}</span>
                  </div>
                </div>

                {currentUser && currentUser.id !== follower.id && (
                  <button
                    className={`follow-button ${followStatus[follower.id] ? "following" : ""}`}
                    onClick={() => handleFollow(follower.id)}
                  >
                    {followStatus[follower.id] ? "Following" : "Follow"}
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

export default FollowersPage
