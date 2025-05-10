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

  const isAuthenticated = !!token

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    }
  }

  const loadUser = async () => {
    setLoading(true)
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const tokenData = parseJwt(token)
      if (!tokenData || !tokenData.sub) throw new Error("Invalid token")
      const username = tokenData.sub
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

  const logout = () => {
    setToken(null)
    setCurrentUser(null)
    setAuthToken(null)
  }

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

  const updateCurrentUser = (user) => {
    setCurrentUser(user)
  }

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
    updateCurrentUser, // ✅ Add this to context
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
