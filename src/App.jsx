import {useRef,useEffect,useState} from 'react'
import './App.css'
import * as faceapi from 'face-api.js'

function App(){
  const videoRef = useRef()
  const canvasRef = useRef()
  const fileInputRef = useRef();
  let interval=useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
      canvasRef.current.innerHtml="";
      clearInterval(interval.current);

    } else {
      loadModels();
    }
    setIsPlaying(!isPlaying);
  };
  const loadModels = ()=>{
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")

      ]).then(()=>{
      detectFaces()
    })
  }

  const detectFaces = ()=>{
    interval.current=videoRef.current.play().then(()=>{
      setInterval(async()=>{
        const detections = await faceapi.detectAllFaces(videoRef.current,
          new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
          canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);

          faceapi.matchDimensions(canvasRef.current,{
            width:videoRef.current.width,
            height:videoRef.current.height
          })
          const resized = faceapi.resizeResults(detections,{
             width:canvasRef.current.width,
            height:canvasRef.current.height
          })
          faceapi.draw.drawDetections(canvasRef.current,resized)
          faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
          faceapi.draw.drawFaceExpressions(canvasRef.current,resized)
      },1000)
    })
  }
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      videoRef.current.load();
     
    }
  };
  return (
    < >
      <div className='input'>
        <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} />
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      </div>
      <div className='second'>
      <video style={{position:"absolute"}}  width={450} height={450} crossOrigin="anonymous" ref={videoRef} ></video>
      <canvas style={{position:"absolute"}} ref={canvasRef} 
      className="appcanvas"/>
      </div>
   
    </>
    )

}

export default App;