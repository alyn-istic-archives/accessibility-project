let fullTranscript = '';
let transcriptHTML = '';
let mediaRecorder = null;
let recordedChunks = [];
let videoStream = null;
let sessionStartTime = null;
let sessionElapsed = 0;
let noSpeechTimer = null;
let hadSpeech = false;


const textBox = document.getElementById('textBox');
const micBtn = document.getElementById('micBtn');
const ready_status = document.getElementById('status');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();
 

async function startMic() {
    fullTranscript = '';
    transcriptHTML = '';
    hadSpeech = false;
    sessionElapsed = 0;
    document.getElementById('transcript').innerHTML = '<span style="color:var(--muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Waiting for speech…</span>';

    sessionStartTime = Date.now();
    // await startCamera();
    if (!recognition) {
        startSpeechRecognition();
    }
}

async function stopMic() {
    fullTranscript = '';
    transcriptHTML = '';
    hadSpeech = false;
    sessionElapsed = 0;
    recognition.stop();
    document.getElementById('transcript').innerHTML = '<span style="color:var(--muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Waiting for speech…</span>';
}

function startSpeechRecognition() {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let interimSpan = null;

    recognition.onresult = (event) => {
        hadSpeech = true;
        clearTimeout(noSpeechTimer);
        const transcript = document.getElementById('transcript');
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
                const text = res[0].transcript;
                fullTranscript += text + ' ';
                // remove old interim span and append final
                if (interimSpan) {
                    interimSpan.remove();
                    interimSpan = null;
                }
                const finalEl = document.createElement('span');
                finalEl.textContent = text + ' ';
                transcript.appendChild(finalEl);
                transcript.scrollTop = transcript.scrollHeight;
            } else {
                interim += res[0].transcript;
            }
        }

        // update interim
        if (interimSpan) interimSpan.remove();
        if (interim) {
            interimSpan = document.createElement('span');
            interimSpan.style.color = 'var(--muted)';
            interimSpan.style.fontStyle = 'italic';
            interimSpan.textContent = interim;
            transcript.appendChild(interimSpan);
            transcript.scrollTop = transcript.scrollHeight;
        }
    };

    recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
        document.getElementById('no-speech-notice').style.display = 'block';
        document.getElementById('no-speech-notice').textContent = '⚠ Microphone permission denied';
        }
    };

    recognition.start();
}
