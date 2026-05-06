

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
const background = document.getElementById("app");
const HOLD_THRESHOLD = 18; // hold ~0.6s before firing
 
const videoHeight = "600"; //3
const videoWidth = "800px"; //4

const frame_img = document.getElementById("frame");
const next_frame = document.getElementById("next-frame-button");
const previous_frame = document.getElementById("previous-frame-button");

const gestures = document.getElementById("help");

const frames = [
  "images/frame.png",
  "images/frame2.png",
  "images/frame3.png",
  "images/frame4.png",
];

const themes = [
  "blue",
  "pink",
  "yellow",
  "red",
]

const output = document.getElementById("photobooth-output");

const video = document.getElementById('video-preview');
const captureButton = document.getElementById('captureButton');
const capturedPhotoContainer = document.getElementById('photobooth-output');
const downloadButton = document.getElementById('downloadButton');
const retakePicturesButton = document.getElementById('retakePicturesButton');
const gesture_btn = document.getElementById('help');

const photosArray = [];
let photoCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
  captureButton.addEventListener('click', takePhoto)
  downloadButton.addEventListener('click', downloadPhotos);
  startCamera();
})

if (next_frame){
  next_frame.addEventListener('click', nextFrame);
}
if (previous_frame){
  previous_frame.addEventListener('click', previousFrame);
}

if (gesture_btn){
  gesture_btn.addEventListener('click', gesture_appear);
}

function gesture_appear(){
  if (gestures.classList.contains("show")){
    gestures.classList.remove("show");
  }else{
    gestures.classList.add("show");
  }
}


async function nextFrame(){
    const currentSrc = frame_img.src;
    frames.forEach((frame) => {
        if (currentSrc.includes(frame)) {
            const currentIndex = frames.indexOf(frame);
            const nextIndex = (currentIndex + 1) % frames.length;
            frame_img.src = frames[nextIndex];
            changeTheme(themes[nextIndex]);
        }
      });
}

async function previousFrame(){
    const currentSrc = frame_img.src;
    frames.forEach((frame) => {
        if (currentSrc.includes(frame)) {
            const currentIndex = frames.indexOf(frame);
            const nextIndex = (currentIndex - 1 + frames.length) % frames.length;
            frame_img.src = frames[nextIndex];
            changeTheme(themes[nextIndex]);
        }
      });
}


function changeTheme(theme){
  if (theme === "blue"){
    document.documentElement.style.setProperty('--accent', '#87A9F1');
    document.documentElement.style.setProperty('--border', '#274F81');
    document.documentElement.style.setProperty('--text', '#A4D5e4');
    document.documentElement.style.setProperty('--muted', '#3F4B7C');
    document.documentElement.style.setProperty('--bg', '#cbd5dd');
    document.documentElement.style.setProperty('--surface', '#dbe9f4');
  }
  if (theme === "pink"){
    document.documentElement.style.setProperty('--accent', '#FF7E96');
    document.documentElement.style.setProperty('--border', '#A32139');
    document.documentElement.style.setProperty('--text', '#FFB0BE');
    document.documentElement.style.setProperty('--muted', '#A7243C');
    document.documentElement.style.setProperty('--bg', '#ddcbcd');
    document.documentElement.style.setProperty('--surface', '#f4d9d9');
  }
  if (theme === "yellow"){
    document.documentElement.style.setProperty('--accent', '#F9E79F');
    document.documentElement.style.setProperty('--border', '#B7950B');
    document.documentElement.style.setProperty('--text', '#FDF2E9');
    document.documentElement.style.setProperty('--muted', '#B7950B');
    document.documentElement.style.setProperty('--bg', '#f2e5cb');
    document.documentElement.style.setProperty('--surface', '#f9e79f');
  }
  if (theme === "red"){
    document.documentElement.style.setProperty('--accent', '#F1948A');
    document.documentElement.style.setProperty('--border', '#922B21');
    document.documentElement.style.setProperty('--text', '#F5B7B1');
    document.documentElement.style.setProperty('--muted', '#922B21');
    document.documentElement.style.setProperty('--bg', '#f2c9c9');
    document.documentElement.style.setProperty('--surface', '#f1948a');
  }
}

retakePicturesButton.addEventListener('click', () => {
  retakePhotos();
})
// }
function retakePhotos() {
    photosArray.length = 0; 
    photoCount = 0;
    captureButton.disabled = false;
    capturedPhotoContainer.innerHTML = '';
    capturedPhotoContainer.classList.remove("has-photos");
}

async function takePhoto () {
if (photoCount >= 4) {
    captureButton.disabled = true;
    retakePicturesButton.disabled = false;
    downloadButton.disabled = false;
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
      downloadButton.disabled = false;
      return;
    }

    retakePicturesButton.disabled = true;
    downloadButton.disabled = true;

    for (let i = 3; i > 0; i--) {
      countdownElement.textContent = i;
      speak(i.toString());
      await new Promise((r) => setTimeout(r, 750));
      if (i==1){
        video.classList.add('flash-effect');
        setTimeout(() => video.classList.remove('flash-effect'), 200);
      }
    }


    countdownElement.textContent = ""; 

    const canvas = document.createElement('canvas');
    canvas.width = parseInt(videoWidth);
    canvas.height = parseInt(videoHeight);

    const ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);  

    const frame = document.createElement('img');
    frame.src = frame_img.src;
    frame.style.width = '200px';
    frame.style.margin = '5px';
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.resetTransform();
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/png');

    photosArray.push(photoData);
    photoCount++;

    canvas.classList.add("bob");

    console.log(`Photo ${photoCount} captured!`, photosArray);

    const img = document.createElement('img');
    img.src = photoData;
    img.style.width = '200px';
    img.style.margin = '5px';
    capturedPhotoContainer.appendChild(img);
    capturedPhotoContainer.classList.add("has-photos");
  };


  for (let i = photoCount; i < 4; i++) {
    await takeSinglePhoto();
    await new Promise((r) => setTimeout(r, 750)); // short pause between photos
  }

  countdownElement.remove();
  captureButton.disabled = true;
  retakePicturesButton.disabled = false;
  downloadButton.disabled = false;
}

async function downloadPhotos() {
  if (photosArray.length === 0) {
        alert("No photos to download!");
        return;
    }

    const singleWidth = 500;   
    const singleHeight = 375;  
    const border = 10;         
    const textHeight = 40;    


    const canvas = document.createElement('canvas');
    canvas.width = singleWidth + border * 2;
    canvas.height = singleHeight * 4 + border * 3 + textHeight;

    const ctx = canvas.getContext('2d');


    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const strip = new Image();
    strip.src = "images/strip.png";

    for (let i = 0; i < photosArray.length; i++) {
        const img = new Image();


        img.src = photosArray[i];

    
        


        await new Promise((resolve) => {
          
            img.onload = () => {

              const col = i % 1;
              const row = Math.floor(i);

              const x = border + col * (singleWidth + border);
              const y = border + row * (singleHeight + border);
      

                ctx.drawImage(img, x, y, singleWidth, singleHeight);
                resolve();
            };
        });
      
    }

    // ctx.drawImage(strip, 0, 0, canvas.width, canvas.height);

    

    const finalImage = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = 'photobooth.png';
    for (let i = 0; i < 2; i++) {
      await link.click();
      await new Promise((r) => setTimeout(r, 1750)); // short pause between photos
    }
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
    //   window.speechSynthesis.cancel();
    //   showToast("✋ Stopped speaking");
    //   break;
 
    // case "ILoveYou":
    //   if (typeof speakText === "function") speakText();
    //   showToast("👍 Speaking text…");
    //   break;
 
    case "Closed_Fist":
      if (typeof retakePhotos === "function")
      if (!retakePicturesButton.disabled){
        retakePhotos();
      }
      showToast("(Possibly) Retaking Photos...");
      break;
 
    case "Thumb_Up":
      if (typeof downloadPhotos === "function")
      if (!downloadButton.disabled){
        downloadPhotos();
      }
      showToast("(Possibly) Downloading Photos...");
      break;
 
    case "Pointing_Up":
      nextFrame();
      showToast("☝️ Next frame");
      break;

    case "Victory":
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
    const progress = Math.min(100, Math.round((gestureSteadyFrames / HOLD_THRESHOLD) * 500));
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
    toast.classList.add("alert");
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2000);
}
