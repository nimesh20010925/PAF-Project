"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { api } from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is authenticated
  const isAuthenticated = !!token

  useEffect(() => {
    // If token exists, load user data
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  // Set token in localStorage and axios headers
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    }
  }

  // Load user data using token
  const loadUser = async () => {
    setLoading(true)
    try {
      // Set token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Get current user's username from the token
      const tokenData = parseJwt(token)
      if (!tokenData || !tokenData.sub) {
        throw new Error("Invalid token")
      }

      const username = tokenData.sub

      // Get user data by username
      const res = await api.get(`/api/users/${username}`)
      setCurrentUser(res.data.data)
      setError(null)
    } catch (err) {
      console.error("Error loading user:", err)
      setError("Failed to load user data")
      logout()
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      const res = await api.post("/api/auth/login", credentials)
      const { token, user } = res.data.data

      setToken(token)
      setAuthToken(token)
      setCurrentUser(user)
      setError(null)
      return { success: true }
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Failed to login")
      return { success: false, error: err.response?.data?.message || "Failed to login" }
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post("/api/auth/register", userData)
      const { token, user } = res.data.data

      setToken(token)
      setAuthToken(token)
      setCurrentUser(user)
      setError(null)
      return { success: true }
    } catch (err) {
      console.error("Register error:", err)
      setError(err.response?.data?.message || "Failed to register")
      return { success: false, error: err.response?.data?.message || "Failed to register" }
    }
  }

  // Logout user
  const logout = () => {
    setToken(null)
    setCurrentUser(null)
    setAuthToken(null)
  }

  // Update user info
  const updateUser = async (userData) => {
    try {
      const res = await api.put(`/api/users/${currentUser.id}`, userData)
      setCurrentUser(res.data.data)
      return { success: true }
    } catch (err) {
      console.error("Update user error:", err)
      setError(err.response?.data?.message || "Failed to update user")
      return { success: false, error: err.response?.data?.message || "Failed to update user" }
    }
  }

  // Parse JWT to get user info
  const parseJwt = (token) => {
    try {
      if (!token) return null
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      console.error("Error parsing JWT:", e)
      return null
    }
  }

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
