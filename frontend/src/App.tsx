import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from './components/ui/button';
import './App.css'

import { BsRecordFill } from "react-icons/bs";
import { BsStopFill } from "react-icons/bs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const App: React.FC = () => {
  const [originalTranscription, setOriginalTranscription] = useState<string>('');
  const [translatedTranscription, setTranslatedTranscription] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const [languagePair, setLanguagePair] = useState<string>('id-en'); // Default language pair
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileUpload = (file: Blob) => {
    setSelectedFile(file);
    const audioUrl = URL.createObjectURL(file);
    setAudioSrc(audioUrl);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile, 'audio.wav');
    formData.append('language', languagePair); // Add the selected language pair to the form data

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOriginalTranscription(response.data.original_transcription);
      setTranslatedTranscription(response.data.translated_transcription);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          handleFileUpload(audioBlob);
        };

        mediaRecorder.start();
        setRecording(true);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleLanguageChange = (value: string) => {
    setLanguagePair(value);
  };

  return (
    <div className="App">
      <h1>Audio Transcription and Translation</h1>
      <Label htmlFor="audio-upload" className="sr-only">Upload an audio file</Label>
      <Input
        id="audio-upload"
        type="file"
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
      <div className="audio-controls">
        {recording ? (
          <Button onClick={handleStopRecording}>
            <BsStopFill /> Stop Recording
          </Button>
        ) : (
          <Button onClick={handleStartRecording}>
            <BsRecordFill /> Start Recording
          </Button>
        )}
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
      <div className="language-select">
        <Select onValueChange={handleLanguageChange} defaultValue={languagePair}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              <SelectItem value="id-en">Indonesian to English</SelectItem>
              <SelectItem value="en-id">English to Indonesian</SelectItem>
              <SelectItem value="ja-en">Japanese to English</SelectItem>
              <SelectItem value="en-ja">English to Japanese</SelectItem>
              <SelectItem value="zh-en">Chinese to English</SelectItem>
              <SelectItem value="en-zh">English to Chinese</SelectItem>
              <SelectItem value="fr-en">French to English</SelectItem>
              <SelectItem value="en-fr">English to French</SelectItem>
              <SelectItem value="es-en">Spanish to English</SelectItem>
              <SelectItem value="en-es">English to Spanish</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleTranscribe} disabled={!selectedFile || loading}>
        {loading ? 'Transcribing...' : 'Transcribe and Translate'}
      </Button>
      {originalTranscription && (
        <div>
          <h2>Original Transcription</h2>
          <p>{originalTranscription}</p>
        </div>
      )}
      {translatedTranscription && (
        <div>
          <h2>Translated Transcription</h2>
          <p>{translatedTranscription}</p>
        </div>
      )}
    </div>
  );
};

export default App;
