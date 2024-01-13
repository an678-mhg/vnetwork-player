# VNETWORK Player

[![Downloads](https://img.shields.io/npm/dt/vnetwork-player.svg?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/vnetwork-player)
[![Build Size](https://img.shields.io/bundlejs/size/vnetwork-player)](https://pkg-size.dev/vnetwork-player)
[![Version](https://img.shields.io/npm/v/vnetwork-player?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)
<a href="https://pkg-size.dev/vnetwork-player"><img src="https://pkg-size.dev/badge/install/103906" title="Install size for vnetwork-player"></a>
<a href="https://pkg-size.dev/vnetwork-player"><img src="https://pkg-size.dev/badge/bundle/24854" title="Bundle size for vnetwork-player"></a>

A React component custom player support video m3u8, mp4


## Demo Player 

<a href="https://vnetwork-player.vercel.app/" target="_blank">
  https://vnetwork-player.vercel.app/
</a>

## Installation

```bash
npm i vnetwork-player
# or
# yarn add vnetwork-player
```

## Import

```jsx
import VPlayer from "vnetwork-player";
import "vnetwork-player/dist/vnetwork-player.min.css" // import css
```

## Examples

### Video MP4

```jsx

// mp4 single src

<VPlayer
  source="https://example.com/file-video.mp4"
  color="#ff0000"
  autoPlay
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

// mp4 multiple src

<VPlayer
  source={
    [
      { label: "720p", url: "https://example/file/720.mp4" },
      { label: "1080p", url: "https://example/file/1080.mp4" }
    ]
  }
  color="#ff0000"
  autoPlay
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

### Video M3U8

```bash
npm i hls.js
# or
# yarn add hls.js
```

```jsx
import Hls from 'hls.js'

// m3u8 single src

<VPlayer
  source="https://example.com/file-video.mp4"
  color="#ff0000"
  autoPlay
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
  Hls={Hls}
/>

// m3u8 multiple src

<VPlayer
  source={
    [
      { label: "720p", url: "https://example/file/720.mp4" },
      { label: "1080p", url: "https://example/file/1080.mp4" }
    ]
  }
  color="#ff0000"
  autoPlay
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
  Hls={Hls}
/>

```

### Custom Ref

```jsx

const ref = useRef(null)

useEffect(() => {
  console.log(ref?.current) // Video element
}, [ref?.current])

<VPlayer playerRef={ref} />

```

## Player props

<a href="https://github.com/an678-mhg/vnetwork-player/blob/master/src/utils/types.ts" target="_blank">https://github.com/an678-mhg/vnetwork-player/blob/master/src/utils/types.ts</a>



