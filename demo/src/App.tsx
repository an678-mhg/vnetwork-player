import VPlayer from '../../src/index';
import "../../src/styles.scss"
import './App.css';

const App = () => {
  return <VPlayer
    source={
      [
        { label: "360p", url: "http://res.cloudinary.com/an-nguyen/video/upload/v1701757911/loqq4s3ote6mbwz44kip.mp4" },
        { label: "720p", url: "http://res.cloudinary.com/an-nguyen/video/upload/v1701484115/epekfju1pvusp3xuoq3l.mp4" },
        { label: "1080p", url: "http://res.cloudinary.com/an-nguyen/video/upload/v1701484072/exvk9cxeuhvj70py8dbq.mp4" }
      ]
    }
    color="#ff0000"
    autoPlay
    subtitle={[
      {
        lang: "Tiếng Việt",
        url: "/captions.vtt"
      },
    ]}
    poster='http://res.cloudinary.com/an-nguyen/video/upload/v1701484072/exvk9cxeuhvj70py8dbq.jpg'
  />
};

export default App;
