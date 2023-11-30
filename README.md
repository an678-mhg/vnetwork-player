# VNETWORK - Player

## Installation

```bash
npm i vnetwork-player
# or
# yarn add vnetwork-player
```

## Import

```jsx
import Player from "vnetwork-player";
```

## Basic Usage

```

import { useRef } from "react"
import Player from "vnetwork-player"

const App = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <Player
      source="https://example.com/manifest.m3u8"
      className="video"
      poster=""
      color="#FF0000"
      playerRef={videoRef}
      subtitle={[
        { lang: "Eng", url: "https://cdn.jsdelivr.net/gh/naptestdev/video-examples@master/fr.vtt" }
      ]}
    />
  )
}

export default App

```

## Props

| property                    | type                 |
| --------------------------- | -------------------- |
| source                      | string (m3u8, mp4)   |
| className?                  | string               |
| poster?                     | string               |
| color?                      | string               |
| playerRef                   | React.MutableRefObject<HTMLVideoElement>       |
| subtitle                    | { lang: string; url: string }[]           |
| ...props                    | HTMLProps<HTMLVideoElement>      |


