
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import wave

app = Flask(__name__)
CORS(app)

# Path to the model directory containing the model and tokenizer files
model_directory = "./whisper-small"

# Load the processor and model
processor = WhisperProcessor.from_pretrained(model_directory)
model = WhisperForConditionalGeneration.from_pretrained(model_directory)

WAVE_OUTPUT_FILENAME = "output.wav"
RATE = 16000

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    file.save(WAVE_OUTPUT_FILENAME)

    # Load the audio file using librosa
    audio_input, sr = librosa.load(WAVE_OUTPUT_FILENAME, sr=RATE)

    # Process the audio file
    inputs = processor(audio_input, sampling_rate=RATE, return_tensors="pt").input_features

    # Generate predictions
    with torch.no_grad():
        predicted_ids = model.generate(inputs)

    # Decode the predictions
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

    return jsonify({"transcription": transcription})

if __name__ == '__main__':
    app.run(debug=True)