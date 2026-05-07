window.addEventListener('DOMContentLoaded', () => {
    // Initialize camera and gesture recognition
    // Initialize speech recognition
    // startSpeechRecognition(); // Start when user clicks mic button
    speak('narration on');

    let savedNarration = localStorage.getItem('narrationActive');
    let narrationOn = (savedNarration === null) ? true : (savedNarration === 'true');

    const narration_btn = document.getElementById('narration-btn');
    
    // Sync the button text with the saved state
});
const body = document.getElementById("body");

if (narration_btn){
    narration_btn.addEventListener('click', flash());
}

async function flash(){
    if (body.classList.contains("flash")){
        body.classList.remove("flash");
        await new Promise((r) => setTimeout(r, 50));
        body.classList.add("flash");
    }
    else{
        body.classList.add("flash");
    }
}