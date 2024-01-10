import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true); // set inital loading screen

  const [width, setWidth] = useState(window.innerWidth || screen.width);

  const w = width >= 1220 ? 1500 : width;
  const h = (w * 9) / 16;

  let fabricGlobalVideo = null;

  const videoElementRef = useRef();
  const videoSourceRef = useRef();

  const changeVideoSource = (file) => {
    const vidURL = URL.createObjectURL(file);
    videoSourceRef.current.src = vidURL;
    videoElementRef.current.load();
    videoElementRef.current.play();
  };

  // handle input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    const extension = file.name.substring(file.name.lastIndexOf(".")); // validating if extension is only mp4 or not

    if (extension.toLowerCase() == ".mp4") {
      // validates extension
      return changeVideoSource(file);
    }

    alert("Only mp4 files allowed");
  };

  useEffect(() => {
    // initilizing a new Canvas

    let canvas = new fabric.Canvas("canvas");
    let video1El = document.getElementById("video1");

    let video1 = new fabric.Image(video1El, {
      left: 0,
      top: 0,
    });

    canvas.add(video1);
    fabricGlobalVideo = video1;

    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    setIsLoading(false);
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="absolute w-full h-full bg-[rgb(0,0,0,0.4)]">
          <span>Loading ...</span>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-col gap-2 items-center m-5">
        {/* <div className="flex flex-col gap-10 items-center m-5"> */}
        <input type="file" accept="video/mp4" onChange={handleInputChange} />
        {/* <div> */}
        <video
          width={w.toString()}
          height={h.toString()}
          ref={videoElementRef}
          id="video1"
          className="hidden object-scale-down"
          autoPlay
          loop
          muted>
          <source
            ref={videoSourceRef}
            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          />
        </video>
        <canvas
          width={w.toString()}
          height={h.toString()}
          id="canvas"
          className="border object-scale-down"
        />
      </div>
    </>
  );
}

export default App;
