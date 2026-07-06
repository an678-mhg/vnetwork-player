export type HlsLevel = {
  height?: number;
  url?: string | string[];
};

export type HlsManifestParsedData = {
  levels?: HlsLevel[];
};

export type HlsLevelSwitchedData = {
  level?: number;
};

export type HlsInstance = {
  startLevel: number;
  currentLevel: number;
  liveSyncPosition?: number | null;
  loadSource: (source: string) => void;
  startLoad: () => void;
  destroy: () => void;
  attachMedia: (media: HTMLMediaElement) => void;
  on: (
    event: string,
    callback: (
      event: string,
      data: HlsManifestParsedData & HlsLevelSwitchedData,
    ) => void,
  ) => void;
};

export type HlsConstructorLike = {
  new (): HlsInstance;
  isSupported: () => boolean;
  Events: {
    MANIFEST_PARSED: string;
    LEVEL_SWITCHED: string;
  };
};

export const HLS_AUTO_LEVEL = -1;

// Bộ cấu hình tối ưu - Trải nghiệm nhạy như YouTube
export const AUTO_QUALITY_STALL_WINDOW_MS = 10000; // 10 giây: Đủ để theo dõi các biến động mạng gần nhất.
export const AUTO_QUALITY_STALL_LIMIT = 1; // 1 lần: Gắt như YouTube, cứ khựng 1 lần là lùi bước để cứu buffer.
export const AUTO_QUALITY_LONG_STALL_MS = 1500; // 1.5 giây: Đang xem mà bị "đứng hình" quá 1.5s là tự động hạ cấp ngay lập tức.
export const AUTO_QUALITY_SWITCH_COOLDOWN_MS = 5000; // 5 giây: Sau khi đổi chất lượng, đợi 5s xem tình hình thế nào rồi mới cho đổi tiếp.
export const AUTO_QUALITY_SWITCH_GRACE_MS = 2000; // 2 giây: Bỏ qua các khựng kỹ thuật nhỏ trong 2s đầu vừa đổi chất lượng.

export const AUTO_QUALITY_UPGRADE_BUFFER_SECONDS = 8; // 8 giây: Chỉ cần video tải trước được 8 giây (mạng tốt) là đủ điều kiện lên đời.
export const AUTO_QUALITY_UPGRADE_HEALTHY_MS = 8000; // 8 giây: Mạng khỏe liên tục 8 giây là tự động bật chất lượng nét hơn.
export const AUTO_QUALITY_CHECK_INTERVAL_MS = 1000; // 1 giây: Cứ mỗi giây "bộ não" player quét 1 lần để phản ứng ngay lập tức.

/**
 * Tuning knobs for the custom auto-quality monitor. This monitor only runs
 * when hls.js ABR is not in charge, i.e. when the `source` prop is a
 * user-provided `Source[]` profile list (mp4 or per-profile m3u8 URLs).
 * For a single master m3u8 URL, hls.js handles adaptive switching natively
 * and this config is ignored.
 *
 * All fields are optional when passed through the `autoQualityConfig` prop;
 * missing fields fall back to DEFAULT_AUTO_QUALITY_CONFIG.
 */
export interface AutoQualityConfig {
  /** Sliding window (ms) in which stalls are counted. */
  stallWindowMs: number;
  /** Number of stalls inside the window that triggers a downgrade. */
  stallLimit: number;
  /** A single stall lasting longer than this (ms) triggers a downgrade. */
  longStallMs: number;
  /** Minimum time (ms) between two automatic quality switches. */
  switchCooldownMs: number;
  /** Stalls occurring within this time (ms) after a switch are ignored. */
  switchGraceMs: number;
  /** Buffered seconds ahead of playback required before an upgrade. */
  upgradeBufferSeconds: number;
  /** Time (ms) without any stall required before an upgrade. */
  upgradeHealthyMs: number;
  /** How often (ms) the monitor evaluates an upgrade opportunity. */
  checkIntervalMs: number;
}

export const DEFAULT_AUTO_QUALITY_CONFIG: AutoQualityConfig = {
  stallWindowMs: AUTO_QUALITY_STALL_WINDOW_MS,
  stallLimit: AUTO_QUALITY_STALL_LIMIT,
  longStallMs: AUTO_QUALITY_LONG_STALL_MS,
  switchCooldownMs: AUTO_QUALITY_SWITCH_COOLDOWN_MS,
  switchGraceMs: AUTO_QUALITY_SWITCH_GRACE_MS,
  upgradeBufferSeconds: AUTO_QUALITY_UPGRADE_BUFFER_SECONDS,
  upgradeHealthyMs: AUTO_QUALITY_UPGRADE_HEALTHY_MS,
  checkIntervalMs: AUTO_QUALITY_CHECK_INTERVAL_MS,
};

export const resolveAutoQualityConfig = (
  config?: Partial<AutoQualityConfig>,
): AutoQualityConfig => ({
  ...DEFAULT_AUTO_QUALITY_CONFIG,
  ...config,
});

export const getBufferedAhead = (videoElement: HTMLVideoElement) => {
  const { buffered, currentTime } = videoElement;

  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
      return buffered.end(i) - currentTime;
    }
  }

  return 0;
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
