import { HTMLProps } from "react";

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
  Hls?: any;
}
