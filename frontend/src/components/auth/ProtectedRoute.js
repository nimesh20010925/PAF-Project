"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import Loading from "../common/Loading"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "loading:", loading)

  if (loading) {
    return <Loading message="Checking authentication..." />
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login")
    return <Navigate to="/login" />
  }

  console.log("Authenticated, rendering children")
  return children
}

export default ProtectedRoute
 