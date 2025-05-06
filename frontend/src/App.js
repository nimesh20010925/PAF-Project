"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import "./App.css"
import { useAuth } from "./contexts/AuthContext"

// Layout and components
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Loading from "./components/common/Loading"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ProfilePage from "./pages/profile/ProfilePage"
import EditProfilePage from "./pages/profile/EditProfilePage"
import PostDetailPage from "./pages/posts/PostDetailPage"
import CreatePostPage from "./pages/posts/CreatePostPage"
import ExplorePage from "./pages/ExplorePage"
import LearningPlanPage from "./pages/learning/LearningPlanPage"
import CreateLearningPlanPage from "./pages/learning/CreateLearningPlanPage"
import EditLearningPlanPage from "./pages/learning/EditLearningPlanPage"
import NotificationsPage from "./pages/NotificationsPage"
import FollowersPage from "./pages/profile/FollowersPage"
import FollowingPage from "./pages/profile/FollowingPage"
import StoriesPage from "./pages/stories/StoriesPage"
import CreateStoryPage from "./pages/stories/CreateStoryPage"


function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading message="Loading application..." />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Move this route before the dynamic route to prevent conflicts */}
        <Route
          path="posts/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="posts/:id"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/:username"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="learning-plans"
          element={
            <ProtectedRoute>
              <LearningPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="learning-plans/create"
          element={
            <ProtectedRoute>
              <CreateLearningPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="learning-plans/:id/edit"
          element={
            <ProtectedRoute>
              <EditLearningPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/:username/followers"
          element={
            <ProtectedRoute>
              <FollowersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/:username/following"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="stories"
          element={
            <ProtectedRoute>
              <StoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="stories/create"
          element={
            <ProtectedRoute>
              <CreateStoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all route for non-existing paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
