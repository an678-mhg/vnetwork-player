import React, { useRef, useState, useEffect } from "react";
import {
  MUTED_KEY,
  VOLUME_KEY,
  formatVideoTime,
  playSpeedOptions,
  removeSearchParams,
} from "../../utils/contants";
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
  const hlsRef = useRef<Hls | null>(null);

  if (!src) {
    if (hlsRef.current) hlsRef.current?.destroy();
    throw new Error("Missing src props");
  }

  const source = src as string;
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const myRef = useRef<HTMLVideoElement | null>(null);
  const timeoutSeek = useRef<any>(null);

  const [currentSource, setCurrentSource] = useState(0);
  const [sourceMulti, setSourceMulti] = useState<Source[]>([]);
  const [currentPlaySpeed, setCurrePlaySpeed] = useState(3);
  const [showControl, setShowControl] = useState(true);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [muted, setMuted] = useState<boolean>(
    JSON.parse(localStorage.getItem(MUTED_KEY)!) || false,
  );
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsType, setSettingsType] = useState<
    "main" | "playspeed" | "quality" | "subtitle"
  >("main");
  const [currentSubtitle, setCurrentSubtitle] = useState<number | null>(0);
  const [volume, setVolume] = useState(
    Number(localStorage.getItem(VOLUME_KEY)) || 100,
  );
  const [seeking, setSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<{
    time: number | null;
    left: number | null;
  }>({ time: null, left: null });

  const defaultColor = color || "#ef4444";
  const playerRef = passedRef || myRef;

  const handlePlayPause = () => {
    setPlay((prev) => !prev);
  };

  const handleFullScreen = () => {
    if (!videoContainerRef?.current) return;

    const element = videoContainerRef.current;

    // Thoát khỏi chế độ PiP nếu đang bật
    if (
      (document as Document & { pictureInPictureElement: any })
        ?.pictureInPictureElement
    ) {
      (document as Document & { exitPictureInPicture: () => Promise<void> })
        ?.exitPictureInPicture()
        .catch(console.error);
    }
    // Kiểm tra và xử lý chế độ toàn màn hình
    if (
      !document.fullscreenElement &&
      // @ts-ignore
      !document.mozFullScreenElement &&
      // @ts-ignore
      !document.webkitFullscreenElement &&
      // @ts-ignore
      !document.msFullscreenElement
    ) {
      // Bật chế độ toàn màn hình
      if (element.requestFullscreen) {
        element.requestFullscreen();
        // @ts-ignore
      } else if (element.mozRequestFullScreen) {
        // Firefox
        // @ts-ignore
        element.mozRequestFullScreen();
        // @ts-ignore
      } else if (element.webkitRequestFullscreen) {
        // Chrome, Safari và Opera
        // @ts-ignore
        element.webkitRequestFullscreen();
        // @ts-ignore
      } else if (element.msRequestFullscreen) {
        // Internet Explorer/Edge
        // @ts-ignore
        element.msRequestFullscreen();
      }
    } else {
      // Thoát chế độ toàn màn hình
      if (document.exitFullscreen) {
        document.exitFullscreen();
        // @ts-ignore
      } else if (document.mozCancelFullScreen) {
        // Firefox
        // @ts-ignore
        document.mozCancelFullScreen();
        // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari và Opera
        // @ts-ignore
        document.webkitExitFullscreen();
        // @ts-ignore
      } else if (document.msExitFullscreen) {
        // Internet Explorer/Edge
        // @ts-ignore
        document.msExitFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (seeking) return;
    setCurrentTime(playerRef?.current?.currentTime || 0);
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

  const handleChangeSource = (index: number) => {
    if (!playerRef?.current) return;
    if (currentSource === index) return;

    setCurrentSource(index);

    const existTrack = playerRef?.current?.querySelector("track");
    if (existTrack) existTrack.remove();

    if (hlsRef?.current) {
      const hls = hlsRef?.current;
      hls.startLevel = index;
      hls.loadSource(sourceMulti?.[index]?.url);
      hls.startLoad();
    } else {
      playerRef?.current?.setAttribute("src", sourceMulti?.[index]?.url);
    }

    const tmpCurrentTime = currentTime;
    setCurrentTime(tmpCurrentTime);

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.currentTime = tmpCurrentTime;
      playerRef.current.play();
    }

    setShowSettings(false);
    setSettingsType("main");
  };

  const handleLoadVideoMp4 = () => {
    if (hlsRef?.current) hlsRef?.current?.destroy();

    setSourceMulti(
      typeof source === "string" ? [{ label: "Default", url: source }] : source,
    );

    if (typeof source === "string") {
      playerRef?.current?.setAttribute("src", source);
    } else {
      // @ts-ignore
      setCurrentSource(source?.length - 1);
      playerRef?.current?.setAttribute(
        "src",
        // @ts-ignore
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
    // @ts-ignore
    if (!Hls.isSupported()) throw Error("Not support hls");

    if (hlsRef?.current) {
      hlsRef?.current?.destroy();
    }

    // @ts-ignore
    hlsRef.current = new Hls();

    const hls = hlsRef?.current;

    // @ts-ignore
    hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
      if (typeof source !== "string") {
        // @ts-ignore
        return setSourceMulti(source as Source[]);
      }

      if (
        data?.levels?.length !== sourceMulti?.length &&
        sourceMulti?.length !== 0
      )
        return;

      setSourceMulti(
        // @ts-ignore
        data?.levels?.map((item) => ({
          label: `${item?.height}p`,
          url: item?.url?.[0],
        })),
      );
      setCurrentSource(data?.levels?.length - 1);
      hls.startLevel = data?.levels?.length - 1;
    });

    hls.attachMedia(playerRef?.current);

    if (typeof source === "string") {
      hls.loadSource(source);
    } else {
      // @ts-ignore
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

    // Kiểm tra hỗ trợ PiP
    const videoElement = playerRef.current;
    if (
      !(document as Document & { pictureInPictureEnabled: any })
        .pictureInPictureEnabled &&
      !("webkitSetPresentationMode" in videoElement) &&
      !("mozRequestPictureInPicture" in videoElement)
    ) {
      console.warn(
        "Picture-in-Picture không được hỗ trợ trong trình duyệt này.",
      );
      return;
    }

    // Xử lý PiP cho các trình duyệt khác nhau
    if (
      (document as Document & { pictureInPictureElement: any })
        .pictureInPictureElement
    ) {
      (document as Document & { exitPictureInPicture: () => Promise<void> })
        .exitPictureInPicture()
        .catch(console.error);
    } else if (
      (document as Document & { pictureInPictureEnabled: any })
        .pictureInPictureEnabled
    ) {
      (
        videoElement as HTMLVideoElement & {
          requestPictureInPicture: () => Promise<void>;
        }
      )
        .requestPictureInPicture()
        .catch(console.error);
    } else if ("webkitSetPresentationMode" in videoElement) {
      // Safari
      const safariVideo = videoElement as HTMLVideoElement & {
        webkitPresentationMode: string;
        webkitSetPresentationMode: (mode: string) => void;
      };

      if (safariVideo.webkitPresentationMode === "picture-in-picture") {
        safariVideo.webkitSetPresentationMode("inline");
      } else {
        safariVideo.webkitSetPresentationMode("picture-in-picture");
      }
    } else if ("mozRequestPictureInPicture" in videoElement) {
      // Firefox
      const firefoxVideo = videoElement as HTMLVideoElement & {
        mozRequestPictureInPicture: () => Promise<void>;
      };

      firefoxVideo.mozRequestPictureInPicture().catch(console.error);
    }
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
        // @ts-ignore
        playerRef.current.currentTime = time;
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
      setFullScreen((prev) => !prev);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
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
    const type =
      typeof source === "string"
        ? removeSearchParams(source)?.split(".")[source?.split(".")?.length - 1]
        : // @ts-ignore
          removeSearchParams(source?.[0]?.url)?.split(".")[
            // @ts-ignore
            source?.[0]?.url?.split(".")?.length - 1
          ];

    if (type === "mp4") {
      handleLoadVideoMp4();
    } else if (type === "m3u8") {
      handleLoadVideoM3u8();
    } else {
      handleLoadVideoMp4();
    }

    return () => {
      if (hlsRef?.current) {
        hlsRef?.current?.destroy();
      }
    };
  }, [source, sourceMulti?.length, hlsRef?.current]);

  useEffect(() => {
    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (!autoPlay) return;

    if (playerRef !== null && playerRef?.current !== null) {
      playerRef.current.muted = true;

      playerRef.current.addEventListener("loadedmetadata", () => {
        // @ts-ignore
        playerRef.current.play();
      });

      setMuted(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ngăn chặn các hành động mặc định của trình duyệt
      if (
        [
          "Space",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "f",
          "m",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      switch (e.code) {
        case "Space":
          handlePlayPause();
          break;
        case "ArrowLeft":
          // Tua lùi 5 giây
          if (playerRef.current) {
            playerRef.current.currentTime -= 5;
          }
          break;
        case "ArrowRight":
          // Tua tới 5 giây
          if (playerRef.current) {
            playerRef.current.currentTime += 5;
          }
          break;
        case "ArrowUp":
          // Tăng âm lượng
          handleVolumeChange(Math.min(volume + 5, 100));
          break;
        case "ArrowDown":
          // Giảm âm lượng
          handleVolumeChange(Math.max(volume - 5, 0));
          break;
        case "KeyF":
          // Bật/tắt chế độ toàn màn hình
          handleFullScreen();
          break;
        case "KeyM":
          // Bật/tắt âm thanh
          handleToggleMuted();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    play,
    volume,
    handlePlayPause,
    handleVolumeChange,
    handleFullScreen,
    handleToggleMuted,
  ]);

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
        if (seeking) return;
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

        {/* Menu select play speed, quanlity, subtitle */}
        {showSettings && (
          <div
            onClick={(e) => setShowSettings(false)}
            className="settings-container"
          >
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
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
          <Slider
            onDragEnd={handleDragEnd}
            value={currentTime}
            onChange={handleChangeTime}
            min={0}
            max={playerRef?.current?.duration as number}
            live={live}
            color={defaultColor}
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
                  <div className="text-sm font-semibold cursor-pointer live-button">
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
