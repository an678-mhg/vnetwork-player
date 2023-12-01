import { playSpeedOptions } from "../../../utils/contants";
import React from "react";
import { AiOutlineLeft } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";

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
    <div className="opacity-animation">
      <div
        onClick={() => setSettingsType("main")}
        className="main-settings-content  p-2 cursor-pointer"
      >
        <AiOutlineLeft size={20} className="mr-3" />
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
              {currentPlaySpeed === index && <BsCheckLg size={20} />}
            </div>
            <p>{item?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaySpeedSettings;
