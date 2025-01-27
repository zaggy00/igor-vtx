// server.js
import WebSocket from 'ws';
import { Anthropic } from '@anthropic-ai/sdk';
import express from 'express';
import { Readable } from 'stream';
import speech from '@google-cloud/speech';
import TextToSpeech from '@google-cloud/text-to-speech';

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const speechClient = new speech.SpeechClient();
const ttsClient = new TextToSpeech.TextToSpeechClient();

wss.on('connection', (ws) => {
  let audioStream = new Readable();
  audioStream._read = () => {};

  const recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
      interimResults: false,
    })
    .on('error', console.error)
    .on('data', async (data) => {
      if (data.results[0]?.alternatives[0]) {
        const transcript = data.results[0].alternatives[0].transcript;
        
        // Get Claude's response
        const claudeResponse = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1024,
          messages: [{ role: "user", content: transcript }]
        });

        // Convert to speech
        const [ttsResponse] = await ttsClient.synthesizeSpeech({
          input: { text: claudeResponse.content[0].text },
          voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
          audioConfig: { audioEncoding: 'MP3' },
        });

        // Send audio back to client
        ws.send(ttsResponse.audioContent);
      }
    });

  ws.on('message', (chunk) => {
    audioStream.push(chunk);
    recognizeStream.write(chunk);
  });

  ws.on('close', () => {
    audioStream.destroy();
    recognizeStream.destroy();
  });
});

app.listen(3000);