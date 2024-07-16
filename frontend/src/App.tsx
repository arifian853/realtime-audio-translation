import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from './components/ui/button';
import './App.css'

import { BsRecordFill } from "react-icons/bs";
import { BsStopFill } from "react-icons/bs";

const App: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const [language, setLanguage] = useState<string>('en'); // Default language
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
    formData.append('language', language); // Add the selected language to the form data

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
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
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  return (
    <div>
      <h1 className='p-5 m-5 bg-slate-700 text-white rounded-md'>Realtime Audio Translation</h1>
      <div className='flex m-5 gap-3'>
        <div className="p-5 bg-slate-700 text-white rounded-md flex w-1/2 flex-col gap-3">
          <Label htmlFor="file">Input local file (.wav)</Label>
          <Input className='text-black' id="file" type="file" accept="audio/*" onChange={handleFileChange} />
        </div>
        <div className="p-5 bg-slate-700 text-white rounded-md flex w-1/2 flex-col gap-3">
          <Label htmlFor="file">Record from microphone</Label>
          <div className='flex flex-row gap-4 justify-start items-center'>
            {recording ? (
              <Button className='flex items-center gap-2 justify center' onClick={handleStopRecording}>Stop Recording <span className='text-2xl'><BsStopFill /></span> </Button>
            ) : (
              <Button className='flex items-center gap-2 justify center' onClick={handleStartRecording}>Start Recording <span className='text-2xl'><BsRecordFill /></span> </Button>
            )}
            {
              recording ? (
                <p className='flex flex-row justify-center items-center gap-3'><span className='loader'></span>Recording....</p>
              ) : (
                " "
              )
            }
          </div>
        </div>
      </div>

      <div className="flex m-5 gap-3">
        <div className='p-5 bg-slate-700 text-white rounded-md w-full gap-3'>
          <Label htmlFor="Result">Record / File Result</Label>
          {audioSrc && (
            <div className='flex flex-row justify-center items-center'>
              <audio className='m-5' controls src={audioSrc}></audio>
              <Button onClick={handleTranscribe}>Transcribe</Button>
            </div>
          )}
        </div>
        <div className='p-5 bg-slate-700 text-white rounded-md flex w-full flex-col gap-3'>
          <Label>Transcription</Label>
          {loading ? (
            <p className='flex flex-row justify-start items-center gap-3'><span className='loader'></span>Loading....</p>
          ) : (
            <p>{transcription}</p>
          )}
        </div>
      </div>

      <div className="flex m-5 gap-3">
        <div className='p-5 bg-slate-700 text-white rounded-md flex w-full flex-col gap-3'>
          <Label htmlFor="language">Choose Language to translate</Label>
          <select id="language" className='text-black' value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <div className='p-5 bg-slate-700 text-white rounded-md flex w-full flex-col gap-3'>
          <Label>Translated Transcription (ex: ID to EN)</Label>
          TBA
        </div>
      </div>
      <div className='p-5 m-5 bg-slate-700 text-white rounded-md flex flex-col gap-3'>
          <Label>Translated Transcription Sound</Label>
          TBA
        </div>
    </div>
  );
};

export default App;
