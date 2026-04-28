import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
 
let gestureRecognizer;
let webcamRunning = false;
let lastVideoTime = -1;
let lastTriggeredGesture = null;
let gestureSteadyFrames = 0;
const HOLD_THRESHOLD = 18; // hold ~0.6s before firing
 
const videoHeight = "480px";
const videoWidth = "640px";

const output = document.getElementById("photobooth-output");

const video = document.getElementById('video-preview');
const captureButton = document.getElementById('captureButton');
const capturedPhotoContainer = document.getElementById('photobooth-output');
const downloadButton = document.getElementById('downloadButton');
const retakePicturesButton = document.getElementById('retakePicturesButton');

const photosArray = [];
let photoCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
  captureButton.addEventListener('click', takePhoto)
  downloadButton.addEventListener('click', downloadPhotos);
  startCamera();
})


// async function openCamera() {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//     } catch (err) {
//         console.error("Camera error:", err);
//         alert("Could not access camera. Make sure you allow permissions.");
//     }

  retakePicturesButton.addEventListener('click', () => {
        retakePhotos();
    })
// }

function retakePhotos() {
    photosArray.length = 0; 
    photoCount = 0;
    captureButton.disabled = false;
    capturedPhotoContainer.innerHTML = '';
}

async function takePhoto () {
if (photoCount >= 4) {
    captureButton.disabled = true;
    retakePicturesButton.disabled = false;
    return;
  }

  captureButton.disabled = true;  

  const countdownElement = document.createElement('div');
  countdownElement.classList.add("countdown");
  document.body.appendChild(countdownElement);

  const takeSinglePhoto = async () => {
    if (photoCount >= 4) {
      captureButton.disabled = true;
      countdownElement.remove();
      retakePicturesButton.disabled = false;
      return;
    }

    retakePicturesButton.disabled = true;

    for (let i = 3; i > 0; i--) {
      countdownElement.textContent = i;
      await new Promise((r) => setTimeout(r, 50));
    }

    countdownElement.textContent = ""; 

    const canvas = document.createElement('canvas');
    canvas.width = parseInt(videoWidth);
    canvas.height = parseInt(videoHeight);

    const ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);  

    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/png');

    photosArray.push(photoData);
    photoCount++;

    console.log(`Photo ${photoCount} captured!`, photosArray);

    const img = document.createElement('img');
    img.src = photoData;
    img.style.width = '150px';
    img.style.margin = '5px';
    capturedPhotoContainer.appendChild(img);
  };


  for (let i = photoCount; i < 4; i++) {
    await takeSinglePhoto();
    await new Promise((r) => setTimeout(r, 750)); // short pause between photos
  }

  countdownElement.remove();
  captureButton.disabled = true;
  retakePicturesButton.disabled = false;
}


async function downloadPhotos() {
 if (photosArray.length === 0) {
        alert("No photos to download!");
        return;
    }

    const singleWidth = 512;   
    const singleHeight = 600;  
    const border = 10;         
    const textHeight = 40;    


    const canvas = document.createElement('canvas');
    canvas.width = singleWidth + border * 3;
    canvas.height = singleHeight * 4 + border * 3 + textHeight;

    const ctx = canvas.getContext('2d');


    ctx.fillStyle = "#aadef2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < photosArray.length; i++) {
        const img = new Image();
        const frame = new Image();
        img.src = photosArray[i];
        frame.src = "images/frame.png";

        await new Promise((resolve) => {
            img.onload = () => {
                const col = i % 1;
                const row = Math.floor(i);

                const x = border + col * (singleWidth + border);
                const y = border + row * (singleHeight + border);

                ctx.drawImage(img, x, y, singleWidth, singleHeight);
                ctx.drawImage(frame, x, y, singleWidth, singleHeight);
                resolve();
            };
        });
    }

 
    ctx.fillStyle = "#000000"; 
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "Photobooth",
        canvas.width / 2,
        canvas.height - textHeight / 2
    );


    const finalImage = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = 'photobooth.png';
    link.click();
}
 
// ── Init ──────────────────────────────────────────────────────────
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
  console.log("GestureRecognizer ready");
};
 
// ── Camera start (called from navigation.html on load) ────────────
export async function startCamera() {
  await createGestureRecognizer();
 
  const video = document.getElementById("video-preview");
  const camOff = document.getElementById("cam-off-msg");
  const camDot = document.getElementById("cam-dot");
 
  if (!navigator.mediaDevices?.getUserMedia) {
    if (camOff) { camOff.style.display = "flex"; camOff.textContent = "Camera not supported in this browser"; }
    return;
  }
 
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = "block";
    if (camOff) camOff.style.display = "none";
    if (camDot) camDot.style.background = "var(--accent2)";
 
    video.addEventListener("loadeddata", () => {
      webcamRunning = true;
      predictWebcam();
    });
  } catch (err) {
    if (camOff) { camOff.style.display = "flex"; camOff.textContent = "Camera unavailable or permission denied"; }
    console.warn("Camera error:", err);
  }
}
 
// ── Main prediction loop ──────────────────────────────────────────
async function predictWebcam() {
  const video = document.getElementById("video-preview");
  const canvas = document.getElementById("gesture-canvas");
  if (!canvas) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
 
  canvas.style.height = videoHeight;
  canvas.style.width = videoWidth;
 
  const canvasCtx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);
 
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);
 
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
 
    // Draw hand skeleton overlay
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {


        drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
          color: "#6064e8",
          lineWidth: 2
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: "#4dfcff",
          thickness: 1,
          radius: 1
        });
      }
    }
    canvasCtx.restore();
 
    // Process gesture
    if (results.gestures.length > 0) {
      const categoryName = results.gestures[0][0].categoryName;
      const score = parseFloat(results.gestures[0][0].score * 100).toFixed(1);
 
      updateGestureStatus(categoryName, score);
      handleGestureHold(categoryName);
    } else {
      updateGestureStatus(null);
      gestureSteadyFrames = 0;
      lastTriggeredGesture = null;
    }
  }
 
  if (webcamRunning) window.requestAnimationFrame(predictWebcam);
}
 
// ── Hold-to-trigger logic ─────────────────────────────────────────
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
 
// ── Map MediaPipe gesture names → your app actions ────────────────
// Built-in gesture names: Thumb_Up, Thumb_Down, Open_Palm,
// Closed_Fist, Victory, Pointing_Up, ILoveYou, None
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
      if (typeof stopMic === "function") stopMic();
      showToast("👊 Stop Mic");
      break;
 
    case "Pointing_Up":
      document.getElementById("textBox")?.focus();
      showToast("☝️ Text box focused");
      break;

    case "ILoveYou":
      if (captureButton.disabled) return;
      takePhoto();
      showToast("🤟 Say cheese!");
      break;
  }
 
  // Reset so it won't re-fire until gesture is released and re-held
  gestureSteadyFrames = 0;
  lastTriggeredGesture = null;
}
 
// ── UI helpers ────────────────────────────────────────────────────
function updateGestureStatus(gesture, score) {
  const el = document.getElementById("gesture-status");
  if (!el) return;
 
  const labels = {
    Open_Palm:    "✋ Open palm",
    Thumb_Up:     "👍 Thumbs up",
    Thumb_Down:   "👎 Thumbs down",
    Victory:      "✌️ Peace / V",
    Closed_Fist:  "👊 Fist",
    Pointing_Up:  "☝️ Pointing up",
    Pointing_Down: "pointind down",
    Pointing_Left: "point left",
    ILoveYou:     "🤟 I love you",
    None:         null
  };
 
  const label = labels[gesture] ?? null;
  if (label) {
    const progress = Math.min(100, Math.round((gestureSteadyFrames / HOLD_THRESHOLD) * 100));
    el.textContent = `${label} — ${score}% · hold ${progress}%`;
    el.style.color = "var(--accent)";
  } else {
    el.textContent = "No gesture";
    el.style.color = "var(--muted)";
  }
}
 
function showToast(msg) {
  let toast = document.getElementById("gesture-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "gesture-toast";
    toast.style.cssText = `
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: #0a0a0f;
      font-family: 'Space Mono', monospace; font-size: 0.85rem; font-weight: 700;
      padding: 0.6rem 1.4rem; border-radius: 4px;
      z-index: 999; transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2000);
}
