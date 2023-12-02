import VPlayer from "vnetwork-player"
import './App.css'

const App = () => {

  return (
    <VPlayer
      source={
        [
          { label: "720p", url: "https://cdn.glitch.me/cbf2cfb4-aa52-4a1f-a73c-461eef3d38e8/720.mp4" },
          { label: "1080p", url: "https://cdn.glitch.me/cbf2cfb4-aa52-4a1f-a73c-461eef3d38e8/1080.mp4" }
        ]
      }
      color="#ff0000"
      autoPlay
      multiSoucre
      subtitle={[
        {
          lang: "Fr",
          url: "/fr.vtt"
        },
        {
          lang: "En",
          url: "/en.vtt"
        },
      ]}
    />
  )
}

export default App