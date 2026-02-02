# Adding Video to Splash Screen

## Quick Setup

### Step 1: Add Your Video File

1. Place your video file (e.g., `splash.mp4`, `intro.mp4`) in the `frontend/src/assets/` folder
2. Supported formats: `.mp4`, `.webm`, `.mov`

### Step 2: Update Splash.jsx

Uncomment and update these lines in `Splash.jsx`:

```jsx
// Uncomment this import at the top
import splashVideo from "../assets/splash.mp4"; // Change filename to match yours

// Uncomment this video element in the return statement
<video className="splash-video" autoPlay muted playsInline>
  <source src={splashVideo} type="video/mp4" />
  Your browser does not support the video tag.
</video>;
```

### Step 3: Adjust Timing (Optional)

Change the redirect timeout in `Splash.jsx`:

```jsx
const timer = setTimeout(() => {
  navigate("/home");
}, 5000); // Change 5000 to desired milliseconds (5000 = 5 seconds)
```

**Recommended timings:**

- Short video (3-5 seconds): `3000-5000`
- Medium video (5-10 seconds): `5000-10000`
- Auto-skip on video end: See "Advanced" section below

## Current Behavior

- **Route:** Splash appears at `/` (root)
- **Duration:** 5 seconds
- **Redirect:** Automatically redirects to `/home`
- **Visual:** Gradient background with animated logo and spinner

## Advanced: Skip on Video End

To redirect when video ends instead of fixed timeout:

```jsx
const handleVideoEnd = () => {
  navigate("/home");
};

return (
  <video
    className="splash-video"
    autoPlay
    muted
    playsInline
    onEnded={handleVideoEnd}
  >
    <source src={splashVideo} type="video/mp4" />
  </video>
);
```

## Advanced: Skip Button

Add a skip button for users:

```jsx
<button className="skip-button" onClick={() => navigate("/home")}>
  Skip →
</button>
```

CSS for skip button:

```css
.skip-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #ffffff;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  z-index: 10;
  transition: all 0.3s ease;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}
```

## Video File Naming Examples

If your video is named differently, update the import:

```jsx
// For splash-video.mp4
import splashVideo from "../assets/splash-video.mp4";

// For intro.webm
import splashVideo from "../assets/intro.webm";

// For logo-animation.mov
import splashVideo from "../assets/logo-animation.mov";
```

## Troubleshooting

**Video not playing?**

- Check file path is correct
- Ensure video file is in `src/assets/` folder
- Try different video format (.mp4 is most compatible)
- Check browser console for errors

**Video too large?**

- Compress video using tools like HandBrake
- Recommended size: < 10MB
- Recommended resolution: 1920x1080 or lower

**Redirect not working?**

- Check browser console for errors
- Verify React Router is installed
- Ensure `/home` route exists in App.jsx

## File Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── splash.mp4          ← Add your video here
│   ├── components/
│   │   ├── Splash.jsx          ← Already created
│   │   └── Splash.css          ← Already created
│   └── App.jsx                 ← Already updated
```

## Testing

1. Start frontend: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Should see splash screen for 5 seconds
4. Should auto-redirect to home page

---

**Status:** ✅ Splash Screen Created  
**Next Step:** Add your video file to `src/assets/` folder
