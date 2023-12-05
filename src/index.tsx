import React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import Player from "./components/Player"
import ClientRender from './components/ClientRender'
import { PlayerProps } from "./utils/types"

const VPlayer: React.FC<PlayerProps> = props => {
    return <div id="vnetwork-player">
        <ErrorBoundary>
            <ClientRender>
                <Player {...props} />
            </ClientRender>
        </ErrorBoundary>
    </div>
}

export { type PlayerProps }

export default VPlayer
