# Voice Advisory Feature Guide

## Overview

The system now automatically reads out disease advisory recommendations using text-to-speech after prediction.

## How It Works

### 🔊 Automatic Voice Playback

When a leaf disease prediction is completed:

1. ML model predicts the disease
2. Severity is calculated based on sensor data
3. Advisory recommendations are generated
4. **Voice automatically reads out:**
   - Disease name
   - Severity level
   - All recommended actions (numbered)

### Example Voice Output:

> "Prediction complete. Disease detected: Blister Blight. Severity level: medium. Recommended actions: 1. Apply recommended fungicide. 2. Improve airflow by pruning. 3. Reduce shade and leaf wetness. 4. Lower irrigation frequency. 5. Monitor all new shoots carefully."

## User Controls

### 🔊 Replay Advisory Button

- Appears after prediction is complete
- Click to hear the advisory recommendations again
- Useful if the user missed the first announcement

### 🔇 Stop Voice Button

- Appears while voice is speaking
- Click to stop the current speech immediately
- Useful if the user wants to skip the voice output

## Technical Details

### Browser Compatibility

Uses the **Web Speech API** (SpeechSynthesis):

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Mobile browsers (most support)

### Voice Settings

- **Rate:** 0.9 (slightly slower for clarity)
- **Pitch:** 1.0 (normal)
- **Volume:** 1.0 (full volume)
- **Language:** System default (usually English)

### No Internet Required

The speech synthesis uses the browser's built-in voices, so **no internet connection is required** for the voice feature to work.

## User Experience Flow

```
1. User uploads/captures leaf image
   ↓
2. Click "Scan & Predict"
   ↓
3. ML prediction + Severity calculation
   ↓
4. Advisory recommendations displayed
   ↓
5. 🔊 Voice automatically starts speaking
   ↓
6. User can:
   - Listen to full advisory
   - Stop voice (click 🔇 Stop Voice button)
   - Replay advisory (click 🔊 Replay Advisory button)
```

## Benefits

### For Farmers:

- **Hands-free:** Don't need to read recommendations
- **Accessibility:** Helps users who cannot read easily
- **Multilingual potential:** Can be extended to support local languages
- **Field-friendly:** Can listen while working

### For Extension Workers:

- **Training:** Can demonstrate the system audibly to groups
- **Clarity:** Ensures recommendations are clearly communicated
- **Documentation:** Voice confirms what actions to take

## Code Implementation

### Key Functions:

**`speakAdvisory(advisoryData, diseaseLabel, severityLevel)`**

- Prepares text from advisory recommendations
- Creates speech utterance
- Speaks using browser's speech synthesis

**`stopSpeaking()`**

- Cancels any ongoing speech
- Resets speaking state

**`replaySpeech()`**

- Replays the last advisory
- Uses stored result, severity, and advisory data

### State Management:

```javascript
const [isSpeaking, setIsSpeaking] = useState(false);
// Tracks whether voice is currently speaking
// Used to toggle between Replay/Stop buttons
```

### Event Handlers:

```javascript
utterance.onstart = () => setIsSpeaking(true); // Voice starts
utterance.onend = () => setIsSpeaking(false); // Voice ends
utterance.onerror = () => setIsSpeaking(false); // Error handling
```

## Customization Options

### Change Voice Speed:

```javascript
utterance.rate = 0.9; // 0.1 to 10 (0.9 = slightly slower)
```

### Change Voice Pitch:

```javascript
utterance.pitch = 1.0; // 0 to 2 (1.0 = normal)
```

### Change Volume:

```javascript
utterance.volume = 1.0; // 0 to 1 (1.0 = max)
```

### Select Different Voice:

```javascript
const voices = window.speechSynthesis.getVoices();
utterance.voice = voices[0]; // Choose specific voice
```

## Future Enhancements

### 1. Language Selection

Add support for local languages:

- Hindi
- Tamil
- Telugu
- Marathi
- Bengali

### 2. Voice Selection

Allow users to choose:

- Male/Female voice
- Different accents
- Speed preference

### 3. Audio Recording

Save voice output as audio file:

- For offline playback
- Share with other farmers
- Keep as record

### 4. Smart Pausing

Add intelligence:

- Pause between actions for clarity
- Emphasize important warnings
- Adjust speed based on severity

## Troubleshooting

### Voice not working?

1. **Check browser support:** Use Chrome, Edge, Firefox, or Safari
2. **Check volume:** Ensure device volume is not muted
3. **Check permissions:** Some browsers may require user interaction first
4. **Try manual replay:** Click the "🔊 Replay Advisory" button

### Voice in wrong language?

- The voice uses the browser's default language
- To change: Go to browser settings → Language preferences

### Voice too fast/slow?

- Adjust the `utterance.rate` value in the code
- Current setting: 0.9 (slightly slower than normal)

### Voice interrupted?

- Ensure only one speech is playing at a time
- The code automatically cancels previous speech before starting new one

## Accessibility Benefits

✅ **Visual impairment:** Users don't need to read the screen  
✅ **Literacy:** Helps users with limited reading ability  
✅ **Multitasking:** Listen while performing other tasks  
✅ **Learning:** Reinforces written recommendations aurally  
✅ **Group training:** Multiple people can listen together

## Testing Checklist

- [ ] Voice starts automatically after prediction
- [ ] Voice reads disease name correctly
- [ ] Voice reads severity level correctly
- [ ] Voice reads all actions with numbers
- [ ] "Stop Voice" button appears while speaking
- [ ] "Replay Advisory" button appears when not speaking
- [ ] Clicking "Stop Voice" stops speech immediately
- [ ] Clicking "Replay Advisory" plays speech again
- [ ] Reset button stops any ongoing speech
- [ ] No errors in browser console

---

**Status:** ✅ Voice Feature Implemented  
**Browser API:** Web Speech API (SpeechSynthesis)  
**Dependencies:** None (built-in browser feature)  
**Internet Required:** No
