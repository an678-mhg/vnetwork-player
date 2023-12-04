import React, {
  useRef,
  useState,
  useEffect
} from "react";
import { MUTED_KEY, VOLUME_KEY, formatVideoTime, playSpeedOptions } from "../../utils/contants";
import { PlayerProps, Source } from "../../utils/types";
import MainSettings from "./Settings/MainSettings";
import PlaySpeedSettings from "./Settings/PlaySpeedSettings";
import QualitySettings from "./Settings/QualitySettings";
import SubtitleSettings from "./Settings/SubtitleSettings";
import CircularProgress from "../CircularProgress";
import { IconFullscreen, IconFullscreenExit, IconBxPlay, IconPlayPause, IconVolumeMedium, IconVolumeMute, IconSettingsSharp, IconPictureInPictureFill } from '../Icons'

const Player: React.FC<PlayerProps> = ({
  color,
  subtitle,
  playerRef: passedRef,
  className,
  poster,
  source: src,
  live,
  autoPlay,
  Hls,
  ...props
}) => {
  // @ts-ignore
  const hlsRef = useRef<Hls | null>(null)

  if (!src) {
    if (hlsRef.current) hlsRef.current?.destroy()
    throw new Error("Missing src props")
  }

  const source = src as string

  const seekRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const timeoutSeekRef = useRef<any>(null)
  const volumeRef = useRef<HTMLDivElement | null>(null)
  const myRef = useRef<HTMLVideoElement | null>(null)

  const [currentSource, setCurrentSource] = useState(0);
  const [sourceMulti, setSourceMulti] = useState<Source[]>([]);
  const [currentPlaySpeed, setCurrePlaySpeed] = useState(3);
  const [showControl, setShowControl] = useState(true);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [muted, setMuted] = useState<boolean>(JSON.parse(localStorage.getItem(MUTED_KEY)!) || false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState<
    "main" | "playspeed" | "quality" | "subtitle"
  >("main");
  const [currentSubtitle, setCurrentSubtitle] = useState<number | null>(0);
  const [volume, setVolume] = useState(Number(localStorage.getItem(VOLUME_KEY)) || 100);
  const [seeking, setSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<{ time: number | null; left: number | null }>({ time: null, left: null })

  const defaultColor = color || "#ef4444"
  const playerRef = passedRef || myRef

  const handlePlayPause = () => {
    setPlay(prev => !prev)
  };

  const handleFullScreen = () => {
    if (!videoContainerRef?.current) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef?.current?.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (seeking) return
    setCurrentTime(playerRef?.current?.currentTime || 0);
  };

  const handleSeekTime = (e: any) => {
    if (live) return;

    const clientX = e?.clientX || e?.touches?.[0]?.clientX || 0;
    const left = seekRef.current?.getBoundingClientRect().left as number;
    const width = seekRef.current?.getBoundingClientRect().width as number;
    const percent = (clientX - left) / width;

    document.body.style.userSelect = "none";

    if (timeoutSeekRef?.current) {
      clearTimeout(timeoutSeekRef?.current);
    }

    timeoutSeekRef.current = setTimeout(() => {
      if (clientX <= left) {
        if (playerRef !== null && playerRef?.current !== null) {
          playerRef.current.currentTime = 0;
        }

        setSeeking(false)
        return;
      }

      if (clientX >= width + left) {
        if (playerRef !== null && playerRef?.current !== null) {
          playerRef.current.currentTime = playerRef?.current?.duration;
        }

        setSeeking(false)
        return;
      }

      if (playerRef !== null && playerRef?.current !== null) {
        playerRef.current.currentTime = percent * playerRef.current?.duration;
      }

      setSeeking(false);
    }, 500);

    if (playerRef !== null && playerRef?.current !== null) {
      setCurrentTime(percent * (playerRef?.current.duration as number));
    }
  };

  const handleToggleMuted = () => {
    setMuted(prev => !prev)
    localStorage.setItem(MUTED_KEY, JSON.stringify(!muted))
  };

  const handleChangePlaySpeed = (index: number, value: number) => {
    setCurrePlaySpeed(index);
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.playbackRate = value;
    }
    setShowSettings(false);
    setSettingsType("main");
  };

  const handleChangeSource = (index: number) => {
    if (!playerRef?.current) return;
    if (currentSource === index) return

    setCurrentSource(index);

    const existTrack = playerRef?.current?.querySelector("track");
    if (existTrack) existTrack.remove()

    if (hlsRef?.current) {
      const hls = hlsRef?.current;
      hls.startLevel = index;
      hls.loadSource(sourceMulti?.[index]?.url);
      hls.startLoad()
    } else {
      playerRef?.current?.setAttribute("src", sourceMulti?.[index]?.url)
    };

    const tmpCurrentTime = currentTime;
    setCurrentTime(tmpCurrentTime);

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.currentTime = tmpCurrentTime;
      playerRef.current.play();
    }

    setShowSettings(false)
    setSettingsType("main")
  };

  const handleLoadVideoMp4 = () => {
    if (hlsRef?.current) hlsRef?.current?.destroy()

    setSourceMulti(typeof source === "string" ? [{ label: "Default", url: source }] : source);

    if (typeof source === "string") {
      playerRef?.current?.setAttribute("src", source)
    } else {
      // @ts-ignore
      setCurrentSource(source?.length - 1)
      // @ts-ignore
      playerRef?.current?.setAttribute("src", source?.[source?.length - 1]?.url)
    }
  }

  const handleLoadVideoM3u8 = () => {
    if (!Hls) throw Error("To use video type m3u8 try install `npm i hls.js` and pass props Hls")

    if (!playerRef?.current) return;
    // @ts-ignore
    if (!Hls.isSupported()) throw Error("Not support hls");

    if (hlsRef?.current) {
      hlsRef?.current?.destroy()
    }

    // @ts-ignore
    hlsRef?.current = new Hls();

    const hls = hlsRef?.current;

    // @ts-ignore
    hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
      if (typeof source !== 'string') {
        // @ts-ignore
        return setSourceMulti(source as Source[])
      }

      if (
        data?.levels?.length !== sourceMulti?.length &&
        sourceMulti?.length !== 0
      )
        return;

      // @ts-ignore
      setSourceMulti(data?.levels?.map((item) => ({ label: `${item?.height}p`, url: item?.url?.[0] })));
      setCurrentSource(data?.levels?.length - 1)
      hls.startLevel = data?.levels?.length - 1
    });

    hls.attachMedia(playerRef?.current);

    if (typeof source === 'string') {
      hls.loadSource(source);
    } else {
      // @ts-ignore
      hls.loadSource(source?.[currentSource]?.url)
    }

    hls.startLoad()
  };

  const handleChangeSubtitle = (index: number) => {
    setCurrentSubtitle(index);
    setShowSettings(false);
    setSettingsType("main");
  };

  const handleVideoPicture = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      playerRef?.current?.requestPictureInPicture();
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const left = volumeRef.current?.getBoundingClientRect()?.left as number
    const width = volumeRef?.current?.getBoundingClientRect()?.width as number
    const percent = (e?.clientX - left) / width;

    if (e?.clientX <= left) return
    if (e?.clientX >= width + left) return

    setVolume(percent * 100)
    localStorage.setItem(VOLUME_KEY, (percent * 100).toString())
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

  useEffect(() => {
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.volume = (volume <= 0 ? 0 : volume) / 100;
    }
  }, [volume]);

  useEffect(() => {
    let timeout: any;

    if (!play || !showControl || showSettings || seeking) {
      return;
    }

    timeout = setTimeout(() => {
      setShowControl(false);
    }, 6000);

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [showControl, play, showSettings, seeking]);

  // handle seek time in pc with mouse event
  useEffect(() => {
    const handleMouseDown = () => {
      setSeeking(true);
      document.addEventListener("mousemove", handleSeekTime);
    };

    seekRef?.current?.addEventListener("mousedown", handleMouseDown);

    return () => {
      seekRef?.current?.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // remove mouse move when mouse up
  useEffect(() => {
    const handleMouseUp = () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleSeekTime);
    };

    document?.addEventListener("mouseup", handleMouseUp);

    return () => {
      document?.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setFullScreen((prev) => !prev);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // handle seek time in mobile with touch event
  useEffect(() => {
    const handleTouchStart = () => {
      setSeeking(true);
      document.addEventListener("touchmove", handleSeekTime);
    };

    seekRef?.current?.addEventListener("touchstart", handleTouchStart);

    return () => {
      seekRef?.current?.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  useEffect(() => {
    const handleTouchEnd = () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("touchmove", handleSeekTime);
    };

    seekRef?.current?.addEventListener("touchend", handleTouchEnd);

    return () => {
      seekRef?.current?.removeEventListener("touchend", handleTouchEnd);
    };
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
    const type = typeof source === "string" ? source?.split(".")[source?.split(".")?.length - 1]
      :
      // @ts-ignore
      source?.[0]?.url?.split(".")[source?.[0]?.url?.split(".")?.length - 1];

    if (type === "mp4") {
      handleLoadVideoMp4()
    } else if (type === "m3u8") {
      handleLoadVideoM3u8();
    }

    if (autoPlay) {
      playerRef?.current?.addEventListener("loadedmetadata", () => {
        // @ts-ignore
        playerRef?.current.play()
      })
    }

    return () => {
      if (hlsRef?.current) {
        hlsRef?.current?.destroy()
      }
    }
  }, [source, sourceMulti?.length, hlsRef?.current])

  useEffect(() => {
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = muted
    }
  }, [muted])

  useEffect(() => {
    if (!autoPlay) return
    const initialMuted = localStorage.getItem(MUTED_KEY) ? JSON.parse(localStorage.getItem(MUTED_KEY)!) : (autoPlay ? true : false);

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = initialMuted
      setMuted(initialMuted)
    }
  }, [autoPlay])

  useEffect(() => {
    const handlePreviewTime = (e: MouseEvent) => {
      if (!playerRef?.current) return

      const clientX = e?.clientX
      const left = seekRef.current?.getBoundingClientRect().left as number;
      const width = seekRef.current?.getBoundingClientRect().width as number;
      const percent = (clientX - left) / width;

      if (clientX <= left) {
        return
      }

      if (clientX >= left + width) {
        return
      }

      setPreviewTime(
        {
          time: percent * playerRef?.current.duration,
          left: percent
        }
      )
    }

    seekRef?.current?.addEventListener("mousemove", handlePreviewTime)

    return () => {
      seekRef?.current?.removeEventListener("mousemove", handlePreviewTime)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e?.code) {
        case "Space":
          handlePlayPause()
          break

        default:
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [play])

  useEffect(() => {
    if (!play) setShowControl(true)
    play ? playerRef?.current?.play() : playerRef?.current?.pause()
  }, [play])

  useEffect(() => {
    return () => {
      if (hlsRef?.current) hlsRef?.current?.destroy()
    }
  }, [])

  return (
    <div
      ref={videoContainerRef}
      onMouseMove={() => setShowControl(true)}
      onMouseLeave={() => {
        if (seeking) return
        setShowControl(false);
      }}
      onClick={() => setShowControl(true)}
      className="video-container"
    >
      <video
        ref={playerRef}
        className={`video ${className || ''}`}
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
        onClick={() => setShowSettings(false)}
        style={{ display: showControl ? "flex" : "none" }}
        className="control-container opacity-animation"
      >

        {!loading && <div onClick={handlePlayPause} className="center-item-absolute cursor-pointer">
          {play ? <IconPlayPause fontSize={60} /> : <IconBxPlay fontSize={60} />}
        </div>}


        {/* Menu select play speed, quanlity, subtitle */}
        {showSettings && (
          <div
            onClick={() => setShowSettings(false)}
            className="settings-container"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="settings-content"
            >
              {settingsType === "main" ? (
                <MainSettings
                  currentQuality={sourceMulti?.[currentSource]?.label}
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
          <div ref={seekRef} onClick={handleSeekTime} className="progress tooltip-container">
            <div className="progress-gray">
              <div
                style={{
                  width: live
                    ? "100%"
                    : `${(currentTime * 100) /
                    (playerRef?.current?.duration as number)
                    }%`,
                  backgroundColor: defaultColor,
                }}
                className="progress-main"
              />
            </div>

            {!live && <div className="progress-dot" style={{
              backgroundColor: defaultColor, left: `calc(${(currentTime * 100) /
                (playerRef?.current?.duration as number)
                }% - 5px)`
            }} />}

            {!live && (previewTime?.time && previewTime?.left) ? <div style={{ left: `${previewTime?.left * 100}%` }} className="tooltip">{formatVideoTime(previewTime?.time)}</div> : ""}
          </div>
          {/* Main control */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="main-control-container"
          >
            <div className="main-settings-content">
              <div onClick={handlePlayPause} className="cursor-pointer mr-3 main-settings-content tooltip-container">
                {play ? <IconPlayPause fontSize={28} /> : <IconBxPlay fontSize={28} />}
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
                  <div ref={volumeRef} onMouseDown={handleVolumeChange} className="progress volume mr-3 opacity-animation width-animation">
                    <div className="progress-gray">
                      <div
                        style={{ width: `${volume}%`, backgroundColor: defaultColor }}
                        className="progress-main"
                      />

                      <div className="progress-dot" style={{
                        backgroundColor: defaultColor, left: `calc(${volume}% - 5px)`
                      }}
                      />
                    </div>
                  </div>
                </div>
                {!live ? (
                  <div className="time">
                    {formatVideoTime(currentTime)}
                    {" / "}
                    {formatVideoTime(playerRef?.current?.duration as number)}
                  </div>
                ) : (
                  <div className="text-sm font-semibold cursor-pointer live-button">Live</div>
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
                  <IconFullscreenExit fontSize={30} />
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
