"use client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Sidebar.css"

const Sidebar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`)
    navigate(path)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-name">SkillUp</h1>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <button onClick={() => handleNavigation("/")} className="sidebar-nav-item">
            <i className="material-icons">home</i>
            <span>Home</span>
          </button>

          <button onClick={() => handleNavigation("/explore")} className="sidebar-nav-item">
            <i className="material-icons">explore</i>
            <span>Explore</span>
          </button>

          <button onClick={() => handleNavigation("/learning-plans")} className="sidebar-nav-item">
            <i className="material-icons">school</i>
            <span>Learning Plans</span>
          </button>

          <button onClick={() => handleNavigation("/posts/create")} className="sidebar-nav-item">
            <i className="material-icons">add_circle</i>
            <span>Create Post</span>
          </button>

          <button onClick={() => handleNavigation("/stories/create")} className="sidebar-nav-item">
            <i className="material-icons">add_a_photo</i>
            <span>Create Story</span>
          </button>

          <button onClick={() => handleNavigation("/learning-plans/create")} className="sidebar-nav-item">
            <i className="material-icons">assignment</i>
            <span>Create Learning Plan</span>
          </button>

          <button onClick={() => handleNavigation("/notifications")} className="sidebar-nav-item">
            <i className="material-icons">notifications</i>
            <span>Notifications</span>
          </button>

          {currentUser && (
            <button onClick={() => handleNavigation(`/profile/${currentUser.username}`)} className="sidebar-nav-item">
              <i className="material-icons">person</i>
              <span>Profile</span>
            </button>
          )}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <i className="material-icons">exit_to_app</i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
