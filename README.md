# VNETWORK Player

[![Version](https://img.shields.io/npm/v/vnetwork-player?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)
[![Downloads](https://img.shields.io/npm/dt/vnetwork-player.svg?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)

A React video player library with YouTube-like UI


## Demo Player 

<a href="https://stackblitz.com/edit/vitejs-vite-prsdgv?file=src%2FApp.tsx" target="_blank">Demo in stackblitz</a>

## Installation

```bash
npm i vnetwork-player
# or
# yarn add vnetwork-player
```

## Import

```jsx
import Player from "vnetwork-player";
import "vnetwork-player/dist/vnetwork-player.min.css" // import css
```

## Examples

### Single src

```jsx

<VPlayer
  source="https://example.com/file-video.mp4"
  // source="https://example.com/file-video.m3u8"
/>

```

### Multi src and subtitles, autoPlay, custom color

```jsx

<VPlayer
  source={
    [
      { label: "720p", url: "https://example/file/720.mp4" },
      // { label: "720p", url: "https://example/file/720.m3u8" },
      { label: "1080p", url: "https://example/file/1080.mp4" }
      // { label: "1080p", url: "https://example/file/1080.m3u8" },
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

```

### Custom Ref

```jsx

const ref = useRef(null)

useEffect(() => {
  console.log(ref?.current) // Video element
}, [ref?.current])

<VPlayer playerRef={ref} source="https://example.com/file-video.mp4" />

```

## Player props

<a href="https://github.com/an678-mhg/vnetwork-player/blob/master/src/utils/types.ts" target="_blank">https://github.com/an678-mhg/vnetwork-player/blob/master/src/utils/types.ts</a>



