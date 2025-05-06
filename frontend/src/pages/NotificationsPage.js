"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { notificationAPI } from "../utils/api"
import { useToast } from "../contexts/ToastContext"
import "./NotificationsPage.css"

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getUserNotifications()
      setNotifications(response.data.data.content)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      addToast("Failed to load notifications", "error")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markNotificationAsRead(id)
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      addToast("Failed to mark notification as read", "error")
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllNotificationsAsRead()
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
      addToast("All notifications marked as read", "success")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      addToast("Failed to mark all notifications as read", "error")
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "LIKE":
        return "favorite"
      case "COMMENT":
        return "chat_bubble"
      case "FOLLOW":
        return "person_add"
      default:
        return "notifications"
    }
  }

  const getNotificationLink = (type, referenceId) => {
    switch (type) {
      case "LIKE":
      case "COMMENT":
        return `/posts/${referenceId}`
      case "FOLLOW":
        return `/profile/${referenceId}`
      default:
        return "#"
    }
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {notifications.some((notification) => !notification.read) && (
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? "" : "unread"}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  <i className="material-icons">{getNotificationIcon(notification.type)}</i>
                </div>
                <div className="notification-content">
                  <Link to={getNotificationLink(notification.type, notification.referenceId)}>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </Link>
                </div>
                {!notification.read && (
                  <div className="notification-badge">
                    <span></span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="material-icons">notifications_off</i>
              <h3>No notifications yet</h3>
              <p>When you get notifications, they'll show up here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
