import React from "react";
import { AiOutlineRight } from "react-icons/ai";
import { MdOutlineHighQuality, MdOutlineSubtitles } from "react-icons/md";
import { SiSpeedtest } from "react-icons/si";

interface MainSettingsProps {
  setSettingsType: React.Dispatch<
    React.SetStateAction<"main" | "playspeed" | "quality" | "subtitle">
  >;
  currentSpeed: string;
  currentQuality: string;
  currentSubtitle: string | undefined;
  haveSubtitle: boolean;
  haveQuality: boolean;
}

const MainSettings: React.FC<MainSettingsProps> = ({
  setSettingsType,
  currentQuality,
  currentSpeed,
  currentSubtitle,
  haveQuality,
  haveSubtitle,
}) => {
  return (
    <div>
      <div
        onClick={() => setSettingsType("playspeed")}
        className="main-settings cursor-pointer "
      >
        <div className="main-settings-content">
          <SiSpeedtest size={20} className="mr-3" />
          <p className="text-sm font-semibold">Play speed</p>
        </div>
        <div className="main-settings-content">
          <p className="text-sm font-semibold line-clamp-1 mr-3">
            {currentSpeed}
          </p>
          <AiOutlineRight size={20} />
        </div>
      </div>
      {haveQuality && (
        <div
          onClick={() => setSettingsType("quality")}
          className="main-settings-content justify-between cursor-pointer p-2 "
        >
          <div className="main-settings-content">
            <MdOutlineHighQuality size={20} className="mr-3" />
            <p className="text-sm font-semibold">Quality</p>
          </div>
          <div className="main-settings-content">
            <p className="text-sm font-semibold line-clamp-1 mr-3">
              {currentQuality}
            </p>
            <AiOutlineRight size={20} />
          </div>
        </div>
      )}
      {haveSubtitle && (
        <div
          onClick={() => setSettingsType("subtitle")}
          className="main-settings-content justify-between cursor-pointer p-2"
        >
          <div className="main-settings-content">
            <MdOutlineSubtitles size={20} className="mr-3" />
            <p className="text-sm font-semibold">Subtitle</p>
          </div>
          <div className="main-settings-content">
            <p className="text-sm font-semibold line-clamp-1 mr-3">
              {currentSubtitle}
            </p>
            <AiOutlineRight size={20} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSettings;
