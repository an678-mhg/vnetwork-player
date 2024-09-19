import React, { useEffect, useRef } from "react";

interface VideoPreviewImageProps {
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPreviewImage = ({
  currentTime,
  videoRef,
}: VideoPreviewImageProps) => {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleCreateImage = () => {
    if (!videoRef.current) return;

    const video = previewVideoRef.current;
    const canvas = previewCanvasRef.current;

    if (!canvas || !video) return;

    canvas.width = (100 * 16) / 9;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");

    if (!video || !ctx) return;
    video.currentTime = currentTime; // Set the video to the preview time
    // Capture and display the current video frame in the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (videoRef.current && previewVideoRef.current) {
      previewVideoRef.current.src = videoRef.current.src;
    }
  }, [videoRef]);

  useEffect(() => {
    handleCreateImage();
  }, [currentTime, videoRef]);

  return (
    <div>
      <video style={{ display: "none" }} ref={previewVideoRef} />
      <canvas ref={previewCanvasRef} />
    </div>
  );
};

export default VideoPreviewImage;
