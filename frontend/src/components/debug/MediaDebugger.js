"use client"

import { useState } from "react"
import { formatMediaUrl, createDirectImageUrl } from "../../utils/mediaUtils"

const MediaDebugger = ({ media }) => {
  const [expandedItem, setExpandedItem] = useState(null)

  if (!media || !Array.isArray(media) || media.length === 0) {
    return (
      <div className="media-debugger">
        <h3>Media Debug Information</h3>
        <p>No media available for this post.</p>
      </div>
    )
  }

  const toggleItem = (index) => {
    if (expandedItem === index) {
      setExpandedItem(null)
    } else {
      setExpandedItem(index)
    }
  }

  return (
    <div
      className="media-debugger"
      style={{
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "15px",
        margin: "15px 0",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3>Media Debug Information</h3>

      <div style={{ marginBottom: "10px" }}>
        <p>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </p>
        <p>
          <strong>API URL:</strong> {process.env.REACT_APP_API_URL || "Not set (using default)"}
        </p>
      </div>

      <div>
        <h4>Media Items ({media.length})</h4>
        {media.map((item, index) => {
          // Extract filename from URL if it exists
          const filename = item.url ? item.url.split("/").pop() : null
          const formattedUrl = formatMediaUrl(item.url)
          const directUrl = filename ? createDirectImageUrl(filename) : null

          return (
            <div
              key={index}
              style={{
                border: "1px solid #eee",
                borderRadius: "4px",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#fff",
              }}
            >
              <div
                onClick={() => toggleItem(index)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 style={{ margin: "0" }}>
                  Media #{index + 1} ({item.type || "Unknown type"})
                </h5>
                <span>{expandedItem === index ? "▼" : "►"}</span>
              </div>

              {expandedItem === index && (
                <div style={{ marginTop: "10px" }}>
                  <p>
                    <strong>ID:</strong> {item.id || "N/A"}
                  </p>
                  <p>
                    <strong>Type:</strong> {item.type || "N/A"}
                  </p>
                  <p>
                    <strong>Original URL:</strong> {item.url || "N/A"}
                  </p>
                  <p>
                    <strong>Formatted URL:</strong> {formattedUrl || "N/A"}
                  </p>
                  <p>
                    <strong>Direct URL:</strong> {directUrl || "N/A"}
                  </p>

                  <div style={{ marginTop: "15px" }}>
                    <h6>Test Image Display:</h6>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {item.url && (
                        <div style={{ textAlign: "center", maxWidth: "150px" }}>
                          <p>Original</p>
                          <img
                            src={item.url || "/placeholder.svg"}
                            alt="Original URL"
                            style={{ maxWidth: "100%", maxHeight: "100px", border: "1px solid #ddd" }}
                            onError={(e) => {
                              e.target.style.display = "none"
                              console.error("Original URL failed to load")
                            }}
                          />
                        </div>
                      )}

                      {formattedUrl && (
                        <div style={{ textAlign: "center", maxWidth: "150px" }}>
                          <p>Formatted</p>
                          <img
                            src={formattedUrl || "/placeholder.svg"}
                            alt="Formatted URL"
                            style={{ maxWidth: "100%", maxHeight: "100px", border: "1px solid #ddd" }}
                            onError={(e) => {
                              e.target.style.display = "none"
                              console.error("Formatted URL failed to load")
                            }}
                          />
                        </div>
                      )}

                      {directUrl && (
                        <div style={{ textAlign: "center", maxWidth: "150px" }}>
                          <p>Direct</p>
                          <img
                            src={directUrl || "/placeholder.svg"}
                            alt="Direct URL"
                            style={{ maxWidth: "100%", maxHeight: "100px", border: "1px solid #ddd" }}
                            onError={(e) => {
                              e.target.style.display = "none"
                              console.error("Direct URL failed to load")
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MediaDebugger
