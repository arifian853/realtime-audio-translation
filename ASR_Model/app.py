import pyaudio
import numpy as np
import torch
import librosa
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import wave

# Path to the model directory containing the model and tokenizer files
model_directory = "./whisper-small"

# Load the processor and model
processor = WhisperProcessor.from_pretrained(model_directory)
model = WhisperForConditionalGeneration.from_pretrained(model_directory)

# Define audio stream parameters
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
RECORD_SECONDS = 15
WAVE_OUTPUT_FILENAME = "output.wav"

audio = pyaudio.PyAudio()

# Start recording
stream = audio.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)

print("Recording... 15s")

frames = []

for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    frames.append(data)

print("Finished recording")

# Stop recording
stream.stop_stream()
stream.close()
audio.terminate()

# Save the recorded audio to a WAV file
waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
waveFile.setnchannels(CHANNELS)
waveFile.setsampwidth(audio.get_sample_size(FORMAT))
waveFile.setframerate(RATE)
waveFile.writeframes(b''.join(frames))
waveFile.close()

# Load the audio file using librosa
audio_input, sr = librosa.load(WAVE_OUTPUT_FILENAME, sr=RATE)

# Process the audio file
inputs = processor(audio_input, sampling_rate=RATE, return_tensors="pt").input_features

# Generate predictions
with torch.no_grad():
    predicted_ids = model.generate(inputs)

# Decode the predictions
transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

print("\n")
print("------------------------------------------")
print("Transcription:", transcription)
print("------------------------------------------")
print("\n")