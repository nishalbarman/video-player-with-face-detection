import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { fabric } from "fabric";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelsReady, setIsModelsReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoSource, setVideoSource] = useState(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );

  const [w, setWidth] = useState(window.innerWidth || screen.width);

  const videoElementRef = useRef();
  const videoSourceRef = useRef();
  const fabricCanvasRef = useRef();

  const faceDetectCanvas = useRef();

  // handle input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    const vidURL = URL.createObjectURL(file);
    videoSourceRef.current.src = vidURL;
    videoElementRef.current.load();
    videoElementRef.current.play();
    setIsVideoPlaying(true);
  };

  const loadFaceApiModels = async () => {
    // load all the models first
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ])
      .then(() => {
        setIsLoading(false);
        setIsModelsReady(true);
      })
      .catch((er) => {
        console.error(er);
      });
  };

  // handle play and pause
  const handlePlay = () => {
    if (!isVideoPlaying) {
      videoElementRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handlePause = () => {
    if (isVideoPlaying) {
      videoElementRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const detectFaces = () => {
    const id = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(
          "fabric-vdo-canvas",
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      faceDetectCanvas.current.innerHTML = faceapi.createCanvasFromMedia(
        videoElementRef.current
      );

      faceapi.matchDimensions(faceDetectCanvas.current, {
        width: w,
        height: (w * 9) / 16,
      });

      const resized = faceapi.resizeResults(detections, {
        width: w,
        height: (w * 9) / 16,
      });

      faceapi.draw.drawDetections(faceDetectCanvas.current, resized);
    }, 100);

    return id;
  };

  // add window resize event and load the modesls for face-api
  useEffect(() => {
    const windowResize = (e) => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", windowResize);

    loadFaceApiModels();

    return () => {
      window.removeEventListener("resize", windowResize);
    };
  }, []);

  // create canvas and track faces
  useEffect(() => {
    const canvas = new fabric.Canvas(fabricCanvasRef.current, {});

    // videoElementRef.current.width = canvas.width;
    // videoElementRef.current.height = canvas.height;

    const video = new fabric.Image(videoElementRef.current, {
      left: 10,
      top: 10,
      // width: videoElementRef.current.width,
      // height: videoElementRef.current.height,
      objectCaching: false,
      selectable: true,
      evented: true,
    });

    canvas.add(video);
    canvas.bringToFront(video);

    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    const id = detectFaces();

    return () => {
      clearInterval(id);
      canvas.dispose();
      videoElementRef.current.pause();
    };
  }, [videoSource, w]);

  return (
    <>
      {isLoading ? (
        <span className="text-center w-[100%] font-bold text-xl">
          Loading ...
        </span>
      ) : (
        <></>
      )}
      <div className="flex flex-col gap-2 items-center m-5">
        {isModelsReady ? (
          <div className="flex items-center justify-center w-[90%] ">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-fit p-5 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100   ">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className=" text-sm text-gray-500 ">
                  <span className="font-semibold text-lg">Click to upload</span>{" "}
                  or drag and drop
                </p>
              </div>
              <input
                id="file-upload"
                className="hidden"
                type="file"
                accept="video/mp4"
                onChange={handleInputChange}
              />
            </label>
          </div>
        ) : (
          <></>
        )}

        {videoElementRef.current ? (
          <>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                disabled={isVideoPlaying}
                className="disabled:bg-gray-500 disabled:cursor-not-allowed h-10 w-[150px] bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-500"
                onClick={handlePlay}>
                Play
              </button>
              <button
                disabled={!isVideoPlaying}
                className="disabled:bg-gray-500 disabled:cursor-not-allowed h-10 w-[150px] bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-500"
                onClick={handlePause}>
                Pause
              </button>
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="flex flex-col gap-2 items-center m-5 relative">
          <video
            width={w}
            height={(w * 9) / 16}
            crossOrigin="anonymous"
            ref={videoElementRef}
            id="video1"
            className="hidden rouned object-contain"
            autoPlay={true}
            loop={false}
            muted>
            <source
              className="w-full h-full"
              ref={videoSourceRef}
              src={videoSource}
            />
          </video>
          <canvas
            width={w}
            height={(w * 9) / 16}
            ref={fabricCanvasRef}
            id="fabric-vdo-canvas"
            className="border"
          />
          <canvas ref={faceDetectCanvas} id="canvas1" className="absolute" />
        </div>
      </div>
    </>
  );
}

export default App;
