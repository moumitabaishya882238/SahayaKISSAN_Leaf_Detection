# 🌾 Sahayakisan Frontend - React + Vite

Modern, voice-enabled chatbot interface for farmers built with React 19, Vite, and Web APIs.

## ✨ Features

- **Voice Chat**: Record and send voice messages with speech-to-text
- **Multilingual Support**: Assamese, Hindi, and English with auto-detection
- **Session Management**: Create, rename, and switch between conversations
- **Real-time Responses**: Streaming chat with thinking animations
- **Beautiful UI**: Modern farmer-themed design with Instagram gradients
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Fade-ins, slide-ups, and micro-interactions

## 🛠️ Tech Stack

- **React 19** - UI library with hooks
- **Vite 7.2** - Lightning-fast build tool with HMR
- **React Router DOM 7.13** - Client-side routing
- **Axios** - HTTP client for backend communication
- **Web Audio API** - Voice recording and processing
- **Web Speech Synthesis API** - Text-to-speech output
- **CSS Variables** - Theme customization

## 📦 Install & Run

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8000`

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend opens at http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview  # Local preview of production build
```

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── Chat.jsx              # Main chat interface with voice logic
│   └── Chat.css              # Chat page styling
├── components/
│   ├── ChatInput.jsx         # Text & voice input component
│   ├── ChatInput.css         # Input styling with gradients
│   ├── Message.jsx           # Message display with avatars
│   ├── Message.css           # Message bubble animations
│   ├── Sidebar.jsx           # Session manager
│   └── Sidebar.css           # Sidebar styling
├── context/
│   └── ChatContext.jsx       # Global state (sessions, messages)
├── services/
│   └── api.js                # Backend API client
├── App.jsx                   # Root component with routing
├── App.css                   # App layout (grid)
├── index.css                 # Global theme variables
└── main.jsx                  # Entry point
public/
└── chatbot.png               # AI avatar image
```

## 🎯 Key Components

### Chat.jsx
Main chat interface handling:
- Voice recording with MediaRecorder API
- Speech synthesis (TTS)
- Message sending and receiving
- Thinking animation display
- Voice status indicators

### Sidebar.jsx
Session management:
- List all chat sessions
- Create new conversations
- Rename sessions inline
- Delete with confirmation

### Message.jsx
Message display with:
- User & AI avatars
- Role-based styling (gradient vs sky-blue)
- Navigation intent buttons
- Thinking animation (bouncing dots)

### ChatInput.jsx
Input controls:
- Text input with Enter key support
- Mic button with recording state
- Send button with gradient
- Disabled states during loading

## 🎨 Theme Customization

Edit CSS variables in `index.css`:

```css
:root {
  --primary: #22c55e;          /* Primary green */
  --bg: #f5f3f0;               /* Background cream */
  --surface: #ffffff;          /* Card white */
  --text: #1a202c;             /* Text color */
  --radius: 16px;              /* Border radius */
  --shadow: 0 8px 24px ...;    /* Shadow depth */
}
```

## 🔌 API Integration

Backend proxy configured in `vite.config.js`:
- `/chat` → `http://localhost:8000`
- `/speech` → `http://localhost:8000`

### API Service (`api.js`)

```javascript
sendMessage(message, sessionId, language)
fetchSessions()
createSession()
deleteSession(sessionId)
renameSession(sessionId, title)
fetchMessages(sessionId)
transcribeAudio(audioBlob)
```

## 🎤 Voice Features

### Recording
- Click mic button to start
- Visual feedback (red pulsing button)
- Auto-stop on silence or manual stop
- Shows recording indicator

### Transcription
- Sends audio blob to backend
- Returns transcribed text + detected language
- Handles transcription errors gracefully

### Text-to-Speech
- Automatic response playback
- Language-aware voice selection
- Stop button to cancel playback
- "Listening..." and "Processing..." indicators

## 🚀 Deployment

### Vercel
```bash
npm run build
# Deploy the dist/ folder
```

### Netlify
```bash
npm run build
# Drag and drop dist/ to Netlify
# Configure environment for API calls
```

### Self-Hosted
```bash
npm run build
# Serve dist/ with any static server
# Configure proxy for API calls
```

## 📝 Scripts

- `npm run dev` - Start dev server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Voice not working
- Ensure backend is running on port 8000
- Check browser microphone permissions
- Verify FFmpeg installed on backend

### Messages not showing
- Check browser console for errors
- Verify MongoDB connection in backend
- Clear browser cache and reload

### Styles not updating
- Vite HMR might need restart: `npm run dev`
- Check CSS variables are correctly defined

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Submit pull request

## 📄 License

MIT License - Open source for agricultural development

---

**Built with ❤️ for farmers** 🌾
