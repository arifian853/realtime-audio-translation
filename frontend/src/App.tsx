import './App.css'
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { ReactMediaRecorder } from 'react-media-recorder';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(true)
      setTranscription(response.data.transcription);
      setLoading(false)
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    const formData = new FormData();
    const audioFile = new File([blob], 'audio.wav', { type: 'audio/wav' });
    formData.append('file', audioFile);

    try {
      const response = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Audio Transcriber</h1>

        <div>
          <h2>Upload Audio File</h2>
          <input type="file" accept="audio/*" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Transcribe</button>
        </div>

        <div>
          <h2>Record Audio</h2>
          <ReactMediaRecorder
            audio
            onStop={handleAudioUpload}
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
              <div>
                <p>{status}</p>
                <button onClick={startRecording}>Start Recording</button>
                <button onClick={stopRecording}>Stop Recording</button>
                <audio src={mediaBlobUrl ?? ''} controls />
              </div>
            )}
          />
        </div>

        {loading && <p>Loading...</p>}

        {transcription && (
          <div>
            <h2>Transcription:</h2>
            <p>{transcription}</p>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;

