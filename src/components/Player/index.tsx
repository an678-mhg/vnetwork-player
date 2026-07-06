import { useHotkeys } from "@tanstack/react-hotkeys";
import React, { useRef, useState, useEffect } from "react";
import {
  MUTED_KEY,
  VOLUME_KEY,
  formatVideoTime,
  getSourceType,
  playSpeedOptions,
} from "../../utils/contants";
import {
  addFullscreenChangeListener,
  getFullscreenElement,
  toggleFullscreen,
  togglePictureInPicture,
} from "../../utils/fullscreen";
import {
  getBufferedAhead,
  getLivePosition,
  HLS_AUTO_LEVEL,
  HlsConstructorLike,
  HlsInstance,
  isSkipSegmentActive,
  LIVE_EDGE_CLICKABLE_THRESHOLD_SECONDS,
  NormalizedSkipSegment,
  normalizeSkipIntro,
  normalizeSkipOutro,
  resolveAutoQualityConfig,
} from "../../utils/player";
import { PlayerProps, Source } from "../../utils/types";
import MainSettings from "./Settings/MainSettings";
import PlaySpeedSettings from "./Settings/PlaySpeedSettings";
import QualitySettings from "./Settings/QualitySettings";
import SubtitleSettings from "./Settings/SubtitleSettings";
import CircularProgress from "../CircularProgress";
import {
  IconFullscreen,
  IconFullscreenExit,
  IconBxPlay,
  IconPlayPause,
  IconVolumeMedium,
  IconVolumeMute,
  IconSettingsSharp,
  IconPictureInPictureFill,
} from "../Icons";
import Slider from "../Slider";

const Player: React.FC<PlayerProps> = ({
  color,
  trackColor,
  bufferedColor,
  subtitle,
  playerRef: passedRef,
  className,
  poster,
  videoTitle,
  videoDescription,
  source: src,
  live,
  autoPlay,
  autoUnmuteDelay,
  startIntro,
  endIntro,
  introColor,
  startOutro,
  endOutro,
  outroColor,
  autoQualityConfig,
  Hls,
  ...props
}) => {
  const hlsRef = useRef<HlsInstance | null>(null);

  if (!src) {
    if (hlsRef.current) hlsRef.current?.destroy();
    throw new Error("Missing src props");
  }

  const source = src;
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const myRef = useRef<HTMLVideoElement | null>(null);
  const timeoutSeek = useRef<any>(null);

  const [currentSource, setCurrentSource] = useState(0);
  const [sourceMulti, setSourceMulti] = useState<Source[]>([]);
  const [autoQuality, setAutoQuality] = useState(true);
  const autoQualityRef = useRef(autoQuality);
  autoQualityRef.current = autoQuality;
  // True when the source is a single m3u8 master playlist: hls.js owns the
  // adaptive switching. False for user-provided Source[] profiles where the
  // custom stall/buffer monitor drives auto switching.
  const isMasterHlsRef = useRef(false);
  const [currentPlaySpeed, setCurrePlaySpeed] = useState(3);
  const [showControl, setShowControl] = useState(true);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [muted, setMuted] = useState<boolean>(
    () => JSON.parse(localStorage.getItem(MUTED_KEY)!) || false,
  );
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState<
    "main" | "playspeed" | "quality" | "subtitle"
  >("main");
  const [currentSubtitle, setCurrentSubtitle] = useState<number | null>(0);
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem(VOLUME_KEY)) || 100,
  );
  const [seeking, setSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<{
    time: number | null;
    left: number | null;
  }>({ time: null, left: null });
  const [liveEdgeDelay, setLiveEdgeDelay] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<
    Array<{ start: number; end: number }>
  >([]);

  // Stable identity for the source prop: effects keyed on this only re-run
  // when the actual URL list changes (an inline array prop gets a new
  // reference on every render and must not retrigger loads or listeners).
  const sourceKey =
    typeof source === "string"
      ? source
      : source?.map((item) => item?.url)?.join("|");

  const defaultColor = color || "#ef4444";
  const defaultIntroColor = introColor || "#f59e0b";
  const defaultOutroColor = outroColor || "#8b5cf6";
  const playerRef = passedRef || myRef;
  const hasVideoMetadata = Boolean(videoTitle || videoDescription);
  const canSyncLive =
    live && liveEdgeDelay > LIVE_EDGE_CLICKABLE_THRESHOLD_SECONDS;
  const introSegment = normalizeSkipIntro(startIntro, endIntro);
  const outroSegment = normalizeSkipOutro(startOutro, endOutro);
  const activeSkipSegment = isSkipSegmentActive(introSegment, currentTime)
    ? introSegment
    : isSkipSegmentActive(outroSegment, currentTime)
      ? outroSegment
      : null;
  const videoDuration = playerRef.current?.duration;
  const canShowSkipMarkers =
    !live &&
    typeof videoDuration === "number" &&
    Number.isFinite(videoDuration);
  const skipMarkers = canShowSkipMarkers
    ? [introSegment, outroSegment]
        .filter((segment): segment is NormalizedSkipSegment => Boolean(segment))
        .map((segment) => ({
          ...segment,
          color:
            segment.label === "Skip intro"
              ? defaultIntroColor
              : defaultOutroColor,
        }))
    : [];

  const updateLiveEdgeDelay = () => {
    if (!live || !playerRef.current) {
      setLiveEdgeDelay(0);
      return;
    }

    const livePosition = getLivePosition(playerRef.current, hlsRef.current);
    if (livePosition === null) {
      setLiveEdgeDelay(0);
      return;
    }

    setLiveEdgeDelay(Math.max(0, livePosition - playerRef.current.currentTime));
  };

  const handlePlayPause = () => {
    setPlay((prev) => !prev);
  };

  const handleFullScreen = () => {
    if (!videoContainerRef.current) return;

    toggleFullscreen(videoContainerRef.current);
  };

  const handleTimeUpdate = () => {
    if (seeking) return;
    setCurrentTime(playerRef?.current?.currentTime || 0);
    updateLiveEdgeDelay();
  };

  const handleToggleMuted = () => {
    setMuted((prev) => !prev);
    localStorage.setItem(MUTED_KEY, JSON.stringify(!muted));
  };

  const handleChangePlaySpeed = (index: number, value: number) => {
    setCurrePlaySpeed(index);
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.playbackRate = value;
    }
    setShowSettings(false);
    setSettingsType("main");
  };

  const applySourceChange = (index: number) => {
    if (!playerRef?.current) return;

    setCurrentSource(index);

    if (hlsRef?.current && isMasterHlsRef.current) {
      // Master playlist: switch level in place, playback continues seamlessly.
      hlsRef.current.currentLevel = index;
      return;
    }

    const existTrack = playerRef?.current?.querySelector("track");
    if (existTrack) existTrack.remove();

    const tmpCurrentTime = playerRef.current.currentTime || currentTime;

    if (hlsRef?.current) {
      const hls = hlsRef?.current;
      hls.startLevel = index;
      hls.loadSource(sourceMulti?.[index]?.url);
      hls.startLoad();
    } else {
      playerRef?.current?.setAttribute("src", sourceMulti?.[index]?.url);
    }

    setCurrentTime(tmpCurrentTime);

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.currentTime = tmpCurrentTime;
      playerRef.current.play();
    }
  };

  const handleChangeSource = (index: number) => {
    if (!playerRef?.current) return;
    if (currentSource === index && !autoQuality) return;

    setAutoQuality(false);
    applySourceChange(index);

    setShowSettings(false);
    setSettingsType("main");
  };

  const handleSelectAutoQuality = () => {
    setAutoQuality(true);

    if (hlsRef?.current && isMasterHlsRef.current) {
      hlsRef.current.currentLevel = HLS_AUTO_LEVEL;
    }

    setShowSettings(false);
    setSettingsType("main");
  };

  const handleLoadVideoMp4 = () => {
    if (hlsRef?.current) hlsRef?.current?.destroy();

    isMasterHlsRef.current = false;

    setSourceMulti(
      typeof source === "string" ? [{ label: "Default", url: source }] : source,
    );

    if (typeof source === "string") {
      playerRef?.current?.setAttribute("src", source);
    } else {
      setCurrentSource(source?.length - 1);
      playerRef?.current?.setAttribute(
        "src",
        source?.[source?.length - 1]?.url,
      );
    }
  };

  const handleLoadVideoM3u8 = () => {
    if (!Hls)
      throw Error(
        "To use video type m3u8 try install `npm i hls.js` and pass props Hls",
      );

    if (!playerRef?.current) return;
    const HlsConstructor = Hls as HlsConstructorLike;

    if (!HlsConstructor.isSupported()) throw Error("Not support hls");

    if (hlsRef?.current) {
      hlsRef?.current?.destroy();
    }

    hlsRef.current = new HlsConstructor();

    const hls = hlsRef?.current;

    hls.on(HlsConstructor.Events.MANIFEST_PARSED, function (_, data) {
      if (typeof source !== "string") {
        isMasterHlsRef.current = false;
        return setSourceMulti(source);
      }

      console.log(data?.levels || []);

      const levels = data?.levels || [];

      isMasterHlsRef.current = levels.length > 1;

      setSourceMulti(
        levels?.map((item) => ({
          label: `${item?.height}p`,
          url: Array.isArray(item?.url) ? item?.url?.[0] : item?.url || "",
        })),
      );

      if (isMasterHlsRef.current && autoQualityRef.current) {
        // Let hls.js ABR pick the level based on measured bandwidth. Clamp
        // the displayed level until the first LEVEL_SWITCHED arrives.
        setCurrentSource((prev) =>
          Math.max(0, Math.min(prev, levels.length - 1)),
        );
        hls.currentLevel = HLS_AUTO_LEVEL;
      } else {
        setCurrentSource(levels?.length - 1);
        hls.startLevel = levels?.length - 1;
      }
    });

    hls.on(HlsConstructor.Events.LEVEL_SWITCHED, function (_, data) {
      if (!isMasterHlsRef.current) return;
      if (typeof data?.level !== "number") return;
      setCurrentSource(data.level);
    });

    hls.attachMedia(playerRef?.current);

    if (typeof source === "string") {
      hls.loadSource(source);
    } else {
      hls.loadSource(source?.[currentSource]?.url);
    }

    hls.startLoad();
  };

  const handleChangeSubtitle = (index: number) => {
    setCurrentSubtitle(index);
    setShowSettings(false);
    setSettingsType("main");
  };

  const handleVideoPicture = () => {
    if (!playerRef.current) return;

    togglePictureInPicture(playerRef.current);
  };

  const handleGoLive = () => {
    if (!canSyncLive || !playerRef.current) return;

    const videoElement = playerRef.current;
    const livePosition = getLivePosition(videoElement, hlsRef.current);

    hlsRef.current?.startLoad();

    if (livePosition === null) {
      videoElement.play().catch(console.error);
      setPlay(true);
      return;
    }

    videoElement.currentTime = livePosition;
    setCurrentTime(livePosition);
    setLiveEdgeDelay(0);
    setSeeking(false);
    setPlay(true);
    videoElement.play().catch(console.error);
  };

  const handleSkipSegment = () => {
    if (!activeSkipSegment || !playerRef.current) return;

    playerRef.current.currentTime = activeSkipSegment.end;
    setCurrentTime(activeSkipSegment.end);
    setSeeking(false);
  };

  const handleVolumeChange = (volume: number) => {
    if (playerRef !== null && playerRef?.current !== null) {
      setSeeking(true);
      setVolume(volume);
      localStorage.setItem(VOLUME_KEY, JSON.stringify(volume));
      playerRef.current.volume = volume / 100;
    }
  };

  const handleTurnOffSubtitle = () => {
    setCurrentSubtitle(null);
    const track = playerRef?.current?.querySelector("track");
    if (track) {
      track.remove();
    }
    setShowSettings(false);
    setSettingsType("main");
  };

  const handleChangeTime = (time: number) => {
    if (playerRef !== null && playerRef?.current !== null) {
      setSeeking(true);
      setCurrentTime(time);

      if (timeoutSeek.current) {
        clearTimeout(timeoutSeek.current);
      }

      timeoutSeek.current = setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.currentTime = time;
        }
      }, 100);
    }
  };

  const handleDragEnd = () => {
    setPreviewTime({ time: null, left: null });
    setSeeking(false);
  };

  useEffect(() => {
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.volume = (volume <= 0 ? 0 : volume) / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (!live || !playerRef.current) {
      setLiveEdgeDelay(0);
      return;
    }

    const videoElement = playerRef.current;
    const handleLiveProgress = () => updateLiveEdgeDelay();

    videoElement.addEventListener("progress", handleLiveProgress);
    videoElement.addEventListener("loadedmetadata", handleLiveProgress);

    const interval = window.setInterval(handleLiveProgress, 1000);
    handleLiveProgress();

    return () => {
      videoElement.removeEventListener("progress", handleLiveProgress);
      videoElement.removeEventListener("loadedmetadata", handleLiveProgress);
      window.clearInterval(interval);
    };
  }, [live, sourceKey, currentSource]);

  // Track how far the video has been downloaded so the seek bar can render
  // the buffered ranges behind the playback progress.
  useEffect(() => {
    if (!playerRef.current) return;

    const videoElement = playerRef.current;
    let lastSignature = "";

    const updateBuffered = () => {
      const { buffered } = videoElement;
      const ranges: Array<{ start: number; end: number }> = [];
      let signature = "";

      for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);
        ranges.push({ start, end });
        signature += `${start.toFixed(1)}:${end.toFixed(1)};`;
      }

      // Skip the state update (and the re-render it causes) when the
      // buffered ranges have not visibly moved since the last event.
      if (signature === lastSignature) return;
      lastSignature = signature;

      setBufferedRanges(ranges);
    };

    const resetBuffered = () => {
      lastSignature = "";
      setBufferedRanges([]);
    };

    videoElement.addEventListener("progress", updateBuffered);
    videoElement.addEventListener("timeupdate", updateBuffered);
    videoElement.addEventListener("loadedmetadata", updateBuffered);
    videoElement.addEventListener("emptied", resetBuffered);

    return () => {
      videoElement.removeEventListener("progress", updateBuffered);
      videoElement.removeEventListener("timeupdate", updateBuffered);
      videoElement.removeEventListener("loadedmetadata", updateBuffered);
      videoElement.removeEventListener("emptied", resetBuffered);
    };
  }, [sourceKey, currentSource]);

  // Custom auto-quality monitor. Only used when hls.js ABR is not in charge
  // (user-provided Source[] profiles or progressive mp4): steps down one
  // profile when playback stalls repeatedly or for too long, steps back up
  // when the buffer stays healthy.
  useEffect(() => {
    if (!autoQuality) return;
    if (isMasterHlsRef.current) return;
    if (sourceMulti?.length <= 1) return;
    if (!playerRef.current) return;

    const cfg = resolveAutoQualityConfig(autoQualityConfig);
    const videoElement = playerRef.current;
    let stallTimes: number[] = [];
    let lastSwitchAt = 0;
    let lastStallAt = Date.now();
    let longStallTimeout: ReturnType<typeof setTimeout> | undefined;

    const stepTo = (index: number) => {
      lastSwitchAt = Date.now();
      stallTimes = [];
      applySourceChange(index);
    };

    const handleStall = () => {
      if (videoElement.seeking) return;

      const now = Date.now();
      if (lastSwitchAt && now - lastSwitchAt < cfg.switchGraceMs) return;

      lastStallAt = now;
      stallTimes = [
        ...stallTimes.filter((t) => now - t < cfg.stallWindowMs),
        now,
      ];

      if (currentSource <= 0) return;

      if (stallTimes.length >= cfg.stallLimit) {
        stepTo(currentSource - 1);
        return;
      }

      // A single stall that never recovers also means the profile is too
      // heavy for the current connection.
      if (longStallTimeout) clearTimeout(longStallTimeout);
      longStallTimeout = setTimeout(() => {
        if (videoElement.seeking || videoElement.paused) return;
        if (videoElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA)
          return;
        stepTo(currentSource - 1);
      }, cfg.longStallMs);
    };

    const upgradeInterval = window.setInterval(() => {
      const now = Date.now();

      if (currentSource >= sourceMulti.length - 1) return;
      if (videoElement.paused || videoElement.seeking) return;
      if (lastSwitchAt && now - lastSwitchAt < cfg.switchCooldownMs) return;
      if (now - lastStallAt < cfg.upgradeHealthyMs) return;
      if (getBufferedAhead(videoElement) < cfg.upgradeBufferSeconds) return;

      stepTo(currentSource + 1);
    }, cfg.checkIntervalMs);

    videoElement.addEventListener("waiting", handleStall);

    return () => {
      videoElement.removeEventListener("waiting", handleStall);
      window.clearInterval(upgradeInterval);
      if (longStallTimeout) clearTimeout(longStallTimeout);
    };
  }, [
    autoQuality,
    sourceMulti,
    currentSource,
    autoQualityConfig && JSON.stringify(autoQualityConfig),
  ]);

  useEffect(() => {
    let timeout: any;

    if (!play || !showControl || showSettings || seeking || previewTime?.left) {
      return;
    }

    timeout = setTimeout(() => {
      setShowControl(false);
    }, 3000);

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [showControl, play, showSettings, seeking]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setFullScreen(Boolean(getFullscreenElement()));
    };

    return addFullscreenChangeListener(handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (subtitle && subtitle.length > 0) {
      if (currentSubtitle === null) {
        return;
      }

      const oldTrack = playerRef?.current?.querySelector("track");

      if (oldTrack) {
        oldTrack.remove();
      }

      const track = document.createElement("track");
      track.src = subtitle?.[currentSubtitle]?.url;
      track.label = subtitle?.[currentSubtitle]?.lang;
      track.default = true;

      playerRef?.current?.appendChild(track);
    }
  }, [currentSubtitle, currentSource]);

  useEffect(() => {
    const type = getSourceType(
      typeof source === "string" ? source : source?.[0]?.url,
    );

    if (type === "m3u8") {
      handleLoadVideoM3u8();
    } else {
      handleLoadVideoMp4();
    }

    return () => {
      if (hlsRef?.current) {
        hlsRef?.current?.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceKey]);

  useEffect(() => {
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (!autoPlay) return;
    if (!playerRef.current) return;

    const videoElement = playerRef.current;
    let unmuteTimeout: ReturnType<typeof setTimeout> | undefined;

    const startMutedPlayback = () => {
      videoElement.muted = true;
      setMuted(true);

      videoElement.play().catch(console.error);

      if (typeof autoUnmuteDelay !== "number" || autoUnmuteDelay < 0) return;

      unmuteTimeout = setTimeout(() => {
        if (!playerRef.current) return;

        playerRef.current.muted = false;
        setMuted(false);
      }, autoUnmuteDelay);
    };

    videoElement.muted = true;
    setMuted(true);

    if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startMutedPlayback();
    } else {
      videoElement.addEventListener("loadedmetadata", startMutedPlayback, {
        once: true,
      });
    }

    return () => {
      videoElement.removeEventListener("loadedmetadata", startMutedPlayback);
      if (unmuteTimeout) clearTimeout(unmuteTimeout);
    };
  }, [autoPlay, autoUnmuteDelay, sourceKey]);

  useHotkeys(
    [
      {
        hotkey: "Space",
        callback: handlePlayPause,
      },
      {
        hotkey: "ArrowLeft",
        callback: () => {
          if (playerRef.current) {
            playerRef.current.currentTime -= 5;
          }
        },
      },
      {
        hotkey: "ArrowRight",
        callback: () => {
          if (playerRef.current) {
            playerRef.current.currentTime += 5;
          }
        },
      },
      {
        hotkey: "ArrowUp",
        callback: () => handleVolumeChange(Math.min(volume + 5, 100)),
      },
      {
        hotkey: "ArrowDown",
        callback: () => handleVolumeChange(Math.max(volume - 5, 0)),
      },
      {
        hotkey: "F",
        callback: handleFullScreen,
      },
      {
        hotkey: "M",
        callback: handleToggleMuted,
      },
    ],
    {
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: false,
    },
  );

  useEffect(() => {
    if (!play) setShowControl(true);
    play ? playerRef?.current?.play() : playerRef?.current?.pause();
  }, [play]);

  useEffect(() => {
    return () => {
      if (hlsRef?.current) hlsRef?.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={videoContainerRef}
      onMouseMove={() => setShowControl(true)}
      onMouseLeave={() => {
        if (seeking || showSettings) return;
        setShowControl(false);
      }}
      onClick={() => setShowControl(true)}
      className="video-container"
    >
      <video
        ref={playerRef}
        className={`video ${className || ""}`}
        poster={poster || ""}
        onPlay={() => setPlay(true)}
        onPause={() => setPlay(false)}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onLoad={() => setLoading(true)}
        onLoadedMetadata={() => setLoading(true)}
        {...props}
      />

      {loading && (
        <div className="center-item-absolute">
          <CircularProgress />
        </div>
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          if (e.target !== e.currentTarget) return;
          setShowSettings(false);
          setShowControl(false);
        }}
        style={{ display: showControl ? "flex" : "none" }}
        className="control-container opacity-animation"
      >
        {!loading && (
          <div
            onClick={handlePlayPause}
            className="center-item-absolute cursor-pointer"
          >
            {play ? (
              <IconPlayPause fontSize={60} />
            ) : (
              <IconBxPlay fontSize={60} />
            )}
          </div>
        )}

        {hasVideoMetadata && (
          <div className="video-meta-overlay">
            {videoTitle && <p className="video-meta-title">{videoTitle}</p>}
            {videoDescription && (
              <p className="video-meta-description">{videoDescription}</p>
            )}
          </div>
        )}

        {!live && activeSkipSegment && (
          <button
            type="button"
            className="skip-segment-button opacity-animation"
            onClick={(e) => {
              e.stopPropagation();
              handleSkipSegment();
            }}
          >
            {activeSkipSegment.label}
          </button>
        )}

        {/* Menu select play speed, quanlity, subtitle */}
        {showSettings && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (e.target !== e.currentTarget) return;
              setShowSettings(false);
              setSettingsType("main");
            }}
            className="settings-container"
          >
            <div
              className="w-full"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {settingsType === "main" ? (
                <MainSettings
                  currentQuality={
                    autoQuality && sourceMulti?.length > 1
                      ? `Auto (${sourceMulti?.[currentSource]?.label})`
                      : sourceMulti?.[currentSource]?.label
                  }
                  currentSpeed={playSpeedOptions?.[currentPlaySpeed]?.label}
                  setSettingsType={setSettingsType}
                  currentSubtitle={
                    typeof currentSubtitle === "number"
                      ? subtitle?.[currentSubtitle]?.lang
                      : "Off"
                  }
                  haveSubtitle={Boolean(subtitle)}
                  haveQuality={source?.length > 0}
                />
              ) : settingsType === "playspeed" ? (
                <PlaySpeedSettings
                  handleChangePlaySpeed={handleChangePlaySpeed}
                  currentPlaySpeed={currentPlaySpeed}
                  setSettingsType={setSettingsType}
                />
              ) : settingsType === "quality" ? (
                <QualitySettings
                  handleChangeSource={handleChangeSource}
                  currentSource={currentSource}
                  setSettingsType={setSettingsType}
                  source={sourceMulti}
                  autoQuality={autoQuality}
                  handleSelectAutoQuality={handleSelectAutoQuality}
                />
              ) : (
                <SubtitleSettings
                  currentSubtitle={currentSubtitle}
                  setSettingsType={setSettingsType}
                  handleChangeSubtitle={handleChangeSubtitle}
                  subtitle={subtitle!}
                  handleTurnOffSubtitle={handleTurnOffSubtitle}
                />
              )}
            </div>
          </div>
        )}
        <div onClick={(e) => e.stopPropagation()} className="w-full">
          {/* Seek time */}
          <Slider
            onDragEnd={handleDragEnd}
            value={currentTime}
            onChange={handleChangeTime}
            min={0}
            max={playerRef?.current?.duration as number}
            markers={skipMarkers}
            live={live}
            color={defaultColor}
            trackColor={trackColor}
            buffered={bufferedRanges}
            bufferedColor={bufferedColor}
            onPreview={(value, percentValue) => {
              setPreviewTime({ time: value, left: percentValue });
            }}
            className="tooltip-container"
          >
            {!live && Number(previewTime?.time) && previewTime?.left ? (
              <div
                style={{
                  left: `${previewTime?.left * 100}%`,
                  top: -30,
                }}
                className="tooltip"
              >
                <p>{formatVideoTime(Number(previewTime?.time))}</p>
              </div>
            ) : (
              ""
            )}
          </Slider>
          {/* Main control */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="main-control-container"
          >
            <div className="main-settings-content">
              <div
                onClick={handlePlayPause}
                className="cursor-pointer mr-3 main-settings-content tooltip-container"
              >
                {play ? (
                  <IconPlayPause fontSize={28} />
                ) : (
                  <IconBxPlay fontSize={28} />
                )}
                <div className="tooltip opacity-animation">Play</div>
              </div>

              <div className="main-settings-content">
                <div className="main-settings-content volume-container">
                  <div
                    onClick={handleToggleMuted}
                    className="cursor-pointer mr-3 main-settings-content tooltip-container"
                  >
                    {muted ? (
                      <IconVolumeMute fontSize={25} />
                    ) : (
                      <IconVolumeMedium fontSize={25} />
                    )}

                    <div className="tooltip">Volume</div>
                  </div>
                  <Slider
                    onDragEnd={handleDragEnd}
                    value={volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={100}
                    live={false}
                    color={defaultColor}
                    className="volume mr-3 width-animation"
                  />
                </div>
                {!live ? (
                  <div className="time">
                    {formatVideoTime(currentTime)}
                    {" / "}
                    {formatVideoTime(playerRef?.current?.duration as number)}
                  </div>
                ) : (
                  <div
                    onClick={handleGoLive}
                    aria-disabled={!canSyncLive}
                    className={`text-sm font-semibold live-button ${
                      canSyncLive
                        ? "cursor-pointer live-button-behind"
                        : "live-button-synced"
                    }`}
                  >
                    Live
                  </div>
                )}
              </div>
            </div>
            <div className="main-settings-content">
              <div className="tooltip-container main-settings-content">
                <IconSettingsSharp
                  onClick={() => setShowSettings(!showSettings)}
                  className="cursor-pointer mr-3"
                  fontSize={23}
                />
                <div className="tooltip">Settings</div>
              </div>
              <div className="tooltip-container main-settings-content">
                <IconPictureInPictureFill
                  onClick={handleVideoPicture}
                  className="cursor-pointer mr-3"
                  fontSize={23}
                />
                <div className="tooltip">PIP</div>
              </div>
              <div
                onClick={handleFullScreen}
                className="cursor-pointer main-settings-content tooltip-container"
              >
                {fullScreen ? (
                  <IconFullscreenExit fontSize={23} />
                ) : (
                  <IconFullscreen fontSize={23} />
                )}

                <div className="tooltip">Fullscreen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
