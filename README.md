# VNETWORK - Player

## Demo Player 

[https://stackblitz.com/edit/vitejs-vite-prsdgv?file=src%2FApp.tsx](https://stackblitz.com/edit/vitejs-vite-prsdgv?file=src%2FApp.tsx)

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

```jsx

import VPlayer from "vnetwork-player"
import { useRef } from "react"

import './App.css'

const App = () => {
  const ref = useRef<HTMLVideoElement | null>(null)

  return (
    <VPlayer
      playerRef={ref}
      src="https://kd.opstream3.com/20221216/28490_6127c8ea/index.m3u8"
    />
  )
}

export default App

```

## Props

| property                    | type                                     |
| --------------------------- | -------------------- |
| src                         | string (m3u8, mp4)   |
| className?                  | string               |
| poster?                     | string               |
| color?                      | string                                    |
| playerRef                         | React.MutableRefObject<HTMLVideoElement>       |
| subtitle?                | { lang: string; url: string }[]           |
| ...props                    | HTMLProps<HTMLVideoElement>      |


