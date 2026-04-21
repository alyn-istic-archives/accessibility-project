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

function clearText() {
    const textBox = document.getElementById('textBox');
    const status = document.getElementById('status');
    
    textBox.value = '';
    window.speechSynthesis.cancel();
    status.textContent = 'Cleared.';
}
