"use client"

import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"
import { useAuth } from "../../contexts/AuthContext"
import Loading from "../common/Loading"
import "./Layout.css"

const Layout = () => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  console.log("Layout rendering, path:", location.pathname, "isAuthenticated:", isAuthenticated, "loading:", loading)

  if (loading) {
    return <Loading />
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
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
                {/* Right sidebar content can be added here */}
                {/* Example: <RightSidebar /> */}
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