from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, chat, speech

app = FastAPI(title="Sahayakisan API")

# CORS (useful if not using Vite proxy)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5175"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(chat.router, prefix="/chat")
app.include_router(speech.router, prefix="/speech")