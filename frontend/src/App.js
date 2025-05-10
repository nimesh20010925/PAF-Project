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
import LearningPlanDebugger from "./pages/learning/LearningPlanDebugger"
import LearningPlansListPage from "./pages/learning/LearningPlansListPage"

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
        {/* Static Routes */}
        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Create Post Route */}
        <Route
          path="posts/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />

        {/* Post Detail Route */}
        <Route
          path="posts/:id"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
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

        {/* Explore Page */}
        <Route
          path="explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        {/* Learning Plan Routes */}
        <Route
          path="learning-plans"
          element={
            <ProtectedRoute>
              <LearningPlansListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="learning-plans/:planId"
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

        {/* Debug Route */}
        <Route
          path="debug"
          element={
            <ProtectedRoute>
              <LearningPlanDebugger />
            </ProtectedRoute>
          }
        />

        {/* Notifications Page */}
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Followers and Following Pages */}
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

        {/* Stories Pages */}
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
