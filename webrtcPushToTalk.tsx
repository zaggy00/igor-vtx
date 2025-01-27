import React, { useEffect, useRef, useState } from 'react';
import { Button, Stack, Paper, Text } from '@mantine/core';

interface AudioState {
  isRecording: boolean;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
}

const WebRTCPushToTalk: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    stream: null,
    mediaRecorder: null,
  });
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:3000/ws');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'response') {
          setResponse(data.text);
          
          // Play audio response if available
          if (data.audio) {
            const audioBuffer = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
            const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            await audio.play();
            URL.revokeObjectURL(url);
          }
        } else if (data.type === 'error') {
          setError(data.message);
        }
      } catch (err) {
        console.error('Error processing message:', err);
        setError('Error processing response');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
          
          // Convert chunk to base64 and send
          const reader = new FileReader();
          reader.onload = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'audio',
                data: (reader.result as string).split(',')[1]
              }));
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'start' }));
        }
      };

      mediaRecorder.onstop = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'end' }));
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Collect data every 250ms

      setAudioState({
        isRecording: true,
        stream,
        mediaRecorder
      });
      
      setError('');

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (audioState.mediaRecorder && audioState.isRecording) {
      audioState.mediaRecorder.stop();
      if (audioState.stream) {
        audioState.stream.getTracks().forEach(track => track.stop());
      }
      setAudioState({
        isRecording: false,
        stream: null,
        mediaRecorder: null
      });
    }
  };

  return (
    <Stack align="center" mt="xl" spacing="xl">
      <Button
        size="xl"
        color={audioState.isRecording ? "red" : "blue"}
        onClick={audioState.isRecording ? stopRecording : startRecording}
      >
        {audioState.isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>

      {error && (
        <Paper p="md" shadow="sm" style={{ backgroundColor: '#ffebee' }}>
          <Text color="red">{error}</Text>
        </Paper>
      )}

      {response && (
        <Paper p="md" shadow="sm" w="80%">
          <Text>{response}</Text>
        </Paper>
      )}
    </Stack>
  );
};

export default WebRTCPushToTalk;