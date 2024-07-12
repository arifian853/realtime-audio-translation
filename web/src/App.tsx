import './App.css';
import { Header } from './components-ui/Header';
import { HiSpeakerWave } from "react-icons/hi2";
import { US, ID, JP, KR, CN } from 'country-flag-icons/react/3x2';
import { FaMicrophone } from "react-icons/fa6";
import React, { useState, useRef } from "react";
import { MdExpandMore } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup
} from "@/components/ui/dropdown-menu";
import axios from 'axios';

function App() {
  const [language, setLanguage] = useState<string>("Indonesia");
  const [languageReply, setLanguageReply] = useState<string>("Indonesia");
  const [transcription, setTranscription] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: BlobPart[] = [];
        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks);
          setAudioBlob(audioBlob);
        });

        mediaRecorder.start();
        setIsRecording(true);
      });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert('No audio recorded');
      return;
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    const response = await axios.post('http://localhost:5000/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setTranscription(response.data.transcription);
  };

  return (
    <>
      <Header />
      <br />
      <div className='min-h-[70vh]'>
        <div className='flex justify-start'>
          <div className="flex items-center gap-2 m-3 mx-5">
            <div className="bg-[#B4C5E4] rounded-md p-3 w-auto">
              Selamat pagi, tuan! Semoga hari anda menyenangkan!
            </div>
            <span className="text-xl"><HiSpeakerWave /></span>
          </div>
        </div>
        <div className='flex justify-end'>
          <div className="flex items-center gap-2 m-3 mx-5">
            <span className="text-xl"><HiSpeakerWave /></span>
            <div className="bg-[#3066BE] rounded-md p-3 text-white w-auto">
              Good morning, sir! Have a nice day!
            </div>
          </div>
        </div>
      </div>
      <div className='bg-[#B4C5E4] max-h-64 rounded-t-[40px] flex justify-center items-center md:gap-24 gap-3 p-7'>
        <div className='text-center p-2'>
          <div className="flex gap-1 justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='w-24' variant="link"> <span className='md:text-xl text-md'><MdExpandMore /></span> <span className='md:text-md text-sm'>{language}</span>  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Indonesia">Indonesia <ID title="Indonesia" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="English">English (US) <US title="United States" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Japan">Japan <JP title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Korea">Korea <KR title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Chinese">Chinese <CN title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              className='md:w-[80px] w-[60px] md:h-[80px] h-[60px] rounded-full bg-[#090C9B]' 
              onMouseDown={handleStartRecording} 
              onMouseUp={handleStopRecording}
            >
              <span className='md:text-3xl text-2xl text-white flex justify-center items-center'>
                <FaMicrophone />
              </span>
            </button>
          </div>
          <br />
          <span className='text-sm'>Tahan untuk bicara</span>
        </div>

        <div className='text-center p-2'>
          <div className="flex gap-1 justify-center items-center">
            <button 
              className='md:w-[80px] w-[60px] md:h-[80px] h-[60px] rounded-full bg-[#090C9B]' 
              onMouseDown={handleStartRecording} 
              onMouseUp={handleStopRecording}
            >
              <span className='md:text-3xl text-2xl text-white flex justify-center items-center'>
                <FaMicrophone />
              </span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='w-24' variant="link"> <span className='md:text-md text-sm'>{languageReply}</span> <span className='md:text-xl text-md'><MdExpandMore /></span> </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={languageReply} onValueChange={setLanguageReply}>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Indonesia">Indonesia <ID title="Indonesia" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="English">English (US) <US title="United States" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Japan">Japan <JP title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Korea">Korea <KR title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className='flex gap-2 items-center' value="Chinese">Chinese <CN title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <br />
          <span className='text-sm'>Tahan untuk bicara</span>
        </div>
      </div>
      <button onClick={handleTranscribe} disabled={!audioBlob} className='btn'>
        Transcribe
      </button>
      <p>Transcription: {transcription}</p>
    </>
  )
}

export default App;
