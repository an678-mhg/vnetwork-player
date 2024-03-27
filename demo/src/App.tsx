import VPlayer from "vnetwork-player";
import { FaGithub } from "react-icons/fa";
import { RiNpmjsFill } from "react-icons/ri";
import Hls from "hls.js";

import "vnetwork-player/dist/vnetwork-player.min.css";

const App = () => {
  return (
    <div id="demo-vnetwork-player">
      <div className="flex justify-center h-[100dvh]">
        <div className="mt-5">
          <div className="p-2">
            <h1 className="font-bold lg:text-3xl text-2xl text-[#E12F1F] text-center">
              VNETWORK - Player
            </h1>
            <p className="mt-5 text-center">
              A React component custom player support video m3u8, mp4
            </p>
          </div>
          <div className="lg:w-[700px] md:w-[600px] aspect-video mt-5">
            <VPlayer
              Hls={Hls}
              className="w-full h-full"
              source="https://live-par-2-cdn-alt.livepush.io/live/bigbuckbunnyclip/index.m3u8"
              color="#E12F1F"
              autoPlay
              live
            />
          </div>

          <div className="mt-5 flex justify-center space-x-4">
            <a
              target="_blank"
              href="https://github.com/an678-mhg/vnetwork-player"
            >
              <button className="bg-[#333] rounded-md px-6 py-2 flex items-center space-x-2">
                <FaGithub size={25} />{" "}
                <span className="font-normal">Github</span>
              </button>
            </a>

            <a
              target="_blank"
              href="https://www.npmjs.com/package/vnetwork-player"
            >
              <button className="bg-[#BA1F26] rounded-md px-6 py-2 flex items-center space-x-2">
                <RiNpmjsFill size={25} />{" "}
                <span className="font-normal">NPM</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
