# 🌾 Sahayakisan - AI-Powered Farmer Assistant Chatbot

An intelligent, voice-enabled agriculture chatbot built with React, FastAPI, and LangChain to help farmers with crop advice, pest management, market prices, and government schemes in multiple Indian languages.

## ✨ Features

### 🎤 Voice & Multilingual Support

- **Voice Input**: Speak in Assamese, Hindi, or English
- **Speech Recognition**: Automatic speech-to-text using OpenAI Whisper
- **Language Detection**: Auto-detect language from voice input
- **Text-to-Speech Output**: Contextual voice responses in user's language
- **Recording Controls**: Visual mic feedback, stop speaking button

### 💬 Smart Chat Interface

- **Session Management**: Create, switch, rename, and delete chat sessions
- **Persistent History**: All conversations saved and retrievable
- **Real-time Responses**: Streaming AI responses with loading indicators
- **Thinking Animation**: Visual feedback during AI processing
- **User & AI Avatars**: Distinctive visual identification

### 🎨 User Experience

- **Modern Farmer Theme**: Clean, accessible UI with warm colors
- **Instagram-Inspired Gradients**: Vibrant visual design
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Ready**: Theme-based CSS variables for easy customization
- **Smooth Animations**: Fade-ins, slide-ups, pulse effects

### 🤖 AI Capabilities

- **Contextual Conversations**: Multi-turn dialogue with context memory
- **Farmer-Focused Advice**: Crop guidance, pest management, fertilizer recommendations
- **Local Language Understanding**: Natural responses in Assamese, Hindi, English
- **Intent Recognition**: Understands navigation requests and common queries

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework with hooks
- **Vite 7.2** - Lightning-fast build tool
- **React Router DOM 7.13** - Client-side routing
- **Axios** - HTTP client for API calls
- **Web Audio API** - Voice recording
- **Web Speech Synthesis API** - Text-to-speech

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database for sessions and messages
- **LangChain** - LLM orchestration and memory
- **Ollama** - Local LLM deployment
- **OpenAI Whisper** - Speech-to-text transcription
- **FFmpeg** - Audio codec handling

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (local or cloud)
- **FFmpeg** (for audio processing)
- **Ollama** (for local LLM - optional but recommended)

## 🚀 Installation & Setup

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd 07_chatbot
```

### 2. Backend Setup

```bash
cd backend

# Create Python environment
conda create -n chatbot python=3.10
conda activate chatbot

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017
# OLLAMA_API_URL=http://localhost:11434

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server (auto-proxies to backend)
npm run dev
# Opens at http://localhost:5173
```

### 4. Install FFmpeg (Required for Voice)

**Windows (PowerShell):**

```powershell
winget install ffmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

**Linux:**

```bash
sudo apt-get install ffmpeg
```

### 5. Set Up Ollama (Optional but Recommended)

```bash
# Download Ollama from https://ollama.ai
# Pull a model for local inference
ollama pull mistral
# Ollama runs on http://localhost:11434
```

## 📁 Project Structure

```
07_chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI setup, CORS, routers
│   │   ├── config.py            # Configuration
│   │   ├── api/
│   │   │   ├── chat.py          # Chat endpoint, session management
│   │   │   ├── speech.py        # STT transcription endpoint
│   │   │   └── auth.py          # Authentication (future)
│   │   ├── core/
│   │   │   ├── llm.py           # LLM setup with LangChain
│   │   │   └── memory.py        # Conversation memory
│   │   ├── db/
│   │   │   └── mongodb.py       # Database connection
│   │   └── utils/
│   │       └── helpers.py       # Utility functions
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx         # Main chat interface
│   │   │   └── Chat.css
│   │   ├── components/
│   │   │   ├── ChatInput.jsx    # Text & voice input
│   │   │   ├── Message.jsx      # Message display with avatars
│   │   │   ├── Sidebar.jsx      # Session manager
│   │   │   └── *.css            # Component styles
│   │   ├── context/
│   │   │   └── ChatContext.jsx  # Global state management
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── public/
│   │   └── chatbot.png          # AI avatar image
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite configuration with proxy
│   └── index.html               # HTML template
└── README.md
```

## 🔌 API Endpoints

### Chat Endpoints

- `POST /chat/` - Send message and get response
  - Payload: `{ "message": "...", "session_id": "...", "language": "hi|as|en" }`
  - Response: `{ "type": "TEXT", "reply": "...", "language": "..." }`

- `GET /chat/sessions` - List user sessions
- `GET /chat/messages/{session_id}` - Fetch session messages
- `POST /chat/session` - Create new session
- `DELETE /chat/session/{session_id}` - Delete session
- `PATCH /chat/session/{session_id}` - Rename session

### Speech Endpoints

- `POST /speech/transcribe` - Transcribe audio to text
  - Payload: `FormData { "file": AudioBlob }`
  - Response: `{ "text": "...", "language": "hi|as|en" }`

## 🎯 Usage

1. **Start Chatting**
   - Type a question or click the mic to speak
   - AI responds with contextual farming advice

2. **Voice Interaction**
   - Click the 🎤 button to record
   - Speak naturally in any supported language
   - Press ■ to stop, or wait for auto-stop
   - AI responds with voice + text

3. **Manage Sessions**
   - Click "New Chat" to start conversation
   - Rename sessions for easy tracking
   - Switch between sessions to view history
   - Delete sessions you no longer need

## 🔐 Environment Variables

Create `.env` in the `backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=sahayakisan

# LLM Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# API
CORS_ORIGINS=["http://localhost:5173"]
DEBUG=True
```

## 🧪 Testing

### Test Chat Endpoint

```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How to grow tomatoes?", "session_id": "test-session"}'
```

### Test Transcription

```bash
curl -X POST http://localhost:8000/speech/transcribe \
  -F "file=@audio.wav"
```

## 🚢 Deployment

### Backend (Heroku/Railway)

```bash
cd backend
# Use Procfile or configure platform settings
# Deploy with gunicorn: gunicorn app.main:app
```

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## 🛣️ Roadmap

### Phase 1 (Current)

- ✅ Voice chat interface
- ✅ Multilingual support (Assamese, Hindi, English)
- ✅ Session management
- ✅ Modern UI with animations

### Phase 2

- 🔲 Disease detection from crop photos
- 🔲 Real-time weather integration
- 🔲 Market price tracker
- 🔲 Government schemes database

### Phase 3

- 🔲 User authentication & profiles
- 🔲 Offline support (PWA)
- 🔲 Advanced analytics dashboard
- 🔲 Expert consultation booking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request
