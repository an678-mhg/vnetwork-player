export type HlsLevel = {
  height?: number;
  url?: string | string[];
};

export type HlsManifestParsedData = {
  levels?: HlsLevel[];
};

export type HlsInstance = {
  startLevel: number;
  liveSyncPosition?: number | null;
  loadSource: (source: string) => void;
  startLoad: () => void;
  destroy: () => void;
  attachMedia: (media: HTMLMediaElement) => void;
  on: (
    event: string,
    callback: (event: string, data: HlsManifestParsedData) => void,
  ) => void;
};

export type HlsConstructorLike = {
  new (): HlsInstance;
  isSupported: () => boolean;
  Events: {
    MANIFEST_PARSED: string;
  };
};

export const LIVE_EDGE_OFFSET_SECONDS = 0.5;
export const LIVE_EDGE_CLICKABLE_THRESHOLD_SECONDS = 2;

export type NormalizedSkipSegment = {
  start: number;
  end: number;
  label: string;
};

export const getSeekableLivePosition = (videoElement: HTMLVideoElement) => {
  const { seekable } = videoElement;
  const seekableLength = seekable.length;

  if (!seekableLength) return null;

  const lastRangeIndex = seekableLength - 1;
  const liveEdge = seekable.end(lastRangeIndex);
  const rangeStart = seekable.start(lastRangeIndex);

  if (!Number.isFinite(liveEdge)) return null;

  return Math.max(rangeStart, liveEdge - LIVE_EDGE_OFFSET_SECONDS);
};

export const getLivePosition = (
  videoElement: HTMLVideoElement,
  hls?: HlsInstance | null,
) => {
  const hlsLivePosition = hls?.liveSyncPosition;

  if (typeof hlsLivePosition === "number" && Number.isFinite(hlsLivePosition)) {
    return hlsLivePosition;
  }

  return getSeekableLivePosition(videoElement);
};

export const normalizeSkipIntro = (
  startIntro?: number,
  endIntro?: number,
): NormalizedSkipSegment | null => {
  if (typeof startIntro !== "number" || typeof endIntro !== "number") {
    return null;
  }

  return {
    start: startIntro,
    end: endIntro,
    label: "Skip intro",
  };
};

export const normalizeSkipOutro = (
  startOutro?: number,
  endOutro?: number,
): NormalizedSkipSegment | null => {
  if (typeof startOutro !== "number" || typeof endOutro !== "number") {
    return null;
  }

  return {
    start: startOutro,
    end: endOutro,
    label: "Skip outro",
  };
};

export const isSkipSegmentActive = (
  segment: NormalizedSkipSegment | null,
  currentTime: number,
) => {
  if (!segment) return false;
  if (currentTime < segment.start) return false;
  if (currentTime >= segment.end) return false;

  return true;
};
