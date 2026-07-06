import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  BadgeCheck,
  BookOpen,
  Braces,
  CheckCircle2,
  Copy,
  ExternalLink,
  Moon,
  Package,
  Settings2,
  Sun,
  TerminalSquare,
  Zap,
} from "lucide-react";
import Hls from "hls.js";
import VPlayer, { type PlayerProps } from "vnetwork-player-local";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type SourceMode = "mp4" | "hls" | "multi" | "live";

const SAMPLE_MP4 =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const SAMPLE_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const SAMPLE_LIVE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const SAMPLE_POSTER =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop";

const propsRows = [
  [
    "source",
    "string | Source[]",
    "Required. MP4, M3U8, or quality list. More than one profile enables the Auto quality mode.",
  ],
  ["Hls", "Hls constructor", "Required when source is an HLS / M3U8 URL."],
  ["live", "boolean", "Disables seek UI and enables click-to-live behavior."],
  ["poster", "string", "Poster image passed to the video element."],
  ["color", "string", "Accent color for progress and control states."],
  [
    "trackColor",
    "string",
    "Background color of the seek bar track (the full-length bar).",
  ],
  [
    "bufferedColor",
    "string",
    "Color of the downloaded (buffered) ranges rendered on the seek bar.",
  ],
  ["videoTitle", "string", "Title rendered in the player overlay."],
  [
    "videoDescription",
    "string",
    "Secondary metadata rendered under videoTitle in the player overlay.",
  ],
  ["subtitle", "Subtitle[]", "WebVTT tracks with { url, lang }."],
  ["autoPlay", "boolean", "Starts muted autoplay when browser allows it."],
  [
    "autoUnmuteDelay",
    "number",
    "Best-effort delayed unmute after muted autoplay, in milliseconds.",
  ],
  [
    "startIntro",
    "number",
    "Intro window start second. Used with endIntro to show Skip intro.",
  ],
  [
    "endIntro",
    "number",
    "Intro window end second and target time when Skip intro is clicked.",
  ],
  ["introColor", "string", "Color for the intro marker on the progress bar."],
  [
    "startOutro",
    "number",
    "Outro window start second. Used with endOutro to show Skip outro.",
  ],
  [
    "endOutro",
    "number",
    "Outro window end second and target time when Skip outro is clicked.",
  ],
  ["outroColor", "string", "Color for the outro marker on the progress bar."],
  [
    "autoQualityConfig",
    "Partial<AutoQualityConfig>",
    "Tuning for the auto-quality monitor used with Source[] profiles. See the Auto Quality section.",
  ],
  ["playerRef", "MutableRefObject", "Access to the underlying video element."],
  ["className", "string", "Class attached to the video element."],
  ["...videoProps", "HTMLVideoElement props", "Any native video prop."],
];

const installSnippet = `npm i vnetwork-player hls.js
import "vnetwork-player/dist/vnetwork-player.min.css";`;

const packageBadges = [
  {
    href: "https://www.npmjs.com/package/vnetwork-player",
    src: "https://img.shields.io/npm/dt/vnetwork-player.svg?style=flat&color=success",
    alt: "Downloads",
  },
  {
    href: "https://pkg-size.dev/vnetwork-player",
    src: "https://img.shields.io/bundlejs/size/vnetwork-player",
    alt: "Build size",
  },
  {
    href: "https://www.npmjs.com/package/vnetwork-player",
    src: "https://img.shields.io/npm/v/vnetwork-player?style=flat&color=success",
    alt: "Version",
  },
  {
    href: "https://pkg-size.dev/vnetwork-player",
    src: "https://pkg-size.dev/badge/install/103906",
    alt: "Install size",
  },
  {
    href: "https://pkg-size.dev/vnetwork-player",
    src: "https://pkg-size.dev/badge/bundle/24854",
    alt: "Bundle size",
  },
];

const autoQualityRows = [
  [
    "stallWindowMs",
    "10000",
    "Sliding window (ms) in which playback stalls are counted.",
  ],
  [
    "stallLimit",
    "1",
    "Stall count inside the window that triggers a downgrade.",
  ],
  [
    "longStallMs",
    "1500",
    "A single stall lasting longer than this (ms) triggers a downgrade.",
  ],
  [
    "switchCooldownMs",
    "5000",
    "Minimum time (ms) between two automatic quality switches.",
  ],
  [
    "switchGraceMs",
    "2000",
    "Stalls within this time (ms) after a switch are ignored as loading noise.",
  ],
  [
    "upgradeBufferSeconds",
    "8",
    "Buffered seconds ahead of playback required before an upgrade.",
  ],
  [
    "upgradeHealthyMs",
    "8000",
    "Time (ms) without any stall required before an upgrade.",
  ],
  [
    "checkIntervalMs",
    "1000",
    "How often (ms) the monitor evaluates an upgrade opportunity.",
  ],
];

const autoQualitySnippet = `import VPlayer, { type AutoQualityConfig } from "vnetwork-player";

<VPlayer
  source={[
    { label: "360p", url: "https://example.com/video-360.mp4" },
    { label: "720p", url: "https://example.com/video-720.mp4" },
    { label: "1080p", url: "https://example.com/video-1080.mp4" },
  ]}
  autoQualityConfig={{
    stallLimit: 2,          // need 2 stalls before downgrading
    upgradeHealthyMs: 15000 // wait 15s of healthy playback before upgrading
  }}
/>`;

const npmStatsUrl =
  "https://npm-stat.com/charts.html?package=vnetwork-player&from=2019-01-01&to=";

const usageSnippet = `import Hls from "hls.js";
import VPlayer from "vnetwork-player";
import "vnetwork-player/dist/vnetwork-player.min.css";

export function Stream() {
  return (
    <VPlayer
      source="https://example.com/master.m3u8"
      Hls={Hls}
      live
      videoTitle="Live product launch"
      videoDescription="Main stage stream"
      color="#ff0000"
      poster="/poster.jpg"
    />
  );
}`;

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sourceMode, setSourceMode] = useState<SourceMode>("hls");
  const [sourceUrl, setSourceUrl] = useState(SAMPLE_HLS);
  const [poster, setPoster] = useState(SAMPLE_POSTER);
  const [accent, setAccent] = useState("#ff0000");
  const [trackColor, setTrackColor] = useState("#9ca3af");
  const [bufferedColor, setBufferedColor] = useState("#e5e7eb");
  const [videoTitle, setVideoTitle] = useState("VNetwork Player demo stream");
  const [videoDescription, setVideoDescription] = useState(
    "Interactive playback with custom controls, metadata, skip markers, and live sync."
  );
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoUnmute, setAutoUnmute] = useState(false);
  const [autoUnmuteDelay, setAutoUnmuteDelay] = useState(3000);
  const [live, setLive] = useState(false);
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);
  const [skipIntroEnabled, setSkipIntroEnabled] = useState(true);
  const [startIntro, setStartIntro] = useState(60);
  const [endIntro, setEndIntro] = useState(120);
  const [introColor, setIntroColor] = useState("#f59e0b");
  const [skipOutroEnabled, setSkipOutroEnabled] = useState(true);
  const [startOutro, setStartOutro] = useState(500);
  const [endOutro, setEndOutro] = useState(552);
  const [outroColor, setOutroColor] = useState("#8b5cf6");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (sourceMode === "mp4") {
      setSourceUrl(SAMPLE_MP4);
      setLive(false);
    }
    if (sourceMode === "hls") {
      setSourceUrl(SAMPLE_HLS);
      setLive(false);
    }
    if (sourceMode === "live") {
      setSourceUrl(SAMPLE_LIVE);
      setLive(true);
    }
  }, [sourceMode]);

  const source = useMemo<PlayerProps["source"]>(() => {
    if (sourceMode === "multi") {
      return [
        { label: "720p", url: SAMPLE_MP4 },
        { label: "1080p", url: sourceUrl || SAMPLE_MP4 },
      ];
    }

    return sourceUrl;
  }, [sourceMode, sourceUrl]);

  const playerProps = useMemo<PlayerProps>(
    () => ({
      source,
      Hls,
      live,
      poster,
      color: accent,
      trackColor,
      bufferedColor,
      videoTitle,
      videoDescription,
      autoPlay,
      autoUnmuteDelay: autoPlay && autoUnmute ? autoUnmuteDelay : undefined,
      startIntro: skipIntroEnabled ? startIntro : undefined,
      endIntro: skipIntroEnabled ? endIntro : undefined,
      introColor: skipIntroEnabled ? introColor : undefined,
      startOutro: skipOutroEnabled ? startOutro : undefined,
      endOutro: skipOutroEnabled ? endOutro : undefined,
      outroColor: skipOutroEnabled ? outroColor : undefined,
      subtitle: subtitleEnabled
        ? [
            {
              lang: "English",
              url: "/captions.vtt",
            },
          ]
        : undefined,
    }),
    [
      accent,
      trackColor,
      bufferedColor,
      autoPlay,
      autoUnmute,
      autoUnmuteDelay,
      live,
      poster,
      videoDescription,
      videoTitle,
      endIntro,
      endOutro,
      introColor,
      skipIntroEnabled,
      skipOutroEnabled,
      outroColor,
      source,
      startIntro,
      startOutro,
      subtitleEnabled,
    ]
  );

  const snippet = useMemo(() => {
    const sourceValue =
      typeof source === "string"
        ? JSON.stringify(source)
        : JSON.stringify(source, null, 2);
    const videoTitleValue = JSON.stringify(videoTitle);
    const videoDescriptionValue = JSON.stringify(videoDescription);

    return `<VPlayer
  source={${sourceValue}}
  ${sourceMode === "hls" || sourceMode === "live" ? "Hls={Hls}" : ""}
  ${live ? "live" : ""}
  ${autoPlay ? "autoPlay" : ""}
  ${autoPlay && autoUnmute ? `autoUnmuteDelay={${autoUnmuteDelay}}` : ""}
  ${skipIntroEnabled ? `startIntro={${startIntro}}` : ""}
  ${skipIntroEnabled ? `endIntro={${endIntro}}` : ""}
  ${skipIntroEnabled ? `introColor="${introColor}"` : ""}
  ${skipOutroEnabled ? `startOutro={${startOutro}}` : ""}
  ${skipOutroEnabled ? `endOutro={${endOutro}}` : ""}
  ${skipOutroEnabled ? `outroColor="${outroColor}"` : ""}
  videoTitle={${videoTitleValue}}
  videoDescription={${videoDescriptionValue}}
  color="${accent}"
  trackColor="${trackColor}"
  bufferedColor="${bufferedColor}"
  poster="${poster}"
  ${
    subtitleEnabled
      ? 'subtitle={[{ lang: "English", url: "https://example.com/captions.vtt" }]}'
      : ""
  }
/>`
      .split("\n")
      .filter((line) => line.trim())
      .join("\n");
  }, [
    accent,
    trackColor,
    bufferedColor,
    autoPlay,
    autoUnmute,
    autoUnmuteDelay,
    live,
    poster,
    videoDescription,
    videoTitle,
    endIntro,
    endOutro,
    introColor,
    skipIntroEnabled,
    skipOutroEnabled,
    outroColor,
    source,
    sourceMode,
    startIntro,
    startOutro,
    subtitleEnabled,
  ]);

  const copySnippet = () => {
    navigator.clipboard?.writeText(snippet).catch(console.error);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pt-[73px] text-foreground">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <a href="#overview" className="flex min-w-0 items-center gap-3">
            <PlayerLogo className="size-10 shrink-0 text-primary shadow-sm" />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold leading-none">
                VNetwork Player
              </p>
              <p className="truncate text-xs text-muted-foreground">
                React video runtime docs
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["Install", "install"],
              ["Usage", "usage"],
              ["Auto Quality", "auto-quality"],
              ["Props", "props"],
              ["Playground", "playground"],
            ].map(([item, anchor]) => (
              <Button key={anchor} asChild variant="ghost" size="sm">
                <a href={`#${anchor}`}>{item}</a>
              </Button>
            ))}
          </nav>

          <Button
            className="shrink-0"
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <section id="overview" className="hero-band">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-5 sm:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-20">
          <div className="min-w-0 flex flex-col justify-center">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge variant="secondary">MP4</Badge>
              <Badge variant="secondary">HLS / M3U8</Badge>
              <Badge variant="secondary">Low latency live</Badge>
              <Badge variant="secondary">PiP + fullscreen</Badge>
            </div>
            <h1 className="max-w-4xl break-words font-display text-[2.4rem] font-black leading-tight tracking-normal sm:text-5xl md:text-6xl">
              Ship a focused video player with a docs surface that behaves like
              an instrument panel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Installation, usage, props, live-stream behavior, and a real
              playground are wired together so every prop change updates the
              preview and generated code.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#playground">
                  <Settings2 />
                  Open Playground
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#install">
                  <TerminalSquare />
                  Install
                </a>
              </Button>
            </div>
          </div>

          <div className="signal-panel min-w-0">
            <div className="signal-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-4">
                Runtime profile
              </p>
              <p className="mt-2 break-words font-display text-3xl font-bold">
                Custom controls, hotkeys, subtitles, quality switching, PiP,
                fullscreen, and one-click live sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="package-section border-b border-border/70 px-4 py-5 sm:px-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              <Package className="size-4" />
              npm package
            </p>
            <h2 className="mt-2 break-words font-display text-2xl font-bold">
              vnetwork-player
            </h2>
            <a
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              href={npmStatsUrl}
              target="_blank"
              rel="noreferrer"
            >
              View total download chart
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="package-badge-rail">
            <a
              className="npm-package-link"
              href="https://www.npmjs.com/package/vnetwork-player"
              target="_blank"
              rel="noreferrer"
            >
              Open npm
              <ExternalLink className="size-3.5" />
            </a>
            <div className="package-badges" aria-label="Package metrics">
              {packageBadges.map((badge) => (
                <a
                  key={badge.alt}
                  href={badge.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={badge.src} alt={badge.alt} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5">
        <div className="min-w-0 space-y-8">
          <Card id="install" className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TerminalSquare className="size-5 text-primary" />
                Installation
              </CardTitle>
              <CardDescription>
                Install the player, optional HLS runtime, and import the bundled
                stylesheet once in your app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={installSnippet} />
            </CardContent>
          </Card>

          <Card id="usage" className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Usage
              </CardTitle>
              <CardDescription>
                Pass `Hls` only when you play M3U8 streams. For live streams,
                set `live` to disable seeking and enable the Live button sync.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={usageSnippet} />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Keyboard", "Space, arrows, F, M shortcuts are handled."],
                  ["Live edge", "Click Live to jump back to server time."],
                  [
                    "Auto quality",
                    "Multiple profiles unlock an Auto mode that adapts to network health.",
                  ],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-md border border-border p-4"
                  >
                    <CheckCircle2 className="mb-3 size-5 text-primary" />
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="auto-quality" className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                Auto Quality
              </CardTitle>
              <CardDescription>
                With more than one profile the quality menu gets an Auto mode
                (default on) that shows the active resolution, e.g. Auto (360p).
                Master m3u8 sources use hls.js ABR; Source[] profiles use a
                built-in stall/buffer monitor tuned via `autoQualityConfig`.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={autoQualitySnippet} />
              <div className="mt-5 max-w-full overflow-x-auto rounded-md border border-border">
                {autoQualityRows.map(([name, defaultValue, description]) => (
                  <div
                    key={name}
                    className="grid min-w-[620px] gap-3 border-b border-border p-4 last:border-b-0 md:min-w-0 md:grid-cols-[200px_90px_1fr]"
                  >
                    <code className="font-mono text-sm text-primary">
                      {name}
                    </code>
                    <code className="font-mono text-xs text-muted-foreground">
                      {defaultValue}
                    </code>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Defaults react fast: one stall or a 1.5s freeze drops one
                profile immediately, and a healthy connection recovers one step
                after ~8s — similar to YouTube. All fields are optional; omitted
                fields fall back to DEFAULT_AUTO_QUALITY_CONFIG (exported by the
                package).
              </p>
            </CardContent>
          </Card>

          <Card id="props" className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Braces className="size-5 text-primary" />
                Props API
              </CardTitle>
              <CardDescription>
                The component extends native video props and adds
                player-specific controls for stream sources, live mode, theme
                color, subtitles, and external refs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-full overflow-x-auto rounded-md border border-border">
                {propsRows.map(([name, type, description], index) => (
                  <div
                    key={name}
                    className="grid min-w-[620px] gap-3 border-b border-border p-4 last:border-b-0 md:min-w-0 md:grid-cols-[160px_190px_1fr]"
                  >
                    <code className="font-mono text-sm text-primary">
                      {name}
                    </code>
                    <code className="font-mono text-xs text-muted-foreground">
                      {type}
                    </code>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                    {index === 0 ? null : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section
        id="playground"
        className="playground-page border-t border-border/70 px-4 py-12 sm:px-5"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-3xl font-bold">
                <Zap className="size-6 text-primary" />
                Playground
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Change props below the player and watch the preview plus JSX
                update immediately.
              </p>
            </div>
            <Badge className="w-fit" variant="outline">
              {sourceMode.toUpperCase()}
            </Badge>
          </div>

          <Card className="playground-card">
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div
                className="player-shell mx-auto w-full max-w-4xl"
                style={{ "--accent": accent } as CSSProperties}
              >
                <VPlayer
                  key={`${sourceMode}-${sourceUrl}-${live}`}
                  {...playerProps}
                />
              </div>

              <Tabs defaultValue="controls">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="controls">Props control</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>

                <TabsContent value="controls" className="space-y-5 pt-4">
                  <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <Field label="Source mode">
                      <Select
                        value={sourceMode}
                        onValueChange={(value) =>
                          setSourceMode(value as SourceMode)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 file</SelectItem>
                          <SelectItem value="hls">HLS / M3U8</SelectItem>
                          <SelectItem value="live">Low latency live</SelectItem>
                          <SelectItem value="multi">
                            MP4 quality list
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Source URL">
                      <Textarea
                        value={sourceUrl}
                        onChange={(event) => setSourceUrl(event.target.value)}
                        spellCheck={false}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Accent">
                      <Input
                        type="color"
                        value={accent}
                        onChange={(event) => setAccent(event.target.value)}
                        className="h-10 p-1"
                      />
                    </Field>
                    <Field label="Poster">
                      <Input
                        value={poster}
                        onChange={(event) => setPoster(event.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="trackColor (seek bar track)">
                      <Input
                        type="color"
                        value={trackColor}
                        onChange={(event) => setTrackColor(event.target.value)}
                        className="h-10 p-1"
                      />
                    </Field>
                    <Field label="bufferedColor (downloaded ranges)">
                      <Input
                        type="color"
                        value={bufferedColor}
                        onChange={(event) =>
                          setBufferedColor(event.target.value)
                        }
                        className="h-10 p-1"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="videoTitle">
                      <Input
                        value={videoTitle}
                        onChange={(event) => setVideoTitle(event.target.value)}
                      />
                    </Field>
                    <Field label="videoDescription">
                      <Input
                        value={videoDescription}
                        onChange={(event) =>
                          setVideoDescription(event.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <ToggleRow
                      label="Live"
                      checked={live}
                      onCheckedChange={setLive}
                    />
                    <ToggleRow
                      label="Autoplay"
                      checked={autoPlay}
                      onCheckedChange={setAutoPlay}
                    />
                    <ToggleRow
                      label="Subtitle"
                      checked={subtitleEnabled}
                      onCheckedChange={setSubtitleEnabled}
                    />
                  </div>

                  <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_160px]">
                    <ToggleRow
                      label="Auto unmute"
                      checked={autoUnmute}
                      onCheckedChange={setAutoUnmute}
                    />
                    <Field label="Delay ms">
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={autoUnmuteDelay}
                        disabled={!autoUnmute}
                        onChange={(event) =>
                          setAutoUnmuteDelay(Number(event.target.value))
                        }
                      />
                    </Field>
                    <p className="text-xs leading-5 text-muted-foreground md:col-span-2">
                      Best practice is muted autoplay plus an explicit unmute
                      control. Delayed unmute is attempted only when enabled and
                      may still be blocked by browser policy.
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2">
                    <div className="space-y-3">
                      <ToggleRow
                        label="Skip intro"
                        checked={skipIntroEnabled}
                        onCheckedChange={setSkipIntroEnabled}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="startIntro">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={startIntro}
                            disabled={!skipIntroEnabled}
                            onChange={(event) =>
                              setStartIntro(Number(event.target.value))
                            }
                          />
                        </Field>
                        <Field label="endIntro">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={endIntro}
                            disabled={!skipIntroEnabled}
                            onChange={(event) =>
                              setEndIntro(Number(event.target.value))
                            }
                          />
                        </Field>
                        <Field label="introColor">
                          <Input
                            type="color"
                            value={introColor}
                            disabled={!skipIntroEnabled}
                            onChange={(event) =>
                              setIntroColor(event.target.value)
                            }
                            className="h-10 p-1"
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <ToggleRow
                        label="Skip outro"
                        checked={skipOutroEnabled}
                        onCheckedChange={setSkipOutroEnabled}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="startOutro">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={startOutro}
                            disabled={!skipOutroEnabled}
                            onChange={(event) =>
                              setStartOutro(Number(event.target.value))
                            }
                          />
                        </Field>
                        <Field label="endOutro">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={endOutro}
                            disabled={!skipOutroEnabled}
                            onChange={(event) =>
                              setEndOutro(Number(event.target.value))
                            }
                          />
                        </Field>
                        <Field label="outroColor">
                          <Input
                            type="color"
                            value={outroColor}
                            disabled={!skipOutroEnabled}
                            onChange={(event) =>
                              setOutroColor(event.target.value)
                            }
                            className="h-10 p-1"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Generated JSX
                    </p>
                    <Button size="sm" variant="outline" onClick={copySnippet}>
                      <Copy />
                      Copy
                    </Button>
                  </div>
                  <CodeBlock code={snippet} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            Built with Rsbuild, Rspack, React, Tailwind, and shadcn/ui.
          </span>
          <span className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-primary" />
            Live props playground included
          </span>
        </div>
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  className,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 ${className}`}
    >
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="code-block">
      <code>{code}</code>
    </pre>
  );
}

function PlayerLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <rect width="48" height="48" rx="9" fill="currentColor" />
      <path
        d="M15.5 16.5c0-2.2 1.8-4 4-4h9c2.2 0 4 1.8 4 4v15c0 2.2-1.8 4-4 4h-9c-2.2 0-4-1.8-4-4z"
        fill="hsl(var(--primary-foreground))"
        opacity="0.18"
      />
      <path
        d="M20.5 17.7c0-1.2 1.3-1.9 2.3-1.3l9.2 5.6c1 .6 1 2.1 0 2.7l-9.2 5.6c-1 .6-2.3-.1-2.3-1.3z"
        fill="hsl(var(--primary-foreground))"
      />
      <path
        d="M12 18v12M36 18v12"
        stroke="hsl(var(--primary-foreground))"
        strokeLinecap="round"
        strokeWidth="3"
        opacity="0.72"
      />
    </svg>
  );
}

export default App;
