type FullscreenDocument = Document & {
  mozFullScreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  mozCancelFullScreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  mozRequestFullScreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type PictureInPictureDocument = Document & {
  pictureInPictureElement?: Element | null;
  pictureInPictureEnabled?: boolean;
  exitPictureInPicture?: () => Promise<void>;
};

type PictureInPictureVideoElement = HTMLVideoElement & {
  requestPictureInPicture?: () => Promise<void>;
  webkitPresentationMode?: "inline" | "picture-in-picture" | "fullscreen";
  webkitSetPresentationMode?: (
    mode: "inline" | "picture-in-picture" | "fullscreen",
  ) => void;
  mozRequestPictureInPicture?: () => Promise<void>;
};

const fullscreenChangeEvents = [
  "fullscreenchange",
  "mozfullscreenchange",
  "webkitfullscreenchange",
  "MSFullscreenChange",
];

export const getFullscreenElement = (doc: Document = document) => {
  const fullscreenDocument = doc as FullscreenDocument;

  return (
    fullscreenDocument.fullscreenElement ||
    fullscreenDocument.mozFullScreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    fullscreenDocument.msFullscreenElement ||
    null
  );
};

const requestFullscreen = (element: HTMLElement) => {
  const fullscreenElement = element as FullscreenElement;
  const request =
    fullscreenElement.requestFullscreen ||
    fullscreenElement.mozRequestFullScreen ||
    fullscreenElement.webkitRequestFullscreen ||
    fullscreenElement.msRequestFullscreen;

  return request?.call(fullscreenElement);
};

const exitFullscreen = (doc: Document = document) => {
  const fullscreenDocument = doc as FullscreenDocument;
  const exit =
    fullscreenDocument.exitFullscreen ||
    fullscreenDocument.mozCancelFullScreen ||
    fullscreenDocument.webkitExitFullscreen ||
    fullscreenDocument.msExitFullscreen;

  return exit?.call(fullscreenDocument);
};

const exitPictureInPicture = (doc: Document = document) => {
  const pipDocument = doc as PictureInPictureDocument;
  if (!pipDocument.pictureInPictureElement || !pipDocument.exitPictureInPicture)
    return;

  pipDocument.exitPictureInPicture().catch(console.error);
};

export const toggleFullscreen = (element: HTMLElement) => {
  exitPictureInPicture();

  if (!getFullscreenElement()) {
    return requestFullscreen(element);
  }

  return exitFullscreen();
};

export const togglePictureInPicture = (videoElement: HTMLVideoElement) => {
  const pipDocument = document as PictureInPictureDocument;
  const pipVideo = videoElement as PictureInPictureVideoElement;

  if (
    !pipDocument.pictureInPictureEnabled &&
    !pipVideo.webkitSetPresentationMode &&
    !pipVideo.mozRequestPictureInPicture
  ) {
    console.warn("Picture-in-Picture không được hỗ trợ trong trình duyệt này.");
    return;
  }

  if (pipDocument.pictureInPictureElement) {
    exitPictureInPicture();
  } else if (
    pipDocument.pictureInPictureEnabled &&
    pipVideo.requestPictureInPicture
  ) {
    pipVideo.requestPictureInPicture().catch(console.error);
  } else if (pipVideo.webkitSetPresentationMode) {
    pipVideo.webkitSetPresentationMode(
      pipVideo.webkitPresentationMode === "picture-in-picture"
        ? "inline"
        : "picture-in-picture",
    );
  } else {
    pipVideo.mozRequestPictureInPicture?.().catch(console.error);
  }
};

export const addFullscreenChangeListener = (listener: () => void) => {
  fullscreenChangeEvents.forEach((eventName) => {
    document.addEventListener(eventName, listener);
  });

  return () => {
    fullscreenChangeEvents.forEach((eventName) => {
      document.removeEventListener(eventName, listener);
    });
  };
};
