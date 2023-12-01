import React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import Player from "./components/Player"
import { PlayerProps } from "./utils/types"

const VPlayer: React.FC<PlayerProps> = props => {
    return <ErrorBoundary>
        <Player {...props} />
    </ErrorBoundary>
}

export default VPlayer
