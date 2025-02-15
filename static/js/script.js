const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const recognizeButton = document.getElementById('recognize');
const capturedImage = document.getElementById('captured-image');
const recognitionResult = document.getElementById('recognition-result');
const historyButton = document.getElementById('history');
const historyContainer = document.getElementById('history-container');

// Access the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the camera", err);
    });

// Capture image from video feed
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    capturedImage.src = canvas.toDataURL('image/jpeg');
});

// Send captured image to backend for recognition
recognizeButton.addEventListener('click', () => {
    if (capturedImage.src) {
        fetch('/recognize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: capturedImage.src }),
        })
        .then(response => response.json())
        .then(data => {
            recognitionResult.textContent = `Recognized: ${data.name}
            Confidence: ${data.confidence}
            Temperature: ${data.temperature}°C`;
        })
        .catch(error => {
            console.error('Error:', error);
            recognitionResult.textContent = 'Error during recognition';
        });
    } else {
        recognitionResult.textContent = 'Please capture an image first';
    }
});

historyButton.addEventListener('click', () => {
    fetch('/recognition_history')
        .then(response => response.json())
        .then(data => {
            let historyHTML = '<h2>Recognition History</h2><ul>';
            data.forEach(entry => {
                historyHTML += `<li>
                    Name: ${entry.name}, 
                    Confidence: ${entry.confidence.toFixed(2)}, 
                    Temperature: ${entry.temperature.toFixed(1)}°C, 
                    Time: ${new Date(entry.timestamp).toLocaleString()}
                </li>`;
            });
            historyHTML += '</ul>';
            historyContainer.innerHTML = historyHTML;
        })
        .catch(error => {
            console.error('Error:', error);
            historyContainer.textContent = 'Error fetching recognition history';
        });
});