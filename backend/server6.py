import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor, MarianMTModel, MarianTokenizer
from pydub import AudioSegment
from TTS.api import TTS

app = Flask(__name__)
CORS(app)

# Path to the Whisper model directory containing the model and tokenizer files
whisper_model_directory = "./whisper-small"

# Load the Whisper processor and model
processor = WhisperProcessor.from_pretrained(whisper_model_directory)
model = WhisperForConditionalGeneration.from_pretrained(whisper_model_directory)

# Path to save the audio file
WAVE_OUTPUT_FILENAME = "output.wav"
TTS_OUTPUT_FILENAME = "tts_output.wav"
RATE = 16000

# Define a dictionary mapping language pairs to the local path of the models
mt_model_paths = {
    'id-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-id-en',
    'en-id': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-id',
    'ja-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-ja-en',
    'en-ja': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-ja',
    'zh-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-zh-en',
    'en-zh': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-zh',
    'fr-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-fr-en',
    'en-fr': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-fr',
    'es-en': 'mt_pretrained_models/Helsinki-NLP_opus-mt-es-en',
    'en-es': 'mt_pretrained_models/Helsinki-NLP_opus-mt-en-es'
}

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    file.save(WAVE_OUTPUT_FILENAME)

    # Get the target language from the request, defaulting to 'id-en'
    language_pair = request.form.get('language', 'id-en')

    if language_pair not in mt_model_paths:
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
        mt_model_path = mt_model_paths[language_pair]
        mt_tokenizer = MarianTokenizer.from_pretrained(mt_model_path)
        mt_model = MarianMTModel.from_pretrained(mt_model_path)

        translation_inputs = mt_tokenizer(original_transcription, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            translated_ids = mt_model.generate(**translation_inputs)
        translated_transcription = mt_tokenizer.decode(translated_ids[0], skip_special_tokens=True)
    except Exception as e:
        return jsonify({"error": f"Error translating transcription: {str(e)}"}), 500

    # Convert the translated text to speech using Coqui TTS
    try:
        tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)
        tts.tts_to_file(text=translated_transcription, file_path=TTS_OUTPUT_FILENAME)
    except Exception as e:
        return jsonify({"error": f"Error generating TTS: {str(e)}"}), 500

    return jsonify({
        "original_transcription": original_transcription,
        "translated_transcription": translated_transcription,
        "tts_audio_path": TTS_OUTPUT_FILENAME
    })

if __name__ == '__main__':
    app.run(debug=True)