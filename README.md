# VNetwork Player

[![Downloads](https://img.shields.io/npm/dt/vnetwork-player.svg?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)
[![Build Size](https://img.shields.io/bundlejs/size/vnetwork-player)](https://pkg-size.dev/vnetwork-player)
[![Version](https://img.shields.io/npm/v/vnetwork-player?style=flat&color=success)](https://www.npmjs.com/package/vnetwork-player)
<a href="https://pkg-size.dev/vnetwork-player"><img src="https://pkg-size.dev/badge/install/103906" title="Install size for vnetwork-player"></a>
<a href="https://pkg-size.dev/vnetwork-player"><img src="https://pkg-size.dev/badge/bundle/24854" title="Bundle size for vnetwork-player"></a>

A focused React video player for MP4 and HLS/M3U8 streams with custom controls, keyboard shortcuts, subtitles, quality switching, PiP, fullscreen, live sync, skip intro/outro, and player metadata.

## NPM Package

[https://www.npmjs.com/package/vnetwork-player](https://www.npmjs.com/package/vnetwork-player)

Download stats: [https://npm-stat.com/charts.html?package=vnetwork-player&from=2019-01-01&to=](https://npm-stat.com/charts.html?package=vnetwork-player&from=2019-01-01&to=)

## Demo

[https://an678-mhg.github.io/vnetwork-player/](https://an678-mhg.github.io/vnetwork-player/)

## Installation

```bash
npm i vnetwork-player
```

Install `hls.js` when you need M3U8/HLS playback:

```bash
npm i hls.js
```

## Basic Usage

Import the component and stylesheet once in your app:

```tsx
import VPlayer from "vnetwork-player";
import "vnetwork-player/dist/vnetwork-player.min.css";
```

### MP4

```tsx
export function Mp4Player() {
  return (
    <VPlayer
      source="https://example.com/video.mp4"
      color="#00d3a7"
      poster="/poster.jpg"
      videoTitle="Product walkthrough"
      videoDescription="Chapter one: interface overview"
    />
  );
}
```

### MP4 Quality List

```tsx
export function QualityPlayer() {
  return (
    <VPlayer
      source={[
        { label: "720p", url: "https://example.com/video-720.mp4" },
        { label: "1080p", url: "https://example.com/video-1080.mp4" },
      ]}
      color="#00d3a7"
    />
  );
}
```

### HLS / M3U8

```tsx
import Hls from "hls.js";
import VPlayer from "vnetwork-player";
import "vnetwork-player/dist/vnetwork-player.min.css";

export function HlsPlayer() {
  return (
    <VPlayer
      source="https://example.com/master.m3u8"
      Hls={Hls}
      color="#00d3a7"
    />
  );
}
```

### Live Stream

Use `live` for low-latency/live playback. The seek bar is disabled and the `Live` button can jump the viewer back to the current live edge when they fall behind.

```tsx
import Hls from "hls.js";
import VPlayer from "vnetwork-player";

export function LivePlayer() {
  return (
    <VPlayer
      source="https://example.com/live.m3u8"
      Hls={Hls}
      live
      videoTitle="Main stage live"
      videoDescription="Low latency HLS stream"
    />
  );
}
```

## Features

- MP4 and HLS/M3U8 playback.
- Manual quality menu from `Source[]` or HLS manifest levels.
- Auto quality mode: when more than one profile is available, an `Auto` option adapts the profile to network health (hls.js ABR for master playlists, stall/buffer heuristics for custom profiles) and shows the active resolution, e.g. `Auto (360p)`.
- Keyboard shortcuts: Space, arrows, `F`, `M`.
- Picture-in-picture and fullscreen with browser fallback support.
- WebVTT subtitles.
- Live mode with one-click live edge sync.
- Muted autoplay with optional best-effort delayed unmute.
- Skip intro/outro buttons and timeline markers.
- Buffered-progress indicator on the seek bar with customizable track, buffered, played, and intro/outro marker colors.
- Optional video title and description overlay.

## Auto Quality

When more than one quality profile is available — either auto-detected from an HLS master playlist or passed manually as `Source[]` — the quality menu shows an **Auto** option (enabled by default). While Auto is active, the menu displays the resolution currently playing, e.g. `Auto (360p)`.

Two engines drive the adaptive switching:

- **Master m3u8 URL (string source):** hls.js native ABR picks the level from measured bandwidth. Manual selections switch levels in place without interrupting playback.
- **`Source[]` profiles (mp4 or per-profile m3u8 URLs):** a built-in monitor watches playback health. It steps **down** one profile when playback stalls (`stallLimit` stalls within `stallWindowMs`, or a single stall lasting `longStallMs`), and steps **up** one profile once the network stays healthy (`upgradeHealthyMs` without stalls and at least `upgradeBufferSeconds` buffered ahead).

### Tuning with `autoQualityConfig`

The monitor's thresholds can be customized through the `autoQualityConfig` prop. All fields are optional; missing fields fall back to the defaults below (also exported as `DEFAULT_AUTO_QUALITY_CONFIG`). The prop only affects the `Source[]` monitor — hls.js ABR ignores it.

```tsx
import VPlayer, { type AutoQualityConfig } from "vnetwork-player";

<VPlayer
  source={[
    { label: "360p", url: "https://example.com/video-360.mp4" },
    { label: "720p", url: "https://example.com/video-720.mp4" },
    { label: "1080p", url: "https://example.com/video-1080.mp4" },
  ]}
  autoQualityConfig={{
    stallLimit: 2, // be more tolerant: need 2 stalls before downgrading
    upgradeHealthyMs: 15000, // be more careful: wait 15s before upgrading
  }}
/>;
```

| Field                   | Default | Description                                                                  |
| ----------------------- | ------- | ---------------------------------------------------------------------------- |
| `stallWindowMs`         | `10000` | Sliding window (ms) in which stalls are counted.                             |
| `stallLimit`            | `1`     | Stall count inside the window that triggers a downgrade.                     |
| `longStallMs`           | `1500`  | A single stall lasting longer than this (ms) triggers a downgrade.           |
| `switchCooldownMs`      | `5000`  | Minimum time (ms) between two automatic switches.                            |
| `switchGraceMs`         | `2000`  | Stalls within this time (ms) after a switch are ignored (loading noise).     |
| `upgradeBufferSeconds`  | `8`     | Buffered seconds ahead of playback required before an upgrade.               |
| `upgradeHealthyMs`      | `8000`  | Time (ms) without any stall required before an upgrade.                      |
| `checkIntervalMs`       | `1000`  | How often (ms) the monitor evaluates an upgrade opportunity.                 |

The defaults are tuned to react quickly — a single stall or a 1.5s freeze immediately drops one profile, and a healthy connection recovers one step every ~8s, similar to how YouTube behaves.

## Skip Intro / Outro

`startIntro` and `endIntro` define when the `Skip intro` button appears. Clicking it seeks to `endIntro`.

`startOutro` and `endOutro` define when the `Skip outro` button appears. Clicking it seeks to `endOutro`.

```tsx
<VPlayer
  source="https://example.com/episode.mp4"
  startIntro={0}
  endIntro={82}
  introColor="#f59e0b"
  startOutro={1480}
  endOutro={1534}
  outroColor="#8b5cf6"
/>
```

The player also renders colored intro/outro markers directly on the progress bar. Hovering a marker shows its label. Use `introColor` and `outroColor` to customize marker colors.

## Subtitles

```tsx
<VPlayer
  source="https://example.com/video.mp4"
  subtitle={[
    { lang: "English", url: "/captions/en.vtt" },
    { lang: "Vietnamese", url: "/captions/vi.vtt" },
  ]}
/>
```

## Autoplay

Modern browsers generally allow autoplay only when video starts muted. `autoPlay` starts muted playback. `autoUnmuteDelay` can attempt to unmute after a delay, but browsers may still block sound until the user interacts with the page.

```tsx
<VPlayer
  source="https://example.com/video.mp4"
  autoPlay
  autoUnmuteDelay={3000}
/>
```

## Player Ref

```tsx
import { useEffect, useRef } from "react";
import VPlayer from "vnetwork-player";

export function PlayerWithRef() {
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log(playerRef.current);
  }, []);

  return (
    <VPlayer source="https://example.com/video.mp4" playerRef={playerRef} />
  );
}
```

## Props

| Prop               | Type                                         | Description                                                                |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| `source`           | `string \| Source[]`                         | Required. MP4 URL, M3U8 URL, or a manual quality list. More than one profile enables Auto quality. |
| `Hls`              | `Hls constructor`                            | Required for HLS/M3U8 streams. Pass the `hls.js` constructor.              |
| `live`             | `boolean`                                    | Enables live mode, disables seeking, and shows live edge sync behavior.    |
| `poster`           | `string`                                     | Poster image passed to the video element.                                  |
| `color`            | `string`                                     | Accent color for progress and controls.                                    |
| `trackColor`       | `string`                                     | Background color of the seek bar track (the full-length bar).              |
| `bufferedColor`    | `string`                                     | Color of the downloaded (buffered) ranges shown on the seek bar.           |
| `autoQualityConfig` | `Partial<AutoQualityConfig>`                | Tuning for the auto-quality monitor used with `Source[]` profiles. See Auto Quality. |
| `videoTitle`       | `string`                                     | Title rendered in the player overlay.                                      |
| `videoDescription` | `string`                                     | Secondary metadata rendered under `videoTitle`.                            |
| `subtitle`         | `Subtitle[]`                                 | WebVTT subtitle tracks.                                                    |
| `autoPlay`         | `boolean`                                    | Native video autoplay prop. Player starts muted for browser compatibility. |
| `autoUnmuteDelay`  | `number`                                     | Best-effort delayed unmute in milliseconds after muted autoplay.           |
| `startIntro`       | `number`                                     | Intro start second. Used with `endIntro`.                                  |
| `endIntro`         | `number`                                     | Intro end second and skip target.                                          |
| `introColor`       | `string`                                     | Color for the intro marker on the progress bar.                            |
| `startOutro`       | `number`                                     | Outro start second. Used with `endOutro`.                                  |
| `endOutro`         | `number`                                     | Outro end second and skip target.                                          |
| `outroColor`       | `string`                                     | Color for the outro marker on the progress bar.                            |
| `playerRef`        | `MutableRefObject<HTMLVideoElement \| null>` | Access to the underlying video element.                                    |
| `className`        | `string`                                     | Class attached to the video element.                                       |
| `...videoProps`    | `HTMLVideoElement props`                     | Any native video prop supported by React.                                  |

```ts
interface Source {
  url: string;
  label: string;
}

interface Subtitle {
  url: string;
  lang: string;
}
```

## Docs App

This repository includes a TypeScript Rsbuild docs app with a live props playground.

```bash
cd docs
npm install
npm run dev
```

## License

MIT
