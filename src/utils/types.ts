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
    src: string;
    className?: string;
    poster?: string;
    color?: string;
    subtitle?: Subtitle[] | undefined;
    ref?: React.MutableRefObject<HTMLVideoElement>;
    live?: boolean;
}