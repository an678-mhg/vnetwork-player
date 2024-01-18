import { playSpeedOptions } from "../../../utils/contants";
import React from "react";
import { IconChevronLeft, IconCheckLg } from "../../Icons";

interface PlaySpeedSettingsProps {
  setSettingsType: React.Dispatch<
    React.SetStateAction<"main" | "playspeed" | "quality" | "subtitle">
  >;
  currentPlaySpeed: number;
  handleChangePlaySpeed: (index: number, value: number) => void;
}

const PlaySpeedSettings: React.FC<PlaySpeedSettingsProps> = ({
  setSettingsType,
  currentPlaySpeed,
  handleChangePlaySpeed,
}) => {
  return (
    <div className="opacity-animation settings-content scale-in-bl w-full">
      <div
        onClick={() => setSettingsType("main")}
        className="main-settings-content  p-2 cursor-pointer"
      >
        <IconChevronLeft fontSize={20} className="mr-3" />
        <p className="text-sm font-semibold">Play speed</p>
      </div>
      <div>
        {playSpeedOptions?.map((item, index) => (
          <div
            className="p-2 text-sm font-semibold  main-settings-content cursor-pointer"
            key={item?.value}
            onClick={() => handleChangePlaySpeed(index, item?.value)}
          >
            <div className="icon-20px mr-3">
              {currentPlaySpeed === index && <IconCheckLg fontSize={20} />}
            </div>
            <p>{item?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaySpeedSettings;
