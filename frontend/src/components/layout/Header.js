"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { notificationAPI } from "../../utils/api"
import "./Header.css"

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotificationsCount()
    }
  }, [isAuthenticated])

  const fetchUnreadNotificationsCount = async () => {
    try {
      const response = await notificationAPI.getUnreadNotificationsCount()
      if (response.data && response.data.data !== undefined) {
        setUnreadNotifications(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error)
      // Don't show a toast here to avoid annoying the user
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo">
            <Link to="/">
              <h1>SkillShare</h1>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="header-search">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search skills, users, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <i className="material-icons">search</i>
                </button>
              </form>
            </div>
          )}

          <nav className="header-nav">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link">
                  <i className="material-icons">home</i>
                  <span className="nav-text">Home</span>
                </Link>
                <Link to="/explore" className="nav-link">
                  <i className="material-icons">explore</i>
                  <span className="nav-text">Explore</span>
                </Link>
                <Link to="/learning-plans" className="nav-link">
                  <i className="material-icons">school</i>
                  <span className="nav-text">Learning</span>
                </Link>
                <Link to="/notifications" className="nav-link">
                  <i className="material-icons">notifications</i>
                  <span className="nav-text">Notifications</span>
                  {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
                </Link>
                <div className="user-dropdown">
                  <div className="avatar-container" onClick={toggleDropdown}>
                    <img
                      src={currentUser?.avatarUrl || `/placeholder.svg?height=40&width=40`}
                      alt={currentUser?.username}
                      className="avatar"
                    />
                  </div>
                  {showDropdown && (
                    <div className="dropdown-menu">
                      <Link to={`/profile/${currentUser?.username}`} onClick={() => setShowDropdown(false)}>
                        <i className="material-icons">person</i> Profile
                      </Link>
                      <Link to="/profile/edit" onClick={() => setShowDropdown(false)}>
                        <i className="material-icons">settings</i> Settings
                      </Link>
                      <button onClick={handleLogout}>
                        <i className="material-icons">exit_to_app</i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
