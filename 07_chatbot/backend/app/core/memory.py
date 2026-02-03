from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from app.db.mongo import messages


def load_memory(session_id: str) -> ChatMessageHistory:
    chat_history = ChatMessageHistory()

    history = messages.find(
        {"session_id": session_id}
    ).sort("timestamp", 1)

    for msg in history:
        if msg["role"] == "user":
            chat_history.add_message(
                HumanMessage(content=msg["content"])
            )
        elif msg["role"] in ("assistant", "ai"):
            chat_history.add_message(
                AIMessage(content=msg["content"])
            )

    return chat_history
