const narration_btn = document.getElementById('narration-btn');
let savedNarration = localStorage.getItem('narrationActive');
let narrationActive = (savedNarration === null) ? false : (savedNarration === 'true');
window.addEventListener('DOMContentLoaded', () => {

    if (savedNarration == true) {
        narrationActive = false;
    }


    // Sync the button text with the saved state
    if (narration_btn) {
        narration_btn.textContent = `narration: ${narrationActive ? 'on' : 'off'}`;
    }
});

if (status){
    const textBox = document.getElementById('textBox');
    const status = document.getElementById('status');
        
    const text = textBox.value.trim();
}



function toggleNarration() {
    if (narrationActive){
        narration_btn.textContent = "narration: off";
        speakNarrationBtn('narration off');
        narrationActive = false;
        console.log('narration turned off');
            
    } else {
        narration_btn.textContent = "narration: on";
        speakNarrationBtn('narration on');
        narrationActive = true;
        console.log('narration turned on');
    }
}
    

function speakText() {
    const textBox = document.getElementById('textBox');
    const status = document.getElementById('status');
        
    const text = textBox.value.trim();
    if (!text) { status.textContent = 'Nothing to speak!'; return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Microsoft Zira'));  // good on Edge
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;

        // Pick the best available voic

    utterance.onstart = () => status.textContent = '🔊 Speaking...';
    utterance.onend = () => status.textContent = 'Done speaking.';
    window.speechSynthesis.speak(utterance);
}

function speakNarrationBtn(textmsg) { // Don't speak if narration is off
    const special_text = textmsg;
    if (!special_text) { status.textContent = 'Nothing to speak!'; return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(special_text);

    utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Microsoft Zira'));  // good on Edge
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

function speak(textmsg) { // Don't speak if narration is off
    if (narrationActive === false) return;
    const special_text = textmsg;
    if (!special_text) { status.textContent = 'Nothing to speak!'; return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(special_text);

    utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Microsoft Zira'));  // good on Edge
    utterance.lang = 'en-US';
    utterance.rate = 1.5;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

function clearText() {
    
    
    textBox.value = '';
    window.speechSynthesis.cancel();
    status.textContent = 'Cleared.';
}
