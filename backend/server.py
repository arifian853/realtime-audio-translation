import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor, MarianMTModel, MarianTokenizer
from pydub import AudioSegment
from TTS.api import TTS

app = Flask(__name__)
CORS(app)

# Define directories
UPLOAD_FOLDER = './uploads'
TTS_FOLDER = './tts_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TTS_FOLDER, exist_ok=True)

# Set configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TTS_FOLDER'] = TTS_FOLDER

# Load models
whisper_model_directory = "./whisper-small"
processor = WhisperProcessor.from_pretrained(whisper_model_directory)
model = WhisperForConditionalGeneration.from_pretrained(whisper_model_directory)

mt_model_paths = {
    'id-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-id-en',
    'en-id': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-id',
    'fr-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-fr-en',
    'en-fr': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-fr',
    'es-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-es-en',
    'en-es': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-es'
}

tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
    file.save(filepath)

    language_pair = request.form.get('language', 'id-en')
    if language_pair not in mt_model_paths:
        return jsonify({"error": "Unsupported language pair"}), 400

    try:
        audio = AudioSegment.from_file(filepath)
        audio = audio.set_frame_rate(16000)
        audio.export(filepath, format="wav")
    except Exception as e:
        return jsonify({"error": f"Error processing audio file: {str(e)}"}), 500

    try:
        audio_input, sr = librosa.load(filepath, sr=16000)
        inputs = processor(audio_input, sampling_rate=16000, return_tensors="pt").input_features
        with torch.no_grad():
            predicted_ids = model.generate(inputs)
        original_transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({"error": f"Error processing audio file with Whisper model: {str(e)}"}), 500

    try:
        mt_model_path = mt_model_paths[language_pair]
        mt_tokenizer = MarianTokenizer.from_pretrained(mt_model_path)
        mt_model = MarianMTModel.from_pretrained(mt_model_path)
        translation_inputs = mt_tokenizer(original_transcription, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            translated_ids = mt_model.generate(**translation_inputs)
        translated_transcription = mt_tokenizer.decode(translated_ids[0], skip_special_tokens=True)
    except Exception as e:
        return jsonify({"error": f"Error translating transcription: {str(e)}"}), 500

    tts_filepath = os.path.join(app.config['TTS_FOLDER'], 'tts_output.wav')
    try:
        tts.tts_to_file(text=translated_transcription, file_path=tts_filepath)
    except Exception as e:
        return jsonify({"error": f"Error generating TTS: {str(e)}"}), 500

    return jsonify({
        "original_transcription": original_transcription,
        "translated_transcription": translated_transcription,
        "tts_audio_file": '/tts_output.wav'
    })

@app.route('/<filename>')
def serve_tts_file(filename):
    return send_from_directory(app.config['TTS_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
