import React, { useRef, useEffect, useState } from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onPreview?: (value: number | null, percentValue: number | null) => void;
  onDragEnd?: () => void;
  min?: number;
  max?: number;
  className?: string;
  color?: string;
  trackColor?: string;
  buffered?: Array<{
    start: number;
    end: number;
  }>;
  bufferedColor?: string;
  live?: boolean;
  markers?: Array<{
    start: number;
    end: number;
    label: string;
    color?: string;
  }>;
  children?: React.ReactNode;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  className = "",
  color = "#ef4444",
  trackColor,
  buffered = [],
  bufferedColor = "rgba(255, 255, 255, 0.75)",
  live = false,
  markers = [],
  onDragEnd,
  onPreview,
  children = <></>,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCalculateValue = (clientX: number) => {
    if (!sliderRef.current || live) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (clientX - rect.left) / rect.width;
    const newValue = Math.min(Math.max(percent * (max - min) + min, min), max);
    return newValue;
  };

  const handleSliderChange = (clientX: number) => {
    const newValue = handleCalculateValue(clientX);
    onChange(newValue as number);
  };

  const handlePreview = (clientX: number) => {
    const newValue = handleCalculateValue(clientX);
    const rect = sliderRef.current?.getBoundingClientRect();
    const left = rect?.left as number;
    const width = rect?.width as number;
    const percent = (clientX - left) / width;
    onPreview && onPreview(newValue as number, percent);
  };

  const handleMove = (clientX: number) => {
    if (isDragging) handleSliderChange(clientX);
  };

  const handleMoveEnd = () => {
    setIsDragging(false);
    onDragEnd && onDragEnd();
    document.body.style.userSelect = "auto";
  };

  const handleStart = (clientX: number) => {
    if (!live) {
      setIsDragging(true);
      handleSliderChange(clientX);
    }
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleMoveEnd);
    document.addEventListener("touchend", handleMoveEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMoveEnd);
      document.removeEventListener("touchend", handleMoveEnd);
      onDragEnd && onDragEnd();
    };
  }, [isDragging]);

  const range = max - min;
  const canRenderTimeline = Number.isFinite(range) && range > 0;
  const percentValue = canRenderTimeline ? ((value - min) / range) * 100 : 0;
  const markerItems = !live && canRenderTimeline ? markers : [];
  const bufferedItems = !live && canRenderTimeline ? buffered : [];

  return (
    <div
      ref={sliderRef}
      className={`progress-vnet ${className}`}
      onClick={(e) => handleSliderChange(e.clientX)}
      onMouseDown={(e) => handleStart(e.clientX)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onMouseMove={(e) => handlePreview(e.clientX)}
      onMouseLeave={() => {
        onPreview && onPreview(null, null);
        onDragEnd && onDragEnd();
      }}
    >
      <div
        className="progress-gray"
        style={trackColor ? { backgroundColor: trackColor } : undefined}
      >
        {bufferedItems.map((rangeItem, index) => {
          const start = Math.max(rangeItem.start, min);
          const end = Math.min(rangeItem.end, max);

          if (end <= start) return null;

          const left = ((start - min) / range) * 100;
          const width = ((end - start) / range) * 100;

          return (
            <div
              key={`buffered-${index}`}
              className="progress-buffered"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: bufferedColor,
              }}
            />
          );
        })}
        {markerItems.map((marker) => {
          const start = Math.max(marker.start, min);
          const end = Math.min(marker.end, max);

          if (end <= start) return null;

          const left = ((start - min) / range) * 100;
          const width = ((end - start) / range) * 100;

          return (
            <div
              key={`${marker.label}-${marker.start}-${marker.end}`}
              className="progress-marker"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: marker.color || color,
              }}
              onMouseEnter={() => onPreview && onPreview(null, null)}
              onMouseMove={(e) => {
                e.stopPropagation();
                onPreview && onPreview(null, null);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span className="progress-marker-tooltip">{marker.label}</span>
            </div>
          );
        })}
        <div
          className="progress-main"
          style={{
            width: live ? "100%" : `${percentValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {children}
      {!live && (
        <div
          className="progress-dot"
          style={{
            backgroundColor: color,
            left: `calc(${percentValue}% - 5px)`,
          }}
        />
      )}
    </div>
  );
};

export default Slider;
