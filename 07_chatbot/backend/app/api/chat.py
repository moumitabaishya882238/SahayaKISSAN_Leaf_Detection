from fastapi import APIRouter
from datetime import datetime
from bson import ObjectId

# MongoDB collections
from app.db.mongo import chat_sessions, messages

# LLM
from app.core.llm import llm

# Load chat history from DB
from app.core.memory import load_memory

# Navigation intent
from app.utils.navigation import detect_navigation_intent

router = APIRouter()

SYSTEM_PROMPT = """
You are Sahayakisan, an expert agriculture and tea farming assistant.

Rules:
- Answer only agriculture and tea related questions.
- Give practical, farmer-friendly advice.
- Use simple language.
- If unsure, say you don't know.
- Do not answer unrelated topics.
"""


# -----------------------------
# CHAT ENDPOINT
# -----------------------------
@router.post("/")
def chat(payload: dict):
    session_id = payload.get("session_id")
    user_message = payload.get("message")
    language = payload.get("language", "en")

    # 1️⃣ Check navigation intent first
    nav_response = detect_navigation_intent(user_message)
    if nav_response:
        nav_response["language"] = language
        return nav_response

    # 2️⃣ Load previous conversation from DB
    chat_history = load_memory(session_id)
    
    # 2a️⃣ Auto-title: if this is the first message, update session title
    try:
        oid = ObjectId(session_id)
        session = chat_sessions.find_one({"_id": oid})
        if session:
            # Check if this is the first message
            msg_count = messages.count_documents({"session_id": session_id})
            if msg_count == 0:
                # Generate title from first 50 chars of user message
                auto_title = user_message[:50].strip()
                if len(user_message) > 50:
                    auto_title += "..."
                chat_sessions.update_one({"_id": oid}, {"$set": {"title": auto_title}})
    except Exception:
        pass  # If session_id is not a valid ObjectId (e.g., local UUID), skip auto-titling

    # 3️⃣ Build conversation text
    conversation = "\n".join(
        msg.content for msg in chat_history.messages
    )

    language_name = {
        "hi": "Hindi",
        "as": "Assamese",
        "en": "English",
    }.get(language, "the user's language")

    full_prompt = (
        SYSTEM_PROMPT
        + f"\nRespond in {language_name}."
        + "\n" + conversation
        + "\nUser: " + user_message
    )

    # 4️⃣ Get AI response
    ai_response = llm.invoke(full_prompt)

    # 5️⃣ Save user message
    messages.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": user_message,
        "timestamp": datetime.utcnow()
    })

    # 6️⃣ Save AI response
    messages.insert_one({
        "session_id": session_id,
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.utcnow()
    })

    return {
        "type": "TEXT",
        "reply": ai_response,
        "language": language,
    }


# -----------------------------
# LIST SESSIONS
# -----------------------------
@router.get("/sessions")
def list_sessions(user_id: str | None = None, limit: int = 50):
    query = {}
    if user_id:
        query["user_id"] = user_id
    items = chat_sessions.find(query).sort("created_at", -1).limit(limit)
    sessions = [
        {
            "id": str(item.get("_id")),
            "title": item.get("title", "Untitled"),
            "user_id": item.get("user_id"),
            "created_at": item.get("created_at"),
        }
        for item in items
    ]
    return {"sessions": sessions}


# -----------------------------
# GET MESSAGES FOR SESSION
# -----------------------------
@router.get("/messages/{session_id}")
def get_messages(session_id: str):
    items = messages.find({"session_id": session_id}).sort("timestamp", 1)
    msg_list = [
        {
            "role": item.get("role"),
            "content": item.get("content"),
            "timestamp": item.get("timestamp"),
        }
        for item in items
    ]
    return {"messages": msg_list}


# -----------------------------
# DELETE SESSION
# -----------------------------
@router.delete("/session/{session_id}")
def delete_session(session_id: str):
    try:
        oid = ObjectId(session_id)
    except Exception:
        return {"status": "error", "message": "Invalid session id"}

    chat_sessions.delete_one({"_id": oid})
    messages.delete_many({"session_id": session_id})
    return {"status": "deleted"}


# -----------------------------
# RENAME SESSION
# -----------------------------
@router.patch("/session/{session_id}")
def rename_session(session_id: str, payload: dict):
    title = payload.get("title")
    if not title:
        return {"status": "error", "message": "Title required"}
    try:
        oid = ObjectId(session_id)
    except Exception:
        return {"status": "error", "message": "Invalid session id"}

    chat_sessions.update_one({"_id": oid}, {"$set": {"title": title}})
    return {"status": "renamed"}


# -----------------------------
# CREATE SESSION
# -----------------------------
@router.post("/session")
def create_session(payload: dict):
    user_id = payload.get("user_id", "local-user")
    title = payload.get("title", "New Chat")

    session = {
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow()
    }

    result = chat_sessions.insert_one(session)
    return {"session_id": str(result.inserted_id)}


# -----------------------------
# OPTIONAL: SAVE MESSAGE
# -----------------------------
@router.post("/message")
def save_message(session_id: str, role: str, content: str):
    messages.insert_one({
        "session_id": session_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    })

    return {"status": "saved"}
