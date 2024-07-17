import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor, MarianMTModel, MarianTokenizer
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

# Define a dictionary mapping language pairs to MarianMT model names
mt_models = {
    'id-en': 'Helsinki-NLP/opus-mt-id-en',
    'en-id': 'Helsinki-NLP/opus-mt-en-id',
    'ja-en': 'Helsinki-NLP/opus-mt-ja-en',
    'en-ja': 'Helsinki-NLP/opus-mt-en-ja',
    'ko-en': 'Helsinki-NLP/opus-mt-ko-en',
    'en-ko': 'Helsinki-NLP/opus-mt-en-ko',
    'zh-en': 'Helsinki-NLP/opus-mt-zh-en',
    'en-zh': 'Helsinki-NLP/opus-mt-en-zh',
    'ms-en': 'Helsinki-NLP/opus-mt-ms-en',
    'en-ms': 'Helsinki-NLP/opus-mt-en-ms',
    'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
    'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
    'es-en': 'Helsinki-NLP/opus-mt-es-en',
    'en-es': 'Helsinki-NLP/opus-mt-en-es'
}

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    file.save(WAVE_OUTPUT_FILENAME)

    # Get the target language from the request, defaulting to 'en' (English)
    language_pair = request.form.get('language', 'en-id')

    if language_pair not in mt_models:
        return jsonify({"error": "Unsupported language pair"}), 400

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
            original_predicted_ids = model.generate(inputs)
    except Exception as e:
        return jsonify({"error": f"Error generating original transcription: {str(e)}"}), 500

    # Decode the original transcription
    try:
        original_transcription = processor.batch_decode(original_predicted_ids, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({"error": f"Error decoding original transcription: {str(e)}"}), 500

    # Translate the original transcription
    try:
        mt_model_name = mt_models[language_pair]
        mt_tokenizer = MarianTokenizer.from_pretrained(mt_model_name)
        mt_model = MarianMTModel.from_pretrained(mt_model_name)

        translation_inputs = mt_tokenizer(original_transcription, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            translated_ids = mt_model.generate(**translation_inputs)
        translated_transcription = mt_tokenizer.decode(translated_ids[0], skip_special_tokens=True)
    except Exception as e:
        return jsonify({"error": f"Error translating transcription: {str(e)}"}), 500

    return jsonify({
        "original_transcription": original_transcription,
        "translated_transcription": translated_transcription
    })

if __name__ == '__main__':
    app.run(debug=True)
