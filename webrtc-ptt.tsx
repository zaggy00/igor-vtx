import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

const WebRTCPushToTalk = () => {
  const ws = useRef(null);
  const audioContext = useRef(new AudioContext());

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    
    ws.current.onmessage = async (event) => {
      const arrayBuffer = await event.data.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      source.start();
    };

    return () => ws.current?.close();
  }, []);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        audioChunks.current = [];
        // Here you would send audioBlob to your server
        console.log('Audio recorded, ready to send');
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const getButtonColor = () => {
    if (!isOnline) return 'bg-amber-500';
    return isRecording ? 'bg-red-500' : 'bg-green-500';
  };

  return (
    <div className="flex items-center justify-center h-64">
      <button
        className={`${getButtonColor()} w-32 h-32 rounded-full flex items-center justify-center 
        transition-colors duration-300 hover:opacity-90 focus:outline-none shadow-lg`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
      >
        <Mic className="w-16 h-16 text-white" />
      </button>
    </div>
  );
};

export default WebRTCPushToTalk;