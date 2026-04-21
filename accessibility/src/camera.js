

window.addEventListener('load', () =>
    startCamera());
import GestureRecognizer from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import FilesetResolver from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import DrawingUtils from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";


const demosSection = document.getElementById("demos");

let gestureRecognizer= GestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton= HTMLButtonElement;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO"
  });
};
createGestureRecognizer();

async function startCamera() {
    const video = document.getElementById('video-preview');
    const camOff = document.getElementById('cam-off-msg');
      const camDot = document.getElementById('cam-dot');
 
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        if (camOff) camOff.style.display = 'none';
        if (camDot) {
            camDot.style.background = 'var(--green)';
        }
        
        await video.play();
        initHandTracking(video);
    } catch (err) {
        if (camOff) { camOff.style.display = 'flex'; camOff.textContent = 'Camera unavailable or permission denied'; }
        console.warn('Camera error:', err);
    }
}

/********************************************************************
// Demo 1: Detect hand gestures in images
********************************************************************/

const imageContainers = document.getElementsByClassName("detectOnClick");

for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i].children[0].addEventListener("click", handleClick);
}

async function handleClick(event) {
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await gestureRecognizer.setOptions({ runningMode: "IMAGE" });
  }
  // Remove all previous landmarks
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  const results = gestureRecognizer.recognize(event.target);

  // View results in the console to see their format
  console.log(results);
  if (results.gestures.length > 0) {
    const p = event.target.parentNode.childNodes[3];
    p.setAttribute("class", "info");

    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = parseFloat(
      results.gestures[0][0].score * 100
    ).toFixed(2);
    const rawHandedness = results.handednesses[0][0].displayName;
    const handedness = rawHandedness === "Left" ? "Right" : "Left";

    p.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore}%\n Handedness: ${handedness}`;
    p.style =
      "left: 0px;" +
      "top: " +
      event.target.height +
      "px; " +
      "width: " +
      (event.target.width - 10) +
      "px;";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";

    event.target.parentNode.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 5
        }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 1
      });
    }
  }
}

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
    const video = document.getElementById("video-preview");
    const canvas = document.getElementById("gesture-canvas");
    const convasCtx = convas.getContext("2d");
    const drawingUtils= new DrawingUtils(canvasCtx);

    if (!canvas) return;
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }
    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    let drawingUtils = new DrawingUtils(canvasCtx);

    canvas.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvas.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
            landmarks,
            GestureRecognizer.HAND_CONNECTIONS,
            {
                //connections
                color: "#003cff",
                lineWidth: 5
            }
        );
        drawingUtils.drawLandmarks(landmarks, {
            //points
            color: "#FF0000",
            lineWidth: 2
        });
        }
    }
    canvasCtx.restore();

    //process gesture

    if (results.gestures.length > 0) {
        gestureOutput.style.display = "block";
        gestureOutput.style.width = videoWidth;
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);

        const rawHandedness = results.handednesses[0][0].displayName;
        const handedness = rawHandedness === "Left" ? "Right" : "Left";

        updateGestureStatus(categoryName, score);
        handleGestureHold(categoryName);

        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
    } else {
        updateGestureStatus(null);
        gestureSteadyFrames = 0;
        lastTriggeredGesture = null;
        gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
function handleGestureHold(categoryName) {
    if (categoryName === lastTriggeredGesture) {
        gestureSteadyFrames++;
        if (gestureSteadyFrames === HOLD_THRESHOLD) {
        triggerAction(categoryName);
        }
    } else {
        lastTriggeredGesture = categoryName;
        gestureSteadyFrames = 0;
    }
}

function triggerAction(gesture) {
    switch (gesture) {
        case "Open_Palm":
        window.speechSynthesis.cancel();
        showToast("✋ Stopped speaking");
        break;
    
        case "Thumb_Up":
        if (typeof speakText === "function") speakText();
        showToast("👍 Speaking text…");
        break;
    
        case "Victory":
        if (typeof startMic === "function") startMic();
        showToast("✌️ Listening…");
        break;
    
        case "Closed_Fist":
        if (typeof clearText === "function") clearText();
        showToast("👊 Cleared");
        break;
    
        case "Pointing_Up":
        document.getElementById("textBox")?.focus();
        showToast("☝️ Text box focused");
        break;
    }
    
    // Reset so it won't re-fire until gesture is released and re-held
    gestureSteadyFrames = 0;
    lastTriggeredGesture = null;
}

