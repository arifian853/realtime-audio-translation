import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor
from pydub import AudioSegment

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

    # Get the target language from the request, defaulting to 'en' (English)
    target_language = request.form.get('language', 'en')

    # Convert the audio file to WAV format using pydub
    try:
        audio = AudioSegment.from_file(WAVE_OUTPUT_FILENAME)
        audio = audio.set_frame_rate(RATE)
        audio.export(WAVE_OUTPUT_FILENAME, format="wav")
    except Exception as e:
        return jsonify({"error": f"Error processing audio file with pydub: {str(e)}"}), 500

    # Load the audio file using librosa
    try:
        audio_input, sr = librosa.load(WAVE_OUTPUT_FILENAME, sr=RATE)
    except Exception as e:
        return jsonify({"error": f"Error loading audio file with librosa: {str(e)}"}), 500

    # Process the audio file
    inputs = processor(audio_input, sampling_rate=RATE, return_tensors="pt").input_features

    # Generate original transcription
    try:
        with torch.no_grad():
            predicted_ids_original = model.generate(inputs)
        original_transcription = processor.batch_decode(predicted_ids_original, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({"error": f"Error generating original transcription with model: {str(e)}"}), 500

    # Generate translated transcription
    try:
        forced_decoder_ids = processor.get_decoder_prompt_ids(language=target_language, task="translate")
        with torch.no_grad():
            predicted_ids_translated = model.generate(inputs, forced_decoder_ids=forced_decoder_ids)
        translated_transcription = processor.batch_decode(predicted_ids_translated, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({"error": f"Error generating translated transcription with model: {str(e)}"}), 500

    return jsonify({"original_transcription": original_transcription, "translated_transcription": translated_transcription})

if __name__ == '__main__':
    app.run(debug=True)
