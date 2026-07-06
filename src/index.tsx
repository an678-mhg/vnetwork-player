import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Player from "./components/Player";
import ClientRender from "./components/ClientRender";
import { PlayerProps } from "./utils/types";
import { AutoQualityConfig, DEFAULT_AUTO_QUALITY_CONFIG } from "./utils/player";

const VPlayer: React.FC<PlayerProps> = (props) => {
  return (
    <div id="vnetwork-player">
      <ErrorBoundary>
        <ClientRender>
          <Player {...props} />
        </ClientRender>
      </ErrorBoundary>
    </div>
  );
};

export { PlayerProps, AutoQualityConfig, DEFAULT_AUTO_QUALITY_CONFIG };

export default VPlayer;
