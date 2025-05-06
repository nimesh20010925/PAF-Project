import { getPlaceholderImage, handleImageError } from "../../utils/placeholderUtils"

/**
 * A component to debug media URLs and display issues
 */
const MediaDebugger = ({ media }) => {
  if (!media || !Array.isArray(media) || media.length === 0) {
    return (
      <div className="media-debugger">
        <h4>Media Debug Info</h4>
        <p>No media available</p>
      </div>
    )
  }

  return (
    <div
      className="media-debugger"
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px 0",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h4>Media Debug Info</h4>
      {media.map((item, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <p>
            <strong>Media #{index + 1}</strong>
          </p>
          <p>ID: {item.id || "N/A"}</p>
          <p>Type: {item.type || "N/A"}</p>
          <p>URL: {item.url || "N/A"}</p>
          <p>Full URL: {window.location.origin + item.url}</p>
          <div>
            <p>Test Image:</p>
            <img
              src={item.url || getPlaceholderImage(200, 200, "Test Image")}
              alt={`Test ${index}`}
              style={{ maxWidth: "200px", border: "1px dashed red" }}
              onError={(e) => handleImageError(e, 200, 200, "Test image failed to load")}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default MediaDebugger
