import { HTMLProps } from "react";
import { AutoQualityConfig } from "./player";

export interface Subtitle {
  url: string;
  lang: string;
}

export interface Source {
  url: string;
  label: string;
}

export interface PlayerProps extends HTMLProps<HTMLVideoElement> {
  source: string | Source[];
  className?: string;
  poster?: string;
  color?: string;
  trackColor?: string;
  bufferedColor?: string;
  videoTitle?: string;
  videoDescription?: string;
  subtitle?: Subtitle[] | undefined;
  playerRef?: React.MutableRefObject<HTMLVideoElement | null>;
  live?: boolean;
  autoUnmuteDelay?: number;
  startIntro?: number;
  endIntro?: number;
  introColor?: string;
  startOutro?: number;
  endOutro?: number;
  outroColor?: string;
  /**
   * Tuning for the custom auto-quality monitor used with `Source[]`
   * profiles. Missing fields fall back to DEFAULT_AUTO_QUALITY_CONFIG.
   * Ignored for single master m3u8 URLs (hls.js ABR handles those).
   */
  autoQualityConfig?: Partial<AutoQualityConfig>;
  Hls?: any;
}
