"use client"

import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"
import { useAuth } from "../../contexts/AuthContext"
import Loading from "../common/Loading" // Add a loading component

const Layout = () => {
  const { isAuthenticated, loading } = useAuth() // Add loading state
  const location = useLocation()

  console.log("Layout rendering, path:", location.pathname, "isAuthenticated:", isAuthenticated, "loading:", loading)

  if (loading) {
    return <Loading /> // Show loading state while auth status is being checked
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        {/* Always render Outlet, conditionally render sidebar */}
        <div className="container">
          <div className={`content-grid ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`}>
            {isAuthenticated && (
              <div className="content-sidebar-left">
                <Sidebar />
              </div>
            )}
            
            <div className={`content-main ${isAuthenticated ? 'with-sidebar' : ''}`}>
              <Outlet />
            </div>
            
            {/* Optional right sidebar - remove if not needed */}
            {isAuthenticated && (
              <div className="content-sidebar-right">
                {/* Right sidebar content */}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Layout