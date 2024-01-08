import React from "react";
import { IconChevronLeft, IconCheckLg } from "../../Icons";
import { Subtitle } from "../../../utils/types";

interface SubtitleSettingsProps {
  setSettingsType: React.Dispatch<
    React.SetStateAction<"main" | "playspeed" | "quality" | "subtitle">
  >;
  subtitle: Subtitle[];
  currentSubtitle: number | null;
  handleChangeSubtitle: (index: number) => void;
  handleTurnOffSubtitle: () => void;
}

const SubtitleSettings: React.FC<SubtitleSettingsProps> = ({
  currentSubtitle,
  handleChangeSubtitle,
  setSettingsType,
  subtitle,
  handleTurnOffSubtitle,
}) => {
  return (
    <div className="overflow-y-auto opacity-animation">
      <div
        onClick={() => setSettingsType("main")}
        className="main-settings-content  p-2 cursor-pointer"
      >
        <IconChevronLeft fontSize={20} className="mr-3" />
        <p className="text-sm font-semibold">Subtitle</p>
      </div>
      <div>
        <div
          onClick={handleTurnOffSubtitle}
          className="p-2 text-sm font-semibold main-settings-content cursor-pointer"
        >
          <div className="icon-20px mr-3">
            {currentSubtitle === null && <IconCheckLg fontSize={20} />}
          </div>
          <p>Off</p>
        </div>
        {subtitle?.map((item, index) => (
          <div
            onClick={() => handleChangeSubtitle(index)}
            className="p-2 text-sm font-semibold  main-settings-content cursor-pointer"
            key={item?.url}
          >
            <div className="icon-20px mr-3">
              {currentSubtitle === index && <IconCheckLg fontSize={20} />}
            </div>
            <p>{item?.lang}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtitleSettings;
