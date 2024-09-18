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
  live?: boolean;
  children?: React.ReactNode;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  className = "",
  color = "#ef4444",
  live = false,
  onDragEnd,
  onPreview,
  children
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
    onPreview && onPreview(newValue as number , percent);
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
    };
  }, [isDragging]);

  const percentValue = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={`progress-vnet ${className}`}
      onClick={(e) => handleSliderChange(e.clientX)}
      onMouseDown={(e) => handleStart(e.clientX)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onMouseMove={(e) => handlePreview(e.clientX)}
      onMouseLeave={() => onPreview && onPreview(null, null)}
    >
      <div className="progress-gray">
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