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
