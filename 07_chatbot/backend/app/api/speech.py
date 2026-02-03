import os
import tempfile
from fastapi import APIRouter, UploadFile, File
import whisper

router = APIRouter()

# Load whisper model once
try:
    model = whisper.load_model("base")
except Exception as e:
    print(f"Warning: Whisper model failed to load: {e}")
    model = None


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if model is None:
        return {"text": "", "language": "en", "error": "Whisper model not loaded"}
    
    # Save uploaded audio to temp file
    suffix = os.path.splitext(file.filename or "audio.webm")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        data = await file.read()
        tmp.write(data)
        temp_path = tmp.name

    try:
        result = model.transcribe(temp_path)
        text = result.get("text", "").strip()
        language = result.get("language", "en")
        return {"text": text, "language": language}
    except Exception as e:
        print(f"Transcription error: {e}")
        return {"text": "", "language": "en", "error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
