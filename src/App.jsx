import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoCanvasRef = useRef();

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas("canvas", {
      width: 500,
      height: 500,
      backgroundColor: "black",
    });
  });
  return (
    <>
      <div className="flex flex-col">
        <canvas ref={videoCanvasRef} id="videoCanvas"></canvas>
      </div>
    </>
  );
}

export default App;
