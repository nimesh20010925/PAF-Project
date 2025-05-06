"use client"
import { useNavigate } from "react-router-dom"
import "./StoryCircle.css"

const StoryCircle = ({ user, story, isCreate = false }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (isCreate) {
      navigate("/stories/create")
    } else if (story) {
      // Navigate to story view with the appropriate ID
      navigate(`/stories?id=${story.id}`)
    }
  }

  if (isCreate) {
    return (
      <div className="story-circle-container" onClick={handleClick}>
        <div className="story-circle story-create">
          <div className="story-circle-content story-create-content">
            <i className="material-icons">add</i>
          </div>
        </div>
        <span className="story-username">Create</span>
      </div>
    )
  }

  const isWatched = story?.viewed
  const circleClassName = `story-circle ${isWatched ? "story-circle-watched" : ""}`

  return (
    <div className="story-circle-container" onClick={handleClick}>
      <div className={circleClassName}>
        <div className="story-circle-content">
          <img src={user?.avatarUrl || `/placeholder.svg?height=70&width=70`} alt={user?.username} />
        </div>
      </div>
      <span className="story-username">{user?.username}</span>
    </div>
  )
}

export default StoryCircle
