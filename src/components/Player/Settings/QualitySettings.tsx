import React from "react";
import { IconChevronLeft, IconCheckLg } from '../../Icons'
import { Source } from "../../../utils/types";

interface QualitySettingsProps {
  setSettingsType: React.Dispatch<
    React.SetStateAction<"main" | "playspeed" | "quality" | "subtitle">
  >;
  source: Source[];
  currentSource: number;
  handleChangeSource: (index: number) => void;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({
  setSettingsType,
  source,
  currentSource,
  handleChangeSource,
}) => {
  return (
    <div className="overflow-y-auto opacity-animation">
      <div
        onClick={() => setSettingsType("main")}
        className="main-settings-content p-2 cursor-pointer"
      >
        <IconChevronLeft fontSize={20} className="mr-3" />
        <p className="text-sm font-semibold">Quality</p>
      </div>
      <div>
        {source?.map((item, index) => (
          <div
            onClick={() => handleChangeSource(index)}
            className="p-2 text-sm font-semibold main-settings-content cursor-pointer"
            key={item?.url}
          >
            <div className="icon-20px mr-3">
              {currentSource === index && <IconCheckLg fontSize={20} />}
            </div>
            <p>{item?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualitySettings;
