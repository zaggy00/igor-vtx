# Igor-VTX: Voice Interface for Claude
     2	
     3	A real-time voice interface for Claude using WebRTC and streaming audio processing.
     4	
     5	## Features
     6	
     7	- Real-time voice input with push-to-talk
     8	- Direct communication with Claude-3
     9	- Speech-to-text and text-to-speech processing
    10	- Low-latency audio streaming
    11	- Simple web interface
    12	
    13	## Prerequisites
    14	
    15	- Node.js (v18 or later)
    16	- npm or yarn
    17	- Anthropic API key
    18	- OpenAI API key (for speech services)
    19	
    20	## Quick Start
    21	
    22	1. Clone the repository:
    23	   ```bash
    24	   git clone https://github.com/zaggy00/igor-vtx.git
    25	   cd igor-vtx
    26	   ```
    27	
    28	2. Install dependencies:
    29	   ```bash
    30	   # Install server dependencies
    31	   cd server
    32	   npm install
    33	
    34	   # Install client dependencies
    35	   cd ../client
    36	   npm install
    37	   ```
    38	
    39	3. Set up environment variables:
    40	   Create a `.env` file in the server directory:
    41	   ```env
    42	   ANTHROPIC_API_KEY=your_claude_api_key
    43	   OPENAI_API_KEY=your_openai_api_key
    44	   ```
    45	
    46	4. Start the development servers:
    47	   ```bash
    48	   # Terminal 1: Start the backend server
    49	   cd server
    50	   npm run dev
    51	
    52	   # Terminal 2: Start the frontend
    53	   cd client
    54	   npm run dev
    55	   ```
    56	
    57	5. Open your browser and navigate to `http://localhost:5173`
    58	
    59	## Development
    60	
    61	### Project Structure
    62	```
    63	igor-vtx/
    64	├── client/           # React frontend
    65	│   ├── src/
    66	│   │   ├── components/
    67	│   │   │   └── WebRTCPushToTalk.tsx
    68	│   │   ├── App.tsx
    69	│   │   └── index.tsx
    70	├── server/           # Node.js backend
    71	│   └── voice-server.js
    72	└── package.json
    73	```
    74	
    75	### Key Components
    76	
    77	- `WebRTCPushToTalk.tsx`: Main voice interface component
    78	- `voice-server.js`: WebSocket server handling audio processing and AI communication
    79	
    80	## Configuration
    81	
    82	### Environment Variables
    83	
    84	- `ANTHROPIC_API_KEY`: Your Claude API key from Anthropic
    85	- `OPENAI_API_KEY`: Your OpenAI API key for speech services
    86	
    87	## Troubleshooting
    88	
    89	### Common Issues
    90	
    91	1. **Microphone access denied**
    92	   - Ensure your browser has permission to access the microphone
    93	   - Check browser settings if the permission prompt doesn't appear
    94	
    95	2. **Audio not working**
    96	   - Verify your microphone is selected in browser settings
    97	   - Check if the correct audio input device is selected
    98	
    99	3. **Connection issues**
   100	   - Ensure both client and server are running
   101	   - Check console for WebSocket connection errors
   102	
   103	## License
   104	
   105	MIT License - See LICENSE file for details
Review the changes and make sure they are as expected. Edit the file again if necessary.