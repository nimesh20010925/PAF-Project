"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { userAPI, postAPI } from "../utils/api"
import PostItem from "../components/posts/PostItem"
import { useToast } from "../contexts/ToastContext"
import "./ExplorePage.css"

const ExplorePage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState("posts")
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

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
        const response = await userAPI.searchUsers(query)
        setUsers(response.data.data)
      } else {
        const response = await postAPI.searchPosts(query)
        setPosts(response.data.data.content)
      }
    } catch (error) {
      console.error(`Error searching ${activeTab}:`, error)
      addToast(`Failed to search ${activeTab}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingContent = async () => {
    setLoading(true)
    try {
      if (activeTab === "users") {
        const response = await userAPI.getSuggestedUsers(10)
        setUsers(response.data.data)
      } else {
        const response = await postAPI.getAllPosts()
        setPosts(response.data.data.content)
      }
    } catch (error) {
      console.error(`Error fetching trending ${activeTab}:`, error)
      addToast(`Failed to load trending ${activeTab}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId)
      setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: true } : user)))
      addToast("User followed successfully", "success")
    } catch (error) {
      console.error("Error following user:", error)
      addToast("Failed to follow user", "error")
    }
  }

  const handleUnfollow = async (userId) => {
    try {
      await userAPI.unfollowUser(userId)
      setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: false } : user)))
      addToast("User unfollowed successfully", "success")
    } catch (error) {
      console.error("Error unfollowing user:", error)
      addToast("Failed to unfollow user", "error")
    }
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
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === "users" ? (
            <div className="users-grid">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="user-card">
                    <Link to={`/profile/${user.username}`} className="user-card-header">
                      <img
                        src={user.avatarUrl || `/placeholder.svg?height=80&width=80`}
                        alt={user.username}
                        className="avatar avatar-lg"
                      />
                      <div className="user-card-info">
                        <h3>{user.name || user.username}</h3>
                        <span>@{user.username}</span>
                      </div>
                    </Link>
                    <p className="user-bio">{user.bio || "No bio available"}</p>
                    <div className="user-stats">
                      <div className="user-stat">
                        <span className="stat-value">{user.followersCount}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                      <div className="user-stat">
                        <span className="stat-value">{user.followingCount}</span>
                        <span className="stat-label">Following</span>
                      </div>
                    </div>
                    {user.isFollowing ? (
                      <button className="btn btn-secondary w-full" onClick={() => handleUnfollow(user.id)}>
                        Unfollow
                      </button>
                    ) : (
                      <button className="btn btn-primary w-full" onClick={() => handleFollow(user.id)}>
                        Follow
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="material-icons">search</i>
                  <h3>No users found</h3>
                  <p>{query ? `No users matching "${query}"` : "Try searching for users by username or name"}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="posts-container">
              {posts.length > 0 ? (
                posts.map((post) => <PostItem key={post.id} post={post} />)
              ) : (
                <div className="empty-state">
                  <i className="material-icons">search</i>
                  <h3>No posts found</h3>
                  <p>{query ? `No posts matching "${query}"` : "Try searching for posts by content or skills"}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExplorePage
