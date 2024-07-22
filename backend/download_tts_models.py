# download_coqui_tts_model.py
from TTS.utils.manage import ModelManager

# Initialize the model manager
manager = ModelManager()

# Download the model
model_path = manager.download_model('tts_models/en/ljspeech/tacotron2-DDC')
vocoder_path = manager.download_model('vocoder_models/en/ljspeech/hifigan')

# Save the paths to a file for use in the Flask app
with open('tts_model_paths.txt', 'w') as f:
    f.write(f"{model_path}\n")
    f.write(f"{vocoder_path}\n")