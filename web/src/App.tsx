import './App.css'

import { Header } from './components-ui/Header'
import { ChatA } from './components-ui/ChatA'
import { ChatB } from './components-ui/ChatB'
// import { useState } from 'react'

// const [isReply, setIsReply] = useState('')

import { SpeakBtnA } from './components-ui/SpeakBtnA'
import { SpeakBtnB } from './components-ui/SpeakBtnB'

function App() {
  return (
    <>
      <Header />
      <br />
      <div className='h-[450px]'>
        <div className='flex justify-start'>
          <ChatA />
        </div>
        <div className='flex justify-end'>
          <ChatB />
        </div>
      </div>
      <div className='bg-[#B4C5E4] h-auto rounded-t-[40px] flex justify-center items-center md:gap-24 gap-3 p-7'>
        <SpeakBtnA />
        <SpeakBtnB />
      </div>
    </>
  )
}

export default App
