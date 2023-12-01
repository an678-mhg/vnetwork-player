import React, {
  useRef,
  useState,
  useEffect
} from "react";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { formatVideoTime, playSpeedOptions } from "../../utils/contants";
import { CircularProgress } from "react-cssfx-loading";
import { PlayerProps, Source } from "../../utils/types";
import { IoMdPlay, IoMdPause, IoMdVolumeHigh, IoMdVolumeOff, IoMdSettings } from "react-icons/io";
import { RiPictureInPictureFill } from "react-icons/ri"
import MainSettings from "./Settings/MainSettings";
import PlaySpeedSettings from "./Settings/PlaySpeedSettings";
import QualitySettings from "./Settings/QualitySettings";
import SubtitleSettings from "./Settings/SubtitleSettings";
import Hls from "hls.js";

import "../../styles.css";

const Player: React.FC<PlayerProps> = ({
  color,
  subtitle,
  playerRef,
  className,
  poster,
  src,
  live,
  autoPlay,
  ...props
}) => {
  const seekRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const timeoutSeekRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null)
  const volumeRef = useRef<HTMLDivElement | null>(null)

  const [currentSource, setCurrentSource] = useState(0);
  const [sourceMulti, setSourceMulti] = useState<Source[]>([]);
  const [currentPlaySpeed, setCurrePlaySpeed] = useState(3);
  const [showControl, setShowControl] = useState(true);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState<
    "main" | "playspeed" | "quality" | "subtitle"
  >("main");
  const [currentSubtitle, setCurrentSubtitle] = useState<number | null>(0);
  const [volume, setVolume] = useState(100);
  const [seeking, setSeeking] = useState(false);

  const defaultColor = color || "#ef4444"
  const source = src

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;

    if (play) {
      setPlay(false);
      player?.pause();
    } else {
      setPlay(true);
      player?.play();
    }
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
    if (seeking) {
      return;
    }

    const player = playerRef.current;
    if (!player) return;

    setCurrentTime(player?.currentTime);
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
    if (muted) {
      setMuted(false);
      if (playerRef !== null && playerRef?.current !== null) {
        playerRef.current.muted = false;
        setVolume(100);
      }
    } else {
      setMuted(true);
      if (playerRef !== null && playerRef?.current !== null) {
        playerRef.current.muted = true;
        setVolume(0);
      }
    }
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
    if (!hlsRef?.current) return;
    if (!playerRef?.current) return;

    if (currentSource === index) return

    const hls = hlsRef?.current;

    setCurrentSource(index);

    const existTrack = playerRef?.current?.querySelector("track");

    if (existTrack) {
      existTrack.remove();
    }

    hls.startLevel = index;
    hls.loadSource(sourceMulti?.[index]?.url);
    hls.startLoad();

    playerRef?.current?.play();

    setShowSettings(false)
    setSettingsType("main")
  };

  const handleLoadVideoM3u8 = () => {
    if (!playerRef?.current) return;
    if (!Hls.isSupported()) throw Error("Not support hls");

    if (hlsRef?.current) {
      hlsRef?.current?.destroy()
    }

    // @ts-ignore
    hlsRef?.current = new Hls();

    const hls = hlsRef?.current;

    hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
      if (
        data?.levels?.length !== sourceMulti?.length &&
        sourceMulti?.length !== 0
      )
        return;

      // @ts-ignore
      setSourceMulti(data?.levels?.map((item) => ({ label: `${item?.height}p`, url: item?.url?.[0] })));
      setCurrentSource(data?.levels?.length - 1);
      hls.startLevel = data?.levels?.length - 1;
    });

    hls.attachMedia(playerRef?.current);
    hls.loadSource(source);
    hls.startLoad();

    playerRef?.current?.play();
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
    setVolume(percent * 100)
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
      playerRef.current.volume = volume / 100;
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
    const type = source?.split(".")[source?.split(".").length - 1];

    if (type === "mp4") {
      playerRef?.current?.setAttribute("src", source);
      setSourceMulti([{ label: "Default", url: source }]);
    } else if (type === "m3u8") {
      handleLoadVideoM3u8();
    }
  }, [source, sourceMulti?.length])

  useEffect(() => {
    if (!autoPlay) return

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = true;
      setMuted(true)
      setVolume(0)
      playerRef?.current?.play()
    }
  }, [autoPlay])

  return (
    <div
      ref={videoContainerRef}
      onMouseMove={() => {
        setShowControl(true);
      }}
      onMouseLeave={() => {
        if (seeking) {
          return;
        }

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
        {...props}
      />

      {loading && (
        <div className="center-item-absolute">
          <CircularProgress color="#fff" />
        </div>
      )}

      <div
        onClick={() => setShowSettings(false)}
        style={{ display: showControl ? "flex" : "none" }}
        className="control-container opacity-animation"
      >
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
          <div ref={seekRef} onClick={handleSeekTime} className="progress">
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
          </div>
          {/* Main control */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="main-control-container"
          >
            <div className="main-settings-content">
              <div onClick={handlePlayPause} className="cursor-pointer mr-3 main-settings-content tooltip-container">
                {play ? <IoMdPause size={23} /> : <IoMdPlay size={23} />}
                <div className="tooltip opacity-animation">Play</div>
              </div>

              <div className="main-settings-content volume-container">
                <div
                  onClick={handleToggleMuted}
                  className="cursor-pointer mr-3 main-settings-content tooltip-container"
                >
                  {muted ? (
                    <IoMdVolumeOff size={25} />
                  ) : (
                    <IoMdVolumeHigh size={25} />
                  )}

                  <div className="tooltip">Volume</div>
                </div>
                <div ref={volumeRef} onMouseDown={handleVolumeChange} className="progress volume mr-3 opacity-animation">
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
                <div className="text-sm font-semibold cursor-pointer">Live</div>
              )}
            </div>
            <div className="main-settings-content">
              <div className="tooltip-container main-settings-content">
                <IoMdSettings
                  onClick={() => setShowSettings(!showSettings)}
                  className="cursor-pointer mr-3"
                  size={23}
                />
                <div className="tooltip">Settings</div>
              </div>
              <div className="tooltip-container main-settings-content">
                <RiPictureInPictureFill
                  onClick={handleVideoPicture}
                  className="cursor-pointer mr-3"
                  size={23}
                />
                <div className="tooltip">PIP</div>
              </div>
              <div
                onClick={handleFullScreen}
                className="cursor-pointer main-settings-content tooltip-container"
              >
                {fullScreen ? (
                  <BiExitFullscreen size={23} />
                ) : (
                  <BiFullscreen size={23} />
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
