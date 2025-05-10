"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { userAPI, postAPI } from "../utils/api"
import PostItem from "../components/posts/PostItem"
import { useToast } from "../contexts/ToastContext"
import { useAuth } from "../contexts/AuthContext"
import Loading from "../components/common/Loading"
import "./ExplorePage.css"

const ExplorePage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState("posts")
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState({})
  const { addToast } = useToast()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (query) {
      fetchSearchResults()
    } else {
      fetchTrendingContent()
    }
  }, [query, activeTab])

  const fetchSearchResults = async () => {
    setLoading(true)
    try {
      if (activeTab === "users") {
        console.log(`Searching users with query: ${query}`)
        const response = await userAPI.searchUsers(query)
        console.log("User search response:", response)
        setUsers(response.data.data || [])
      } else {
        console.log(`Searching posts with query: ${query}`)
        const response = await postAPI.searchPosts(query)
        console.log("Post search response:", response)
        setPosts(response.data.data?.content || [])
      }
    } catch (error) {
      console.error(`Error searching ${activeTab}:`, error)
      addToast(`Failed to search ${activeTab}: ${error.response?.data?.message || error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingContent = async () => {
    setLoading(true)
    try {
      if (activeTab === "users") {
        console.log("Fetching suggested users")
        const response = await userAPI.getSuggestedUsers(10)
        console.log("Suggested users response:", response)
        setUsers(response.data.data || [])
      } else {
        console.log("Fetching all posts")
        const response = await postAPI.getAllPosts()
        console.log("All posts response:", response)
        setPosts(response.data.data?.content || [])
      }
    } catch (error) {
      console.error(`Error fetching trending ${activeTab}:`, error)
      addToast(`Failed to load trending ${activeTab}: ${error.response?.data?.message || error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId) => {
    if (!currentUser) {
      addToast("You must be logged in to follow users", "error")
      navigate("/login")
      return
    }

    if (followLoading[userId]) return

    setFollowLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      console.log(`Following user with ID: ${userId}`)
      const response = await userAPI.followUser(userId)
      console.log("Follow response:", response)

      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, isFollowing: true } : user)))

      addToast("User followed successfully", "success")
    } catch (error) {
      console.error("Error following user:", error)
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
      addToast(`Failed to follow user: ${errorMessage}`, "error")
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleUnfollow = async (userId) => {
    if (!currentUser) {
      addToast("You must be logged in to unfollow users", "error")
      navigate("/login")
      return
    }

    if (followLoading[userId]) return

    setFollowLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      console.log(`Unfollowing user with ID: ${userId}`)
      const response = await userAPI.unfollowUser(userId)
      console.log("Unfollow response:", response)

      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, isFollowing: false } : user)))

      addToast("User unfollowed successfully", "success")
    } catch (error) {
      console.error("Error unfollowing user:", error)
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
      addToast(`Failed to unfollow user: ${errorMessage}`, "error")
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png" // Use default avatar
    if (url.startsWith("http")) return url
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080"
    return `${baseUrl}${url}`
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>{query ? `Search Results for "${query}"` : "Explore"}</h1>
      </div>

      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`explore-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {activeTab === "users" ? (
            <div className="users-grid">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="user-card">
                    <Link to={`/profile/${user.username}`} className="user-card-header">
                      <img
                        src={getImageUrl(user.avatarUrl) || "/placeholder.svg"}
                        alt={user.username}
                        className="avatar avatar-lg"
                      />
                      <div className="user-card-info">
                        <h3>{user.name || user.username}</h3>
                        <p>{user.bio || "No bio available"}</p>
                      </div>
                    </Link>
                    {currentUser && currentUser.id !== user.id && (
                      <button
                        onClick={() => (user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id))}
                        className={`follow-btn ${user.isFollowing ? "unfollow" : "follow"} ${followLoading[user.id] ? "loading" : ""}`}
                        disabled={followLoading[user.id]}
                      >
                        {followLoading[user.id] ? "Processing..." : user.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-results">No users found</p>
              )}
            </div>
          ) : (
            <div className="posts-grid">
              {posts.length > 0 ? (
                posts.map((post) => <PostItem key={post.id} post={post} />)
              ) : (
                <p className="no-results">No posts found</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExplorePage
