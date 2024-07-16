// import React, { useRef, useEffect } from 'react';
// import WaveSurfer from 'wavesurfer.js';
// import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone';

// interface WaveformProps {
//   stream: MediaStream | null;
// }

// const Waveform: React.FC<WaveformProps> = ({ stream }) => {
//   const waveformRef = useRef<HTMLDivElement | null>(null);
//   const waveSurferRef = useRef<WaveSurfer | null>(null);

//   useEffect(() => {
//     if (waveformRef.current) {
//       waveSurferRef.current = WaveSurfer.create({
//         container: waveformRef.current,
//         waveColor: 'white',
//         progressColor: 'red',
//         cursorWidth: 0,
//         plugins: [
//           MicrophonePlugin.create({
//             bufferSize: 4096,
//             numberOfInputChannels: 1,
//             numberOfOutputChannels: 1,
//             constraints: {
//               video: false,
//               audio: true,
//             },
//           }),
//         ],
//       });

//       if (stream) {
//         const microphone = waveSurferRef.current.microphone;
//         if (microphone) {
//           microphone.start();
//         }
//       }
//     }

//     return () => {
//       if (waveSurferRef.current) {
//         const microphone = waveSurferRef.current.microphone;
//         if (microphone) {
//           microphone.stop();
//         }
//         waveSurferRef.current.destroy();
//       }
//     };
//   }, [stream]);

//   return <div ref={waveformRef} style={{ width: '100%', height: '100px' }} />;
// };

// export default Waveform;
