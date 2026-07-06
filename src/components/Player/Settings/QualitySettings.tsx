import React from "react";
import { IconChevronLeft, IconCheckLg } from "../../Icons";
import { Source } from "../../../utils/types";

interface QualitySettingsProps {
  setSettingsType: React.Dispatch<
    React.SetStateAction<"main" | "playspeed" | "quality" | "subtitle">
  >;
  source: Source[];
  currentSource: number;
  handleChangeSource: (index: number) => void;
  autoQuality: boolean;
  handleSelectAutoQuality: () => void;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({
  setSettingsType,
  source,
  currentSource,
  handleChangeSource,
  autoQuality,
  handleSelectAutoQuality,
}) => {
  const showAutoOption = source?.length > 1;

  return (
    <div
      className="overflow-y-auto opacity-animation settings-content scale-in-bl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSettingsType("main");
        }}
        className="main-settings-content p-2 cursor-pointer"
      >
        <IconChevronLeft fontSize={20} className="mr-3" />
        <p className="text-sm font-semibold">Quality</p>
      </div>
      <div>
        {showAutoOption && (
          <div
            onClick={handleSelectAutoQuality}
            className="p-2 text-sm font-semibold main-settings-content cursor-pointer"
          >
            <div className="icon-20px mr-3">
              {autoQuality && <IconCheckLg fontSize={20} />}
            </div>
            <p>
              {autoQuality
                ? `Auto (${source?.[currentSource]?.label})`
                : "Auto"}
            </p>
          </div>
        )}
        {source?.map((item, index) => (
          <div
            onClick={() => handleChangeSource(index)}
            className="p-2 text-sm font-semibold main-settings-content cursor-pointer"
            key={item?.url}
          >
            <div className="icon-20px mr-3">
              {!autoQuality && currentSource === index && (
                <IconCheckLg fontSize={20} />
              )}
            </div>
            <p>{item?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualitySettings;
