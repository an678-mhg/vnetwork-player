import React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import Player from "./components/Player"
import { PlayerProps } from "./utils/types"

const VPlayer: React.FC<PlayerProps> = props => {
    return <div id="vnetwork-player">
        <ErrorBoundary>
            <Player {...props} />
        </ErrorBoundary>
    </div>
}

export default VPlayer
