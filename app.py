from flask import Flask, request, jsonify, render_template
import cv2
import numpy as np
import base64
from PIL import Image
import io

app = Flask(__name__)

# Load the pre-trained face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# In a real-world scenario, you would have a database of known faces
# For this example, we'll use a simple dictionary
known_faces = {
    "person1": np.random.rand(128),  # 128-dimensional face encoding
    "person2": np.random.rand(128),
}

def recognize_face(image):
    # Convert base64 image to numpy array
    img = Image.open(io.BytesIO(base64.b64decode(image.split(',')[1])))
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Detect faces
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        return None

    # For simplicity, we'll just use the first detected face
    (x, y, w, h) = faces[0]
    face = img[y:y+h, x:x+w]

    # In a real scenario, you would extract face encodings here
    # For this example, we'll just generate a random encoding
    face_encoding = np.random.rand(128)

    # Compare with known faces
    min_dist = float('inf')
    recognized_name = "Unknown"
    for name, known_encoding in known_faces.items():
        dist = np.linalg.norm(face_encoding - known_encoding)
        if dist < min_dist:
            min_dist = dist
            recognized_name = name

    return recognized_name, 1 - min_dist  # Using 1 - distance as confidence

def simulate_thermal_scan():
    # In a real scenario, this would interface with thermal scanning hardware
    return np.random.uniform(36.0, 37.5)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.json
    image = data['image']
    
    result = recognize_face(image)
    if result is None:
        return jsonify({"error": "No face detected"}), 400

    name, confidence = result
    temperature = simulate_thermal_scan()

    return jsonify({
        "name": name,
        "confidence": f"{confidence:.2f}",
        "temperature": f"{temperature:.1f}"
    })

if __name__ == '__main__':
    app.run(debug=True)