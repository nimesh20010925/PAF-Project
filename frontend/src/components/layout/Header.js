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
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <h1>SkillUp</h1>
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
              <button type="submit" aria-label="Search">
                <i className="material-icons">search</i>
              </button>
            </form>
          </div>
        )}

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link" title="Home">
                <i className="material-icons">home</i>
                <span className="nav-text">Home</span>
              </Link>
              <Link to="/explore" className="nav-link" title="Explore">
                <i className="material-icons">explore</i>
                <span className="nav-text">Explore</span>
              </Link>
              <Link to="/learning-plans" className="nav-link" title="Learning">
                <i className="material-icons">school</i>
                <span className="nav-text">Learning</span>
              </Link>
              <Link to="/notifications" className="nav-link" title="Notifications">
                <i className="material-icons">notifications</i>
                <span className="nav-text">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                )}
              </Link>
              <div className="user-dropdown">
                <button className="avatar-btn" onClick={toggleDropdown} aria-label="User menu">
                  <img
                    src={currentUser?.avatarUrl || "/default-avatar.png"}
                    alt={currentUser?.username || "User"}
                    className="avatar"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png"
                    }}
                  />
                </button>
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
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button (hidden on desktop) */}
        <button className="mobile-menu-btn" aria-label="Menu">
          <i className="material-icons">menu</i>
        </button>
      </div>
    </header>
  )
}

export default Header