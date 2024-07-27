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
  const [ttsAudioSrc, setTtsAudioSrc] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const [languagePair, setLanguagePair] = useState<string>('id-en'); // Default language
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileUpload = (file: Blob) => {
    setSelectedFile(file);
    const audioUrl = URL.createObjectURL(file);
    setAudioSrc(audioUrl);
  };

  const handleLanguageChange = (value: string) => {
    setLanguagePair(value);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile, 'audio.wav');
    formData.append('language', languagePair);

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOriginalTranscription(response.data.original_transcription);
      setTranslatedTranscription(response.data.translated_transcription);
      if (languagePair.endsWith("-en")) {
        setTtsAudioSrc(response.data.tts_audio_file ? `http://127.0.0.1:5000${response.data.tts_audio_file}` : '');
      } else {
        setTtsAudioSrc('');
      }
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

  const handleReset = () => {
    setAudioSrc('');
    setTtsAudioSrc('');
    setSelectedFile(null);
    setOriginalTranscription('');
    setTranslatedTranscription('');
  };

  return (
    <div>
      <h1 className='p-5 m-5 bg-slate-700 text-white rounded-md text-center'>Realtime Audio Translation</h1>
      <div className='flex m-5 gap-3'>
        <div className="p-5 bg-slate-700 text-white rounded-md flex w-1/2 flex-col gap-3">
          <Label htmlFor="file">Input local audio file</Label>
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
        <div className='p-5 bg-slate-700 rounded-md flex w-full flex-col gap-3'>
          <Label className="text-white" htmlFor="language">Choose Language to translate</Label>
          <Select onValueChange={handleLanguageChange} defaultValue={languagePair}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                <SelectItem value="id-en">Indonesian to English</SelectItem>
                <SelectItem value="en-id">English to Indonesian</SelectItem>
                <SelectItem value="fr-en">French to English</SelectItem>
                <SelectItem value="en-fr">English to French</SelectItem>
                <SelectItem value="es-en">Spanish to English</SelectItem>
                <SelectItem value="en-es">English to Spanish</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='p-5 bg-slate-700 text-white rounded-md w-full gap-3'>
          <Label htmlFor="Result">Record / File Result</Label>
          {audioSrc ? (
            <div className='flex flex-row justify-center items-center'>
              <audio className='m-5' controls src={audioSrc}></audio>
            </div>
          ) : (
            <div className='flex flex-row justify-center items-center'>
              Please record/add sound file
            </div>
          )

          }
        </div>
      </div>

      <div className="flex m-5 gap-3">
        <div className='p-5 bg-slate-700 text-white rounded-md flex w-full flex-col gap-3'>
          <Label>Original Transcription</Label>
          {loading ? (
            <p className='flex flex-row justify-start items-center gap-3'><span className='loader'></span>Loading....</p>
          ) : (
            <p>{originalTranscription ? (
              originalTranscription
            ) : (
              <div className='flex flex-row justify-center items-center'>
                Please record/add sound file
              </div>
            )}
            </p>
          )}
        </div>
        <div className='p-5 bg-slate-700 text-white rounded-md flex w-full flex-col gap-3'>
          <Label>Translated Transcription</Label>
          {loading ? (
            <p className='flex flex-row justify-start items-center gap-3'><span className='loader'></span>Loading....</p>
          ) : (
            <p>{translatedTranscription ? (
              translatedTranscription
            ) : (
              <div className='flex flex-row justify-center items-center'>
                Please record/add sound file
              </div>
            )}
            </p>
          )}
        </div>
      </div>
      <div className='m-5 p-5 bg-slate-700 text-white rounded-md flex flex-col gap-3'>
        <Label>Translated Voice</Label>
        {ttsAudioSrc ? (
          <div className='flex flex-row justify-center items-center'>
            <audio className='m-5' controls src={ttsAudioSrc}></audio>
          </div>
        ) : (
          <div className='flex flex-row justify-center items-center'>
            {languagePair.endsWith("-en") ? "Please process to get translated voice" : "Voice not available for this language pair"}
          </div>
        )}
      </div>
      <div className='p-5 flex justify-center w-full gap-4'>
        <Button onClick={handleTranscribe}>Process</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
};

export default App;
